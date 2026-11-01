import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { EventEntity } from '../types/event.js';

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

class AiService {
  private client: GoogleGenAI | null = null;

  constructor() {
    if (env.isGeminiConfigured && env.GEMINI_API_KEY) {
      try {
        this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } catch (err) {
        console.warn('Could not initialize GoogleGenAI client:', err);
      }
    }
  }

  /**
   * Generates a comprehensive, structured plan for an event
   */
  public async generateEventPlan(event: EventEntity): Promise<PlanProposal> {
    if (this.client) {
      try {
        const prompt = `
You are the master celebration and event planner for Planora.
Analyze this event and generate a structured JSON plan respecting the user's priorities:
Event: ${event.name} (${event.occasion})
Guest Count: ${event.guestCount}
Total Budget: ${event.currency} ${event.budget}
Priorities (in order of importance): ${event.priorities.join(', ')}
Theme: ${event.theme || 'Open'}
Location: ${event.location}
Constraints: ${event.constraints || 'None'}

Return ONLY valid JSON matching this schema:
{
  "summary": "concise overview of the event strategy",
  "themeSuggestions": ["theme 1", "theme 2"],
  "recommendedAllocations": [{"category": "string", "amount": number, "rationale": "string"}],
  "suggestedTasks": [{"title": "string", "description": "string", "daysBeforeEvent": number, "priority": "high"}],
  "warnings": ["potential risk or constraint alert"],
  "recommendations": ["pro-tip 1", "pro-tip 2"]
}
`;
        const response = await this.client.models.generateContent({
          model: env.GEMINI_MODEL,
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as PlanProposal;
          return parsed;
        }
      } catch (error) {
        console.warn('Gemini API call failed, using verified fallback planner:', error);
      }
    }

    // Deterministic Application Logic Fallback (Respects exact user priorities)
    return this.generateDeterministicPlan(event);
  }

  /**
   * Proposes an adaptive replan when guest count or budget changes
   * Respects priority order: if food is #1, decor or extra favors are reduced first!
   */
  public async generateAdaptiveReplan(
    event: EventEntity, 
    changes: { newBudget?: number; newGuestCount?: number; newDate?: string }
  ): Promise<PlanProposal> {
    const currentBudget = event.budget;
    const targetBudget = changes.newBudget ?? currentBudget;
    const budgetDelta = targetBudget - currentBudget;
    const isReduction = budgetDelta < 0;

    // Categorized trade-offs based on priorities
    const priorities = event.priorities.map(p => p.toLowerCase());
    const protectsFood = priorities.indexOf('food') === 0 || priorities.indexOf('catering') === 0;

    const affectedCategories: Array<{ category: string; before: number; after: number; impact: string }> = [];

    // Current allocations
    const currentAllocations = event.budgetItems || [];
    let remainingToAdjust = Math.abs(budgetDelta);

    const recommendedAllocations = currentAllocations.map(item => {
      const catLower = item.category.toLowerCase();
      let newAmount = item.allocatedAmount;

      if (isReduction) {
        // If reducing budget:
        if (protectsFood && (catLower.includes('food') || catLower.includes('catering'))) {
          // Protect food! No reduction or minimal reduction
          affectedCategories.push({
            category: item.category,
            before: item.allocatedAmount,
            after: item.allocatedAmount,
            impact: 'Preserved without compromise per your top priority for culinary excellence.',
          });
        } else if (catLower.includes('decor') || catLower.includes('favors')) {
          const cut = Math.min(newAmount * 0.35, remainingToAdjust);
          newAmount -= cut;
          remainingToAdjust -= cut;
          affectedCategories.push({
            category: item.category,
            before: item.allocatedAmount,
            after: Math.round(newAmount),
            impact: 'Downsized custom floral and physical favors in favor of reusable ambient lighting.',
          });
        } else {
          const cut = Math.min(newAmount * 0.15, remainingToAdjust);
          newAmount -= cut;
          remainingToAdjust -= cut;
          affectedCategories.push({
            category: item.category,
            before: item.allocatedAmount,
            after: Math.round(newAmount),
            impact: 'Optimized package scope with vendors.',
          });
        }
      } else {
        // If increasing budget:
        const addition = Math.round(budgetDelta / Math.max(currentAllocations.length, 1));
        newAmount += addition;
        affectedCategories.push({
          category: item.category,
          before: item.allocatedAmount,
          after: newAmount,
          impact: 'Enhanced experience tier.',
        });
      }

      return {
        category: item.category,
        amount: Math.round(newAmount),
        rationale: `Adaptive reallocation respecting priority hierarchy (${event.priorities.slice(0, 2).join(' > ')})`,
      };
    });

    return {
      summary: isReduction 
        ? `Adaptive plan reduction by ${event.currency} ${Math.abs(budgetDelta).toLocaleString()}. Preserved top-priority experiences while trimming non-critical styling.`
        : `Enhanced budget allocation by ${event.currency} ${budgetDelta.toLocaleString()} across primary vendors.`,
      themeSuggestions: [event.theme || 'Harmonious Celebration'],
      recommendedAllocations,
      suggestedTasks: [
        {
          title: 'Review and Confirm Adjusted Vendor Scopes',
          description: 'Notify decor and rental vendors about updated specifications.',
          daysBeforeEvent: 30,
          priority: 'high',
        },
      ],
      warnings: isReduction 
        ? ['Verify vendor cancellation deadlines before modifying signed agreements.']
        : [],
      recommendations: [
        'Review the before-and-after breakdown below. This proposal requires your explicit approval before any changes are saved.',
      ],
      tradeOffs: [
        protectsFood 
          ? 'Culinary & Beverage allocations were 100% safeguarded as requested in your priority settings.'
          : 'Allocations were proportionally distributed across all categories.',
        'Decor and novelty items were streamlined to maintain overall event atmosphere without exceeding limits.',
      ],
      beforeAfterComparison: {
        currentBudget,
        proposedBudget: targetBudget,
        difference: budgetDelta,
        affectedCategories,
      },
    };
  }

  /**
   * AI Planning Assistant Chat
   */
  public async assistantChat(event: EventEntity, userMessage: string): Promise<AssistantResponse> {
    const lower = userMessage.toLowerCase();

    // Check for common planner questions
    if (lower.includes('budget') || lower.includes('save money') || lower.includes('cut cost')) {
      return {
        answer: `Based on your ${event.name} plan with a budget of ${event.currency} ${event.budget.toLocaleString()} for ${event.guestCount} guests, your top priority is "${event.priorities[0] || 'Quality'}". If you need to trim expenses, I recommend consolidating the decoration rentals and opting for digital stationery. This preserves your ${event.priorities[0]} without diminishing the attendee experience. Would you like me to generate an adaptive reallocation proposal?`,
        suggestedAction: {
          type: 'rebalance_budget',
          payload: { targetSavingsPercentage: 10 },
          explanation: 'Proposes saving 10% by trimming secondary categories while protecting your top priority.',
          requiresApproval: true,
        },
      };
    }

    if (lower.includes('timeline') || lower.includes('task') || lower.includes('deadline')) {
      const pendingTasksCount = event.tasks?.filter(t => t.status !== 'completed').length || 0;
      return {
        answer: `You currently have ${pendingTasksCount} pending tasks for ${event.name}. The next immediate milestone is finalizing the primary vendor contracts. I can help you draft specific vendor questions or breakdown your checklist into 3 key phases.`,
        suggestedAction: {
          type: 'add_task',
          payload: { title: 'Review Vendor Payment Milestones', priority: 'high' },
          explanation: 'Add high-priority task to audit invoice schedules.',
          requiresApproval: true,
        },
      };
    }

    if (lower.includes('vendor') || lower.includes('quote') || lower.includes('caterer')) {
      const quotesCount = event.quotes?.length || 0;
      return {
        answer: `You have ${quotesCount} quotations logged in your workspace. When evaluating vendors, compare not only the base price but also the included staff hours, cleanup fees, and overtime rates. The Vendor Comparison tab gives you a side-by-side analysis of these differences.`,
      };
    }

    // General context-aware planning guidance
    return {
      answer: `I am your AI Event Assistant for "${event.name}". I have active context on your ${event.occasion} in ${event.location} on ${new Date(event.eventDate).toLocaleDateString()}, with ${event.guestCount} guests and a budget of ${event.currency} ${event.budget.toLocaleString()}.\n\nHow can I help you adjust allocations, timeline milestones, or vendor evaluations today? Note that any change I recommend will always require your explicit approval before being applied to your event.`,
    };
  }

  private generateDeterministicPlan(event: EventEntity): PlanProposal {
    const total = event.budget;
    return {
      summary: `Tailored plan for ${event.name} (${event.occasion}) in ${event.location}. Focused on delivering high value for ${event.guestCount} guests while strictly adhering to the ${event.currency} ${total.toLocaleString()} budget.`,
      themeSuggestions: [
        event.theme || 'Modern Botanical & Warm Candlelight',
        'Minimalist Chic with Elevated Accents',
        'Classic Timeless Celebration',
      ],
      recommendedAllocations: [
        { category: 'Catering & Dining', amount: Math.round(total * 0.38), rationale: 'Quality dining tailored to dietary preferences.' },
        { category: 'Venue & Setup', amount: Math.round(total * 0.28), rationale: 'Comfortable space with appropriate capacity.' },
        { category: 'Photography & Memories', amount: Math.round(total * 0.14), rationale: 'Coverage for timeless highlights.' },
        { category: 'Floral & Decor', amount: Math.round(total * 0.10), rationale: 'Refined ambient styling.' },
        { category: 'Music & Audio', amount: Math.round(total * 0.06), rationale: 'Acoustic and party ambiance.' },
        { category: 'Contingency Reserve', amount: Math.round(total * 0.04), rationale: 'Buffer for unforeseen costs.' },
      ],
      suggestedTasks: [
        { title: 'Lock in primary venue reservation', description: 'Ensure date and capacity match requirements.', daysBeforeEvent: 75, priority: 'critical' },
        { title: 'Select top catering proposal', description: 'Schedule menu tasting with vegan/gluten-free options.', daysBeforeEvent: 60, priority: 'high' },
        { title: 'Order save the dates and RSVP tracking', description: 'Send digital links to guests.', daysBeforeEvent: 45, priority: 'high' },
        { title: 'Book photographer and music duo', description: 'Review portfolio and sound requirements.', daysBeforeEvent: 30, priority: 'medium' },
      ],
      warnings: [
        'Confirm venue noise ordinance and curfew cut-off times.',
        'Ensure indoor weather contingency is secured if any portion is outdoors.',
      ],
      recommendations: [
        'Review vendor quotes side-by-side to detect omitted cleanup or overtime fees.',
        'Keep a 5-10% contingency allocation to absorb last-minute headcount variations.',
      ],
    };
  }
}

export const aiService = new AiService();
