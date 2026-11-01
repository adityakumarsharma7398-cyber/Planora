-- ==============================================================================
-- Planora — AI-Powered Celebration Planner - Database Schema Migration
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occasion TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  budget NUMERIC(12, 2) NOT NULL CHECK (budget > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  theme TEXT,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Budget Items Table (Category-level allocations)
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated_amount NUMERIC(12, 2) NOT NULL CHECK (allocated_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Expenses Table (Actual payments and receipts)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  budget_item_id UUID REFERENCES public.budget_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  receipt_url TEXT,
  paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tasks Table (Event timelines and milestones)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_to TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  rating NUMERIC(3, 2),
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Vendor Quotes Table (Real quotations entered for comparison)
CREATE TABLE IF NOT EXISTS public.vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  quoted_price NUMERIC(12, 2) NOT NULL CHECK (quoted_price >= 0),
  included_services TEXT[] NOT NULL DEFAULT '{}',
  excluded_services TEXT[] NOT NULL DEFAULT '{}',
  additional_fees NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  availability TEXT,
  notes TEXT,
  selected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Plan Versions Table (Audit trail & adaptive plan snapshots)
CREATE TABLE IF NOT EXISTS public.plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  summary TEXT NOT NULL,
  plan_data JSONB NOT NULL,
  rationale TEXT,
  change_summary TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'proposed', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, version_number)
);

-- 9. AI Usage Table (Cost tracking and rate governance)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  operation TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(8, 6) NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- Ensures strict multi-tenant tenant isolation based on authenticated user ID
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Events Policies
CREATE POLICY "Users can manage own events"
  ON public.events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Budget Items Policies
CREATE POLICY "Users can manage budget items of own events"
  ON public.budget_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = budget_items.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = budget_items.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Expenses Policies
CREATE POLICY "Users can manage expenses of own events"
  ON public.expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = expenses.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = expenses.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Tasks Policies
CREATE POLICY "Users can manage tasks of own events"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = tasks.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = tasks.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Vendors Policies
CREATE POLICY "Users can manage vendors of own events"
  ON public.vendors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = vendors.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = vendors.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Vendor Quotes Policies
CREATE POLICY "Users can manage quotes of own events"
  ON public.vendor_quotes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = vendor_quotes.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = vendor_quotes.event_id
      AND events.user_id = auth.uid()
    )
  );

-- Plan Versions Policies
CREATE POLICY "Users can manage plan versions of own events"
  ON public.plan_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = plan_versions.event_id
      AND events.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = plan_versions.event_id
      AND events.user_id = auth.uid()
    )
  );

-- AI Usage Policies
CREATE POLICY "Users can view own AI usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI usage"
  ON public.ai_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_event_id ON public.budget_items(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON public.expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON public.vendors(event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_quotes_event_id ON public.vendor_quotes(event_id);
CREATE INDEX IF NOT EXISTS idx_plan_versions_event_id ON public.plan_versions(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_event_id ON public.ai_usage(event_id);
