import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eventStore } from '../services/eventStore.js';
import { aiService } from '../services/aiService.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Validation Schemas
const createEventSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters'),
  occasion: z.enum(['Wedding', 'Birthday', 'Community', 'Anniversary', 'Corporate', 'Other']),
  eventDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid ISO date' }),
  location: z.string().min(2, 'Location is required'),
  guestCount: z.coerce.number().int().positive('Guest count must be greater than 0'),
  budget: z.coerce.number().positive('Budget must be greater than 0'),
  currency: z.string().default('USD'),
  theme: z.string().optional(),
  preferences: z.record(z.unknown()).default({}),
  priorities: z.array(z.string()).default(['food', 'venue', 'photography']),
  constraints: z.string().optional(),
});

const createExpenseSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  amount: z.coerce.number().positive(),
  paid: z.boolean().default(false),
  budgetItemId: z.string().optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  dueDate: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

const createQuoteSchema = z.object({
  vendorName: z.string().min(2),
  category: z.string().min(2),
  quotedPrice: z.coerce.number().positive(),
  includedServices: z.array(z.string()).default([]),
  excludedServices: z.array(z.string()).default([]),
  additionalFees: z.coerce.number().default(0),
  availability: z.string().optional(),
  notes: z.string().optional(),
});

// Helper to safely get string param
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
}

// GET /api/v1/events
router.get('/', (_req: Request, res: Response) => {
  const events = eventStore.listEvents();
  res.json({ success: true, data: events });
});

// POST /api/v1/events
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createEventSchema.parse(req.body);
    const newEvent = eventStore.createEvent({
      ...validated,
      userId: '00000000-0000-0000-0000-000000000001',
      status: 'planning',
    });
    res.status(201).json({ success: true, data: newEvent });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/events/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  const eventId = getParam(req.params.id);
  const event = eventStore.getEventById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404, 'NOT_FOUND'));
  }
  res.json({ success: true, data: event });
});

// PUT /api/v1/events/:id
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params.id);
    const updated = eventStore.updateEvent(eventId, req.body);
    if (!updated) {
      return next(new AppError('Event not found', 404, 'NOT_FOUND'));
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/expenses
router.post('/:id/expenses', (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params.id);
    const event = eventStore.getEventById(eventId);
    if (!event) return next(new AppError('Event not found', 404, 'NOT_FOUND'));

    const validated = createExpenseSchema.parse(req.body);
    const expense = eventStore.addExpense(eventId, {
      ...validated,
      eventId,
    });
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/events/:id/expenses/:expenseId
router.delete('/:id/expenses/:expenseId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const expenseId = getParam(req.params.expenseId);
    const success = eventStore.deleteExpense(expenseId);
    if (!success) return next(new AppError('Expense not found', 404, 'NOT_FOUND'));
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/tasks
router.post('/:id/tasks', (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params.id);
    const event = eventStore.getEventById(eventId);
    if (!event) return next(new AppError('Event not found', 404, 'NOT_FOUND'));

    const validated = createTaskSchema.parse(req.body);
    const task = eventStore.addTask(eventId, {
      ...validated,
      eventId,
      status: 'pending',
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/events/:id/tasks/:taskId
router.patch('/:id/tasks/:taskId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = getParam(req.params.taskId);
    const updated = eventStore.updateTask(taskId, req.body);
    if (!updated) return next(new AppError('Task not found', 404, 'NOT_FOUND'));
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/events/:id/tasks/:taskId
router.delete('/:id/tasks/:taskId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = getParam(req.params.taskId);
    const success = eventStore.deleteTask(taskId);
    if (!success) return next(new AppError('Task not found', 404, 'NOT_FOUND'));
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/vendor-quotes
router.post('/:id/vendor-quotes', (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params.id);
    const event = eventStore.getEventById(eventId);
    if (!event) return next(new AppError('Event not found', 404, 'NOT_FOUND'));

    const validated = createQuoteSchema.parse(req.body);
    const quote = eventStore.addVendorQuote(eventId, {
      ...validated,
      eventId,
      vendorId: crypto.randomUUID(),
      selected: false,
    });
    res.status(201).json({ success: true, data: quote });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/events/:id/vendor-quotes/:quoteId
router.delete('/:id/vendor-quotes/:quoteId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const quoteId = getParam(req.params.quoteId);
    const success = eventStore.deleteVendorQuote(quoteId);
    if (!success) return next(new AppError('Vendor quote not found', 404, 'NOT_FOUND'));
    res.json({ success: true, message: 'Vendor quote deleted successfully' });
  } catch (err) {
    next(err);
  }
});


// AI Operations
// POST /api/v1/events/:id/ai/plan
router.post('/:id/ai/plan', aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params.id);
    const event = eventStore.getEventById(eventId);
    if (!event) return next(new AppError('Event not found', 404, 'NOT_FOUND'));

    const plan = await aiService.generateEventPlan(event);
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/ai/replan
router.post('/:id/ai/replan', aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params.id);
    const event = eventStore.getEventById(eventId);
    if (!event) return next(new AppError('Event not found', 404, 'NOT_FOUND'));

    const replanProposal = await aiService.generateAdaptiveReplan(event, req.body);
    res.json({ success: true, data: replanProposal });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/ai/approve-replan
// Enforces product rule: user must approve before committing changes to saved event
router.post('/:id/ai/approve-replan', (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params.id);
    const event = eventStore.getEventById(eventId);
    if (!event) return next(new AppError('Event not found', 404, 'NOT_FOUND'));

    const { newBudget, recommendedAllocations, rationale } = req.body;
    if (!newBudget || !recommendedAllocations) {
      return next(new AppError('Missing required approval payload', 400, 'BAD_REQUEST'));
    }

    // 1. Snapshot current version in plan_versions audit trail
    const existingVersions = event.planVersions?.length || 0;
    eventStore.addPlanVersion(event.id, {
      eventId: event.id,
      versionNumber: existingVersions + 1,
      summary: `Approved plan adaptation to ${event.currency} ${newBudget}`,
      planData: {
        previousBudget: event.budget,
        newBudget,
        allocations: recommendedAllocations,
      },
      rationale: rationale || 'User approved adaptive trade-off proposal',
      status: 'approved',
    });

    // 2. Commit updated event budget
    eventStore.updateEvent(event.id, { budget: newBudget });

    // 3. Return refreshed event entity
    const refreshed = eventStore.getEventById(event.id);
    res.json({ success: true, data: refreshed, message: 'Adaptive plan successfully approved and saved.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/events/:id/ai/chat
router.post('/:id/ai/chat', aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = getParam(req.params.id);
    const event = eventStore.getEventById(eventId);
    if (!event) return next(new AppError('Event not found', 404, 'NOT_FOUND'));

    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return next(new AppError('Chat message is required', 400, 'BAD_REQUEST'));
    }

    const reply = await aiService.assistantChat(event, message);
    res.json({ success: true, data: reply });
  } catch (err) {
    next(err);
  }
});

export default router;
