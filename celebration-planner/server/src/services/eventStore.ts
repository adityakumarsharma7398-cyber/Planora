import { 
  EventEntity, 
  BudgetItem, 
  Expense, 
  Task, 
  Vendor, 
  VendorQuote, 
  PlanVersion 
} from '../types/event.js';
import crypto from 'crypto';

class EventStore {
  private events: Map<string, EventEntity> = new Map();
  private budgetItems: Map<string, BudgetItem> = new Map();
  private expenses: Map<string, Expense> = new Map();
  private tasks: Map<string, Task> = new Map();
  private vendors: Map<string, Vendor> = new Map();
  private quotes: Map<string, VendorQuote> = new Map();
  private planVersions: Map<string, PlanVersion> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const demoEventId = '11111111-1111-1111-1111-111111111111';
    const weddingEventId = '22222222-2222-2222-2222-222222222222';
    const galaEventId = '33333333-3333-3333-3333-333333333333';
    const now = new Date();

    // 1. Primary Demo Event: Aarav's Birthday (Matches Reference Image)
    const aaravEvent: EventEntity = {
      id: demoEventId,
      userId: '00000000-0000-0000-0000-000000000001',
      name: "Aarav's Birthday",
      occasion: 'Birthday',
      eventDate: '2024-11-14T18:30:00.000Z',
      location: 'The Grand Terrace, Delhi',
      guestCount: 50,
      budget: 100000,
      currency: 'INR',
      theme: 'Warm Golden Glow & Balloon Elegance',
      preferences: {
        cake_flavor: 'Belgian Chocolate Truffle',
        photography_style: 'Candid & Golden Hour',
        music: 'Acoustic lounge & Party pop',
      },
      priorities: ['venue', 'catering', 'decorations', 'photography', 'entertainment'],
      constraints: 'Rooftop terrace music curfew at 11 PM; indoor backup dining area reserved.',
      status: 'planning',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.events.set(demoEventId, aaravEvent);

    // Aarav Budget Items (₹1,00,000 total scope matching reference breakdown)
    const aaravAllocations = [
      { category: 'Venue', allocatedAmount: 35000, notes: 'The Grand Terrace terrace lounge fee' },
      { category: 'Catering', allocatedAmount: 25000, notes: 'Royal Caterers dinner buffet & appetizers' },
      { category: 'Decorations', allocatedAmount: 15000, notes: 'Dream Decor balloon arch & table styling' },
      { category: 'Photography', allocatedAmount: 10000, notes: 'Moments Studio 4-hr candid coverage' },
      { category: 'Entertainment', allocatedAmount: 8000, notes: 'Live acoustic singer & sound system' },
      { category: 'Others', allocatedAmount: 7000, notes: 'Custom cake, party favors & buffer' },
    ];
    aaravAllocations.forEach((item, index) => {
      const id = `b1111111-1111-1111-1111-${String(index + 1).padStart(12, '0')}`;
      this.budgetItems.set(id, {
        id,
        eventId: demoEventId,
        category: item.category,
        allocatedAmount: item.allocatedAmount,
        notes: item.notes,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });

    // Aarav Expenses (Total ₹68,000 spent = exactly 68% utilization matching reference!)
    const aaravExpenses = [
      { title: 'The Grand Terrace Venue Booking', category: 'Venue', amount: 35000, paid: true },
      { title: 'Royal Caterers Catering Advance', category: 'Catering', amount: 20000, paid: true },
      { title: 'Dream Decor Styling Retainer', category: 'Decorations', amount: 8000, paid: true },
      { title: 'Moments Studio Photography Retainer', category: 'Photography', amount: 5000, paid: true },
    ];
    aaravExpenses.forEach((exp, index) => {
      const id = `e1111111-1111-1111-1111-${String(index + 1).padStart(12, '0')}`;
      this.expenses.set(id, {
        id,
        eventId: demoEventId,
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        paid: exp.paid,
        paidAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });

    // Aarav Tasks (Matching reference timeline & task checklist)
    const aaravTasks: Array<{ title: string; category: string; dueDate: string; priority: Task['priority']; status: Task['status'] }> = [
      { title: 'Confirm venue booking', category: 'Venue', dueDate: '2024-10-28T10:00:00.000Z', priority: 'critical', status: 'pending' },
      { title: 'Finalize catering menu', category: 'Catering', dueDate: '2024-10-30T14:00:00.000Z', priority: 'high', status: 'in_progress' },
      { title: 'Send invitations', category: 'Invitations', dueDate: '2024-11-02T12:00:00.000Z', priority: 'high', status: 'pending' },
      { title: 'Arrange photography', category: 'Photography', dueDate: '2024-11-05T16:00:00.000Z', priority: 'medium', status: 'pending' },
      { title: 'Plan decorations', category: 'Decor', dueDate: '2024-11-08T15:00:00.000Z', priority: 'medium', status: 'pending' },
      { title: 'Finalize guest list', category: 'Planning', dueDate: '2024-11-10T18:00:00.000Z', priority: 'medium', status: 'pending' },
    ];
    aaravTasks.forEach((t, index) => {
      const id = `t1111111-1111-1111-1111-${String(index + 1).padStart(12, '0')}`;
      this.tasks.set(id, {
        id,
        eventId: demoEventId,
        title: t.title,
        description: `Category: ${t.category}`,
        dueDate: t.dueDate,
        priority: t.priority,
        status: t.status,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });

    // Aarav Vendors & Quotations (Matching reference vendors)
    const vendorsList = [
      { id: 'v1111111-0001', name: 'Royal Caterers', category: 'Catering', rating: 4.8, reviews: 120, price: 25000, rate: '₹1,200 / person', email: 'sales@royalcaterers.in' },
      { id: 'v1111111-0002', name: 'Dream Decor', category: 'Decorations', rating: 4.5, reviews: 86, price: 50000, rate: '₹50,000 package', email: 'hello@dreamdecor.in' },
      { id: 'v1111111-0003', name: 'Moments Studio', category: 'Photography', rating: 4.9, reviews: 210, price: 40000, rate: '₹40,000 package', email: 'moments@photostudio.in' },
      { id: 'v1111111-0004', name: 'The Grand Terrace', category: 'Venue', rating: 4.7, reviews: 95, price: 150000, rate: '₹1,50,000 venue', email: 'events@grandterrace.in' },
    ];
    vendorsList.forEach((v) => {
      this.vendors.set(v.id, {
        id: v.id,
        eventId: demoEventId,
        name: v.name,
        category: v.category,
        contactEmail: v.email,
        rating: v.rating,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
      const qId = `q-${v.id}`;
      this.quotes.set(qId, {
        id: qId,
        vendorId: v.id,
        vendorName: v.name,
        category: v.category,
        eventId: demoEventId,
        quotedPrice: v.price,
        includedServices: [`Official ${v.category} service`, 'Setup and cleanup', 'Dedicated event coordinator'],
        excludedServices: ['Overtime beyond midnight'],
        additionalFees: 0,
        availability: 'Available on celebration date',
        notes: `Rating: ${v.rating} (${v.reviews} reviews). Rate note: ${v.rate}`,
        selected: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });

    // 2. Event 2: Megha & Rohan Wedding (Sunset Palace, Jaipur)
    const weddingEvent: EventEntity = {
      id: weddingEventId,
      userId: '00000000-0000-0000-0000-000000000001',
      name: 'Megha & Rohan Wedding',
      occasion: 'Wedding',
      eventDate: '2025-02-28T17:00:00.000Z',
      location: 'Sunset Palace, Jaipur',
      guestCount: 250,
      budget: 1500000,
      currency: 'INR',
      theme: 'Royal Heritage & Candlelit Marigold',
      preferences: {
        mandap_decor: 'Sunset floral courtyard',
        cuisine: 'Royal Rajasthani & Continental',
      },
      priorities: ['venue', 'catering', 'photography', 'decorations', 'entertainment'],
      constraints: 'Heritage palace architectural preservation guidelines apply.',
      status: 'planning',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.events.set(weddingEventId, weddingEvent);

    this.expenses.set(`e2222222-0001`, {
      id: 'e2222222-0001',
      eventId: weddingEventId,
      title: 'Sunset Palace Venue Advance',
      category: 'Venue',
      amount: 450000,
      paid: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
    this.expenses.set(`e2222222-0002`, {
      id: 'e2222222-0002',
      eventId: weddingEventId,
      title: 'Heritage Decor Retainer',
      category: 'Decorations',
      amount: 225000,
      paid: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    this.tasks.set('t2222222-0001', {
      id: 't2222222-0001',
      eventId: weddingEventId,
      title: 'Review catering menu',
      description: 'Royal Rajasthani banquet tasting',
      dueDate: '2024-10-30T16:00:00.000Z',
      priority: 'high',
      status: 'in_progress',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    this.tasks.set('t2222222-0002', {
      id: 't2222222-0002',
      eventId: weddingEventId,
      title: 'Finalize bridal entry & sangeet playlist',
      description: 'Coordinate choreography sequence',
      dueDate: '2024-11-20T17:00:00.000Z',
      priority: 'medium',
      status: 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    // 3. Event 3: Community Gala (City Convention Center)
    const galaEvent: EventEntity = {
      id: galaEventId,
      userId: '00000000-0000-0000-0000-000000000001',
      name: 'Community Gala',
      occasion: 'Community',
      eventDate: '2025-04-12T19:00:00.000Z',
      location: 'City Convention Center',
      guestCount: 400,
      budget: 500000,
      currency: 'INR',
      theme: 'Celebrating Excellence & Community Harmony',
      preferences: {
        seating: 'Round banquet tables of 10',
        stage_av: 'Dual LED projection screens',
      },
      priorities: ['venue', 'catering', 'entertainment', 'photography'],
      constraints: 'City noise compliance and emergency fire exits verified.',
      status: 'planning',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.events.set(galaEventId, galaEvent);

    this.expenses.set(`e3333333-0001`, {
      id: 'e3333333-0001',
      eventId: galaEventId,
      title: 'Convention Hall Deposit',
      category: 'Venue',
      amount: 100000,
      paid: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    this.tasks.set('t3333333-0001', {
      id: 't3333333-0001',
      eventId: galaEventId,
      title: 'Arrange photography',
      description: 'Book gala photojournalism crew',
      dueDate: '2024-11-05T11:00:00.000Z',
      priority: 'medium',
      status: 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    this.tasks.set('t3333333-0002', {
      id: 't3333333-0002',
      eventId: galaEventId,
      title: 'Stage backdrop and AV setup',
      description: 'Audio mixer and LED screen installation',
      dueDate: '2025-01-15T10:00:00.000Z',
      priority: 'high',
      status: 'pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  }

  // Event Operations
  public listEvents(): EventEntity[] {
    return Array.from(this.events.values()).map(e => this.hydrateEvent(e));
  }

  public getEventById(id: string): EventEntity | null {
    const event = this.events.get(id);
    if (!event) return null;
    return this.hydrateEvent(event);
  }

  private hydrateEvent(event: EventEntity): EventEntity {
    const eventId = event.id;
    return {
      ...event,
      budgetItems: Array.from(this.budgetItems.values()).filter(b => b.eventId === eventId),
      expenses: Array.from(this.expenses.values()).filter(e => e.eventId === eventId),
      tasks: Array.from(this.tasks.values()).filter(t => t.eventId === eventId),
      vendors: Array.from(this.vendors.values()).filter(v => v.eventId === eventId),
      quotes: Array.from(this.quotes.values()).filter(q => q.eventId === eventId),
      planVersions: Array.from(this.planVersions.values()).filter(p => p.eventId === eventId),
    };
  }

  public createEvent(data: Omit<EventEntity, 'id' | 'createdAt' | 'updatedAt'>): EventEntity {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newEvent: EventEntity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(id, newEvent);

    // Auto-create initial recommended budget breakdown based on occasion and priorities
    this.createInitialBudgetBreakdown(newEvent);

    return this.hydrateEvent(newEvent);
  }

  private createInitialBudgetBreakdown(event: EventEntity) {
    const total = event.budget;
    // Standard baseline distribution ratios
    const ratios: Record<string, number> = {
      'Catering & Food': 0.38,
      'Venue & Setup': 0.28,
      'Photography & Media': 0.14,
      'Decor & Styling': 0.10,
      'Music & Entertainment': 0.06,
      'Contingency Buffer': 0.04,
    };

    Object.entries(ratios).forEach(([category, ratio]) => {
      const allocatedAmount = Math.round(total * ratio * 100) / 100;
      this.addBudgetItem(event.id, {
        eventId: event.id,
        category,
        allocatedAmount,
        notes: `Initial proposal for ${event.guestCount} guests`,
      });
    });

    // Create 3 standard essential kickoff tasks
    const eventDate = new Date(event.eventDate).getTime();
    const now = Date.now();
    const diff = Math.max(eventDate - now, 1000 * 60 * 60 * 24 * 7);

    this.addTask(event.id, {
      eventId: event.id,
      title: `Confirm ${event.location || 'Venue'} Booking`,
      description: 'Lock in date and safety compliance deposit.',
      dueDate: new Date(now + diff * 0.15).toISOString(),
      priority: 'critical',
      status: 'pending',
    });

    this.addTask(event.id, {
      eventId: event.id,
      title: 'Shortlist Vendors Matching Priorities',
      description: `Evaluate proposals prioritizing: ${event.priorities.join(', ')}`,
      dueDate: new Date(now + diff * 0.35).toISOString(),
      priority: 'high',
      status: 'pending',
    });

    this.addTask(event.id, {
      eventId: event.id,
      title: 'Send Guest RSVP Invitations',
      description: `Target headcount: ${event.guestCount} attendees`,
      dueDate: new Date(now + diff * 0.55).toISOString(),
      priority: 'high',
      status: 'pending',
    });
  }

  public updateEvent(id: string, updates: Partial<EventEntity>): EventEntity | null {
    const existing = this.events.get(id);
    if (!existing) return null;

    const updated: EventEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.events.set(id, updated);
    return this.hydrateEvent(updated);
  }

  public addBudgetItem(eventId: string, item: Omit<BudgetItem, 'id' | 'createdAt' | 'updatedAt'>): BudgetItem {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newItem: BudgetItem = {
      ...item,
      id,
      eventId,
      createdAt: now,
      updatedAt: now,
    };
    this.budgetItems.set(id, newItem);
    return newItem;
  }

  public updateBudgetItem(itemId: string, updates: Partial<BudgetItem>): BudgetItem | null {
    const existing = this.budgetItems.get(itemId);
    if (!existing) return null;
    const updated: BudgetItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.budgetItems.set(itemId, updated);
    return updated;
  }

  public addExpense(eventId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Expense {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id,
      eventId,
      createdAt: now,
      updatedAt: now,
    };
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  public updateExpense(expenseId: string, updates: Partial<Expense>): Expense | null {
    const existing = this.expenses.get(expenseId);
    if (!existing) return null;
    const updated: Expense = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.expenses.set(expenseId, updated);
    return updated;
  }

  public deleteExpense(expenseId: string): boolean {
    return this.expenses.delete(expenseId);
  }

  public addTask(eventId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id,
      eventId,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  public updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const existing = this.tasks.get(taskId);
    if (!existing) return null;
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      completedAt: updates.status === 'completed' ? new Date().toISOString() : existing.completedAt,
    };
    this.tasks.set(taskId, updated);
    return updated;
  }

  public deleteTask(taskId: string): boolean {
    return this.tasks.delete(taskId);
  }

  public addVendorQuote(eventId: string, quote: Omit<VendorQuote, 'id' | 'createdAt' | 'updatedAt'>): VendorQuote {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newQuote: VendorQuote = {
      ...quote,
      id,
      eventId,
      createdAt: now,
      updatedAt: now,
    };
    this.quotes.set(id, newQuote);
    return newQuote;
  }

  public deleteVendorQuote(quoteId: string): boolean {
    return this.quotes.delete(quoteId);
  }

  public addPlanVersion(eventId: string, plan: Omit<PlanVersion, 'id' | 'createdAt'>): PlanVersion {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newPlan: PlanVersion = {
      ...plan,
      id,
      eventId,
      createdAt: now,
    };
    this.planVersions.set(id, newPlan);
    return newPlan;
  }
}

export const eventStore = new EventStore();
