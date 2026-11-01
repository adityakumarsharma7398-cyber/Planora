import { EventEntity, Expense, Task, VendorQuote, PlanProposal, AssistantResponse } from '../types/event';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await response.json();
  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return json.data as T;
}

export const api = {
  // System Health
  getHealth: async () => {
    return request<Record<string, unknown>>('/health');
  },

  // Events
  getEvents: async (): Promise<EventEntity[]> => {
    return request<EventEntity[]>('/events');
  },

  getEventById: async (id: string): Promise<EventEntity> => {
    return request<EventEntity>(`/events/${id}`);
  },

  createEvent: async (payload: Partial<EventEntity>): Promise<EventEntity> => {
    return request<EventEntity>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateEvent: async (id: string, payload: Partial<EventEntity>): Promise<EventEntity> => {
    return request<EventEntity>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Expenses
  addExpense: async (eventId: string, payload: Partial<Expense>): Promise<Expense> => {
    return request<Expense>(`/events/${eventId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteExpense: async (eventId: string, expenseId: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/events/${eventId}/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },

  // Tasks
  addTask: async (eventId: string, payload: Partial<Task>): Promise<Task> => {
    return request<Task>(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateTask: async (eventId: string, taskId: string, payload: Partial<Task>): Promise<Task> => {
    return request<Task>(`/events/${eventId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteTask: async (eventId: string, taskId: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/events/${eventId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Vendor Quotes
  addVendorQuote: async (eventId: string, payload: Partial<VendorQuote>): Promise<VendorQuote> => {
    return request<VendorQuote>(`/events/${eventId}/vendor-quotes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteVendorQuote: async (eventId: string, quoteId: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/events/${eventId}/vendor-quotes/${quoteId}`, {
      method: 'DELETE',
    });
  },

  // AI Operations
  generatePlan: async (eventId: string): Promise<PlanProposal> => {
    return request<PlanProposal>(`/events/${eventId}/ai/plan`, {
      method: 'POST',
    });
  },

  adaptiveReplan: async (
    eventId: string,
    changes: { newBudget?: number; newGuestCount?: number; newDate?: string }
  ): Promise<PlanProposal> => {
    return request<PlanProposal>(`/events/${eventId}/ai/replan`, {
      method: 'POST',
      body: JSON.stringify(changes),
    });
  },

  approveReplan: async (
    eventId: string,
    payload: { newBudget: number; recommendedAllocations: Array<{ category: string; amount: number; rationale: string }>; rationale?: string }
  ): Promise<EventEntity> => {
    return request<EventEntity>(`/events/${eventId}/ai/approve-replan`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  sendAiChat: async (eventId: string, message: string): Promise<AssistantResponse> => {
    return request<AssistantResponse>(`/events/${eventId}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};
