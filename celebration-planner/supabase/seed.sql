-- ==============================================================================
-- Planora — AI-Powered Celebration Planner - Seed Data
-- ==============================================================================

-- 1. Demo Profile (Matching a test user)
INSERT INTO public.profiles (id, email, full_name, avatar_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'planner.demo@planora.dev',
  'Alex Rivera',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
) ON CONFLICT (id) DO NOTHING;

-- 2. Demo Event: Modern Garden Wedding Celebration
INSERT INTO public.events (
  id,
  user_id,
  name,
  occasion,
  event_date,
  location,
  guest_count,
  budget,
  currency,
  theme,
  preferences,
  priorities,
  constraints,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Sophia & Liam''s Sunset Garden Wedding',
  'Wedding',
  NOW() + INTERVAL '90 days',
  'Botanical Garden Pavilion, Austin, TX',
  120,
  18000.00,
  'USD',
  'Warm Botanical & Candlelit Minimalist',
  '{"outdoor_ceremony": true, "dietary_restrictions": ["vegan", "gluten-free"], "music_style": "indie acoustic and jazz"}',
  '["food", "venue", "photography", "decorations", "entertainment"]',
  'Strict cut-off at 11 PM due to botanical garden noise ordinances; rain contingency indoor hall needed.',
  'planning'
) ON CONFLICT (id) DO NOTHING;

-- 3. Budget Allocations
INSERT INTO public.budget_items (id, event_id, category, allocated_amount, notes) VALUES
('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-111111111111', 'Venue', 5500.00, 'Garden pavilion + indoor backup hall rental'),
('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-111111111111', 'Catering & Drinks', 6500.00, 'Buffet with vegan options + open bar package'),
('22222222-2222-2222-2222-000000000003', '11111111-1111-1111-1111-111111111111', 'Photography & Video', 2500.00, '8-hour coverage + drone ceremony shots'),
('22222222-2222-2222-2222-000000000004', '11111111-1111-1111-1111-111111111111', 'Decorations & Floral', 1800.00, 'Fairy lights, eucalyptus runners, botanical arch'),
('22222222-2222-2222-2222-000000000005', '11111111-1111-1111-1111-111111111111', 'Music & Entertainment', 1200.00, 'Live acoustic duo for ceremony + DJ for reception'),
('22222222-2222-2222-2222-000000000006', '11111111-1111-1111-1111-111111111111', 'Contingency & Favors', 500.00, 'Emergency buffer and guest seed packet favors')
ON CONFLICT (id) DO NOTHING;

-- 4. Actual Expenses Logged
INSERT INTO public.expenses (id, event_id, budget_item_id, title, category, amount, paid, paid_at) VALUES
('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000001', 'Pavilion Deposit', 'Venue', 2000.00, true, NOW() - INTERVAL '10 days'),
('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-000000000003', 'Photographer Retainer', 'Photography & Video', 800.00, true, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- 5. Preparation Tasks
INSERT INTO public.tasks (id, event_id, title, description, due_date, priority, status) VALUES
('44444444-4444-4444-4444-000000000001', '11111111-1111-1111-1111-111111111111', 'Finalize Catering Tasting Menu', 'Schedule tasting session with top 2 catering finalists', NOW() + INTERVAL '14 days', 'high', 'in_progress'),
('44444444-4444-4444-4444-000000000002', '11111111-1111-1111-1111-111111111111', 'Send Digital Save the Dates', 'Dispatch invitations to 120 guests with dietary RSVP link', NOW() + INTERVAL '20 days', 'critical', 'pending'),
('44444444-4444-4444-4444-000000000003', '11111111-1111-1111-1111-111111111111', 'Review Floral & Lighting Mockups', 'Approve floral arch dimensions and fairy light placements', NOW() + INTERVAL '35 days', 'medium', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 6. Vendors & Quotes
INSERT INTO public.vendors (id, event_id, name, category, contact_email, rating) VALUES
('55555555-5555-5555-5555-000000000001', '11111111-1111-1111-1111-111111111111', 'Artisan Table Caterers', 'Catering', 'events@artisantable.com', 4.9),
('55555555-5555-5555-5555-000000000002', '11111111-1111-1111-1111-111111111111', 'Hill Country Feast Co.', 'Catering', 'hello@hillcountryfeast.com', 4.7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vendor_quotes (
  id,
  vendor_id,
  event_id,
  quoted_price,
  included_services,
  excluded_services,
  additional_fees,
  availability,
  notes,
  selected
) VALUES 
(
  '66666666-6666-6666-6666-000000000001',
  '55555555-5555-5555-5555-000000000001',
  '11111111-1111-1111-1111-111111111111',
  6200.00,
  ARRAY['3-course plated meal', '4 waitstaff', 'table linens and glassware', 'cake cutting service'],
  ARRAY['Alcoholic beverages', 'cleanup fee after midnight'],
  350.00,
  'Available on selected wedding date',
  'Includes custom dietary meals for vegan & celiac guests without surcharge.',
  false
),
(
  '66666666-6666-6666-6666-000000000002',
  '55555555-5555-5555-5555-000000000002',
  '11111111-1111-1111-1111-111111111111',
  5600.00,
  ARRAY['Buffet style dinner', '2 bar staff', 'compostable premium dinnerware'],
  ARRAY['Linens', 'plated service', 'tasting session'],
  500.00,
  'Available on selected wedding date',
  'Lower base quote but requires renting table linens and separate tasting fee ($150).',
  false
) ON CONFLICT (id) DO NOTHING;
