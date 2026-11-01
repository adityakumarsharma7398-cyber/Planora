export type OccasionType = 'Wedding' | 'Birthday' | 'Community' | 'Anniversary' | 'Corporate' | 'Other';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type EventStatus = 'planning' | 'confirmed' | 'completed' | 'cancelled';

export interface BudgetItem {
  id: string;
  eventId: string;
  category: string;
  allocatedAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  eventId: string;
  budgetItemId?: string;
  title: string;
  category: string;
  amount: number;
  receiptUrl?: string;
  paid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  category: string;
  contactEmail?: string;
  contactPhone?: string;
  rating?: number;
  website?: string;
}

export interface VendorQuote {
  id: string;
  vendorId: string;
  vendorName: string;
  category?: string;
  eventId: string;
  quotedPrice: number;
  includedServices: string[];
  excludedServices: string[];
  additionalFees: number;
  availability?: string;
  notes?: string;
  selected: boolean;
}

export interface PlanVersion {
  id: string;
  eventId: string;
  versionNumber: number;
  summary: string;
  planData: Record<string, unknown>;
  rationale?: string;
  changeSummary?: string;
  status: 'draft' | 'proposed' | 'approved' | 'rejected';
  createdAt: string;
}

export interface EventEntity {
  id: string;
  userId: string;
  name: string;
  occasion: OccasionType;
  eventDate: string;
  location: string;
  guestCount: number;
  budget: number;
  currency: string;
  theme?: string;
  preferences: Record<string, unknown>;
  priorities: string[];
  constraints?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;

  budgetItems?: BudgetItem[];
  expenses?: Expense[];
  tasks?: Task[];
  vendors?: Vendor[];
  quotes?: VendorQuote[];
  planVersions?: PlanVersion[];
}

export interface PlanProposal {
  summary: string;
  themeSuggestions: string[];
  recommendedAllocations: Array<{ category: string; amount: number; rationale: string }>;
  suggestedTasks: Array<{ title: string; description: string; daysBeforeEvent: number; priority: 'low' | 'medium' | 'high' | 'critical' }>;
  warnings: string[];
  recommendations: string[];
  tradeOffs?: string[];
  beforeAfterComparison?: {
    currentBudget: number;
    proposedBudget: number;
    difference: number;
    affectedCategories: Array<{ category: string; before: number; after: number; impact: string }>;
  };
}

export interface AssistantResponse {
  answer: string;
  suggestedAction?: {
    type: 'rebalance_budget' | 'add_task' | 'update_constraint';
    payload: Record<string, unknown>;
    explanation: string;
    requiresApproval: boolean;
  };
}
