import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AlexText } from '../components/AlexText';
import { api } from '../services/api';
import { EventEntity, Task } from '../types/event';
import { 
  Calendar, 
  Wallet, 
  CheckSquare, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [searchFilter, setSearchFilter] = useState<string>(searchParams.get('search') || '');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchFilter(q);
    }
  }, [searchParams]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents();
      setEvents(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (eventId: string, taskId: string, currentStatus: Task['status']) => {
    try {
      const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await api.updateTask(eventId, taskId, { status: nextStatus });
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  // Calculations from actual backend data
  const totalEvents = events.length;
  const totalBudget = events.reduce((acc, ev) => acc + (ev.budget || 0), 0);
  
  // Pending tasks across all events
  const allTasks: Array<{ task: Task; event: EventEntity }> = [];
  events.forEach((ev) => {
    ev.tasks?.forEach((t) => {
      allTasks.push({ task: t, event: ev });
    });
  });

  const pendingTasks = allTasks.filter(({ task }) => task.status !== 'completed');
  
  // Total vendors contacted across all events
  const totalVendors = events.reduce((acc, ev) => {
    const quotesCount = ev.quotes?.length || 0;
    const vendorCount = ev.vendors?.length || 0;
    return acc + Math.max(quotesCount, vendorCount);
  }, 0);

  // Filtered events if search is active
  const filteredEvents = events.filter((ev) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      ev.name.toLowerCase().includes(q) ||
      ev.occasion.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q)
    );
  });

  // Event progress calculator
  const getEventProgress = (ev: EventEntity): number => {
    const spent = ev.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const budgetPct = ev.budget > 0 ? (spent / ev.budget) * 100 : 0;
    const tasksCount = ev.tasks?.length || 0;
    const tasksCompleted = ev.tasks?.filter(t => t.status === 'completed').length || 0;
    const tasksPct = tasksCount > 0 ? (tasksCompleted / tasksCount) * 100 : 0;
    // Composite progress matching realistic event readiness
    const composite = Math.round(budgetPct * 0.4 + (tasksCount > 0 ? tasksPct * 0.4 : 30) + 15);
    return Math.min(Math.max(composite, 20), 95);
  };

  // Helper for event image lookup matching reference
  const getEventImage = (ev: EventEntity): string => {
    if (ev.occasion.toLowerCase().includes('birthday') || ev.name.toLowerCase().includes('birthday')) {
      return '/images/birthday-celebration.jpg';
    }
    if (ev.occasion.toLowerCase().includes('wedding') || ev.name.toLowerCase().includes('wedding')) {
      return '/images/wedding-palace.jpg';
    }
    return '/images/community-gala.jpg';
  };

  // Format INR or target currency
  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  // Format short date for tasks (e.g. "Oct 28")
  const formatShortDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <Layout onSearch={(q) => setSearchFilter(q)}>
      {/* Personalized Greeting Header matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <AlexText as="h1" scale="text-[1.28em]" className="text-3xl sm:text-4xl font-normal text-[#29213F]">
            Good evening, Alex 👋
          </AlexText>
          <p className="text-sm text-[#71677F] mt-1 font-normal">
            Let's make your next celebration extraordinary.
          </p>
        </div>

        {searchFilter && (
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#7C4DCE] bg-[#F3EBFB] px-3 py-1.5 rounded-asym-sm">
            <span>Filtering by: "{searchFilter}"</span>
            <button 
              onClick={() => setSearchFilter('')}
              className="text-[#29213F] hover:text-[#7C4DCE] font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-[#7C4DCE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-[#71677F]">Syncing your celebration command center...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-asym bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 4 Metric Summary Cards matching reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Total Events */}
            <div className="card-asym p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#29213F]">
                  {totalEvents}
                </div>
                <div className="text-xs font-medium text-[#71677F]">
                  Total Events
                </div>
              </div>
              <div className="h-11 w-11 rounded-asym-sm bg-[#F5D9EF] text-[#BA3E91] flex items-center justify-center shadow-xs">
                <Calendar className="h-5 w-5" />
              </div>
            </div>

            {/* 2. Total Budget */}
            <div className="card-asym p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#29213F]">
                  {formatCurrency(totalBudget, events[0]?.currency || 'INR')}
                </div>
                <div className="text-xs font-medium text-[#71677F]">
                  Total Budget
                </div>
              </div>
              <div className="h-11 w-11 rounded-asym-sm bg-[#D5F5E3] text-[#1E8449] flex items-center justify-center shadow-xs">
                <Wallet className="h-5 w-5" />
              </div>
            </div>

            {/* 3. Tasks Pending */}
            <div className="card-asym p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#29213F]">
                  {pendingTasks.length}
                </div>
                <div className="text-xs font-medium text-[#71677F]">
                  Tasks Pending
                </div>
              </div>
              <div className="h-11 w-11 rounded-asym-sm bg-[#FADBD8] text-[#C0392B] flex items-center justify-center shadow-xs">
                <CheckSquare className="h-5 w-5" />
              </div>
            </div>

            {/* 4. Vendors Contacted */}
            <div className="card-asym p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#29213F]">
                  {totalVendors}
                </div>
                <div className="text-xs font-medium text-[#71677F]">
                  Vendors Contacted
                </div>
              </div>
              <div className="h-11 w-11 rounded-asym-sm bg-[#E8DFF5] text-[#7C4DCE] flex items-center justify-center shadow-xs">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Main Dashboard Section: Upcoming Events (Left) & Upcoming Tasks (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Upcoming Events (~68%) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <AlexText as="h2" scale="text-[1.25em]" className="text-2xl font-normal text-[#29213F]">
                  Upcoming Events
                </AlexText>
                <Link
                  to={`/events/${events[0]?.id || ''}/tasks`}
                  className="text-xs font-bold text-[#7C4DCE] hover:text-[#6035C4] flex items-center space-x-1"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>See Calendar</span>
                </Link>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="card-asym p-10 text-center space-y-3">
                  <div className="h-12 w-12 rounded-asym-sm bg-[#F3EBFB] text-[#7C4DCE] flex items-center justify-center mx-auto">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <AlexText as="h3" scale="text-[1.2em]" className="text-lg font-bold text-[#29213F]">
                    No celebrations found
                  </AlexText>
                  <p className="text-xs text-[#71677F] max-w-sm mx-auto">
                    {searchFilter ? 'Try clearing your search query.' : 'Begin planning your first extraordinary celebration today.'}
                  </p>
                  <Link
                    to="/events/new"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-asym bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-xs font-bold transition-all"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Event</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredEvents.map((ev) => {
                    const progress = getEventProgress(ev);
                    const formattedDate = new Date(ev.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });

                    return (
                      <Link
                        key={ev.id}
                        to={`/events/${ev.id}`}
                        className="card-asym overflow-hidden group hover:shadow-soft-lg transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Event Thumbnail with Asymmetric Corner */}
                          <div className="h-36 w-full relative overflow-hidden bg-[#E8DFF5]/30">
                            <img
                              src={getEventImage(ev)}
                              alt={ev.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-asym-sm bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#7C4DCE] shadow-xs">
                              {ev.occasion}
                            </div>
                          </div>

                          {/* Event Details */}
                          <div className="p-4 space-y-2">
                            <h3 className="text-sm font-bold text-[#29213F] group-hover:text-[#7C4DCE] transition-colors truncate">
                              {ev.name}
                            </h3>

                            <div className="space-y-1 text-xs text-[#71677F]">
                              <div className="flex items-center space-x-1.5 truncate">
                                <Clock className="h-3.5 w-3.5 text-[#7C4DCE] flex-shrink-0" />
                                <span>{formattedDate}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 truncate">
                                <MapPin className="h-3.5 w-3.5 text-[#E8A0D4] flex-shrink-0" />
                                <span className="truncate">{ev.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar matching reference: e.g. "65% planned" */}
                        <div className="p-4 pt-0">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#71677F] mb-1.5">
                            <span>{progress}% planned</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#F3EBFB] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#7C4DCE] to-[#E8A0D4] rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Upcoming Tasks (~32%) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <AlexText as="h2" scale="text-[1.25em]" className="text-2xl font-normal text-[#29213F]">
                  Upcoming Tasks
                </AlexText>
                <Link
                  to={`/events/${events[0]?.id || ''}/tasks`}
                  className="text-xs font-bold text-[#7C4DCE] hover:text-[#6035C4] flex items-center"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Link>
              </div>

              <div className="card-asym p-5 space-y-4">
                {allTasks.length === 0 ? (
                  <p className="text-xs text-[#71677F] text-center py-6">
                    All upcoming celebration milestones completed.
                  </p>
                ) : (
                  <div className="divide-y divide-[#F3EBFB] space-y-3">
                    {allTasks.slice(0, 5).map(({ task, event }) => {
                      const isCompleted = task.status === 'completed';
                      return (
                        <div
                          key={task.id}
                          className="pt-3 first:pt-0 flex items-start justify-between gap-3 group"
                        >
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleTask(event.id, task.id, task.status)}
                              className="mt-0.5 text-[#7C4DCE] hover:text-[#6035C4] transition-colors cursor-pointer flex-shrink-0"
                              aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 text-[#7C4DCE]" />
                              ) : (
                                <Circle className="h-4 w-4 text-[#A477E8] group-hover:scale-110 transition-transform" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <p className={`text-xs font-bold leading-snug truncate ${isCompleted ? 'line-through text-[#71677F]' : 'text-[#29213F]'}`}>
                                {task.title}
                              </p>
                              <p className="text-[11px] text-[#71677F] truncate mt-0.5">
                                {event.name}
                              </p>
                            </div>
                          </div>

                          {/* Task Due Date */}
                          <div className="text-[11px] font-bold text-[#E8A0D4] flex-shrink-0 text-right">
                            {formatShortDate(task.dueDate)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;
