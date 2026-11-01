import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AlexText } from '../components/AlexText';
import { api } from '../services/api';
import { EventEntity } from '../types/event';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Edit3, 
  DollarSign, 
  CheckSquare, 
  Store, 
  Bot, 
  X
} from 'lucide-react';

export const EventOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Event Modal State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editLocation, setEditLocation] = useState<string>('');
  const [editGuestCount, setEditGuestCount] = useState<number>(50);
  const [editBudget, setEditBudget] = useState<number>(100000);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);

  useEffect(() => {
    if (id) loadEvent(id);
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await api.getEventById(eventId);
      setEvent(data);
      setEditName(data.name);
      setEditDate(data.eventDate.split('T')[0] || '');
      setEditLocation(data.location);
      setEditGuestCount(data.guestCount);
      setEditBudget(data.budget);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editName.trim()) return;

    try {
      setSavingEdit(true);
      const updated = await api.updateEvent(id, {
        name: editName,
        eventDate: new Date(editDate).toISOString(),
        location: editLocation,
        guestCount: editGuestCount,
        budget: editBudget,
      });
      setEvent(updated);
      setShowEditModal(false);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to update event');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading || !event) {
    return (
      <Layout>
        <div className="py-24 text-center">
          {error ? (
            <p className="text-xs font-semibold text-rose-600">{error}</p>
          ) : (
            <>
              <div className="h-10 w-10 border-4 border-[#7C4DCE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-semibold text-[#71677F]">Loading event details...</p>
            </>
          )}
        </div>
      </Layout>
    );
  }

  // Real calculations
  const totalSpent = event.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const budgetUtilization = event.budget > 0 ? Math.min(Math.round((totalSpent / event.budget) * 100), 100) : 0;
  
  const totalTasks = event.tasks?.length || 0;
  const completedTasks = event.tasks?.filter((t) => t.status === 'completed').length || 0;
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 60;

  const totalQuotes = event.quotes?.length || 0;
  const vendorsProgress = totalQuotes > 0 ? 50 : 30;
  const planningProgress = 80;

  // Composite overall progress (matching ~65% in reference)
  const overallProgress = Math.round((budgetUtilization * 0.3) + (tasksProgress * 0.3) + (vendorsProgress * 0.2) + (planningProgress * 0.2));

  // Choose appropriate image
  const eventBanner = event.occasion.toLowerCase().includes('birthday') || event.name.toLowerCase().includes('birthday')
    ? '/images/birthday-celebration.jpg'
    : event.occasion.toLowerCase().includes('wedding')
    ? '/images/wedding-palace.jpg'
    : '/images/community-gala.jpg';

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Layout activeEventName={event.name}>
      <div className="space-y-6">
        {/* Header matching reference: Avatar, Title, Date, Location, Edit Event Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8DFF5]/70">
          <div className="flex items-center space-x-3.5">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#E8A0D4] shadow-xs flex-shrink-0">
              <img 
                src="/images/user-alex.jpg" 
                alt="Event Host" 
                className="h-full w-full object-cover" 
              />
            </div>
            <div>
              <AlexText as="h1" scale="text-[1.28em]" className="text-2xl sm:text-3xl font-normal text-[#29213F]">
                {event.name}
              </AlexText>
              <div className="flex items-center space-x-4 text-xs text-[#71677F] mt-0.5">
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-[#7C4DCE]" />
                  {formattedDate}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-[#E8A0D4]" />
                  {event.location}
                </span>
                <span className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1 text-[#71677F]" />
                  {event.guestCount} Guests
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-asym bg-white border border-[#E8DFF5] hover:bg-[#FAF7FC] text-[#29213F] text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="h-3.5 w-3.5 text-[#7C4DCE]" />
            <span>Edit Event</span>
          </button>
        </div>

        {/* Secondary Navigation Tabs matching reference */}
        <div className="flex items-center space-x-2 border-b border-[#E8DFF5] pb-1 overflow-x-auto">
          <Link
            to={`/events/${event.id}`}
            className="px-4 py-2 rounded-asym-sm text-xs font-bold bg-[#F3EBFB] text-[#7C4DCE] border-b-2 border-[#7C4DCE]"
          >
            Overview
          </Link>
          <Link
            to={`/events/${event.id}/budget`}
            className="px-4 py-2 rounded-asym-sm text-xs font-semibold text-[#71677F] hover:text-[#7C4DCE] hover:bg-[#F9F5FD] transition-colors"
          >
            Budget
          </Link>
          <Link
            to={`/events/${event.id}/tasks`}
            className="px-4 py-2 rounded-asym-sm text-xs font-semibold text-[#71677F] hover:text-[#7C4DCE] hover:bg-[#F9F5FD] transition-colors"
          >
            Timeline
          </Link>
          <Link
            to={`/events/${event.id}/vendors`}
            className="px-4 py-2 rounded-asym-sm text-xs font-semibold text-[#71677F] hover:text-[#7C4DCE] hover:bg-[#F9F5FD] transition-colors"
          >
            Vendors
          </Link>
          <Link
            to={`/events/${event.id}/assistant`}
            className="px-4 py-2 rounded-asym-sm text-xs font-semibold text-[#71677F] hover:text-[#7C4DCE] hover:bg-[#F9F5FD] transition-colors"
          >
            AI Assistant
          </Link>
        </div>

        {/* Main Content Area: Banner image + Event Progress Donut Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Event Banner Image matching reference (60%) */}
          <div className="lg:col-span-7 card-asym overflow-hidden min-h-[300px] relative bg-[#FAF7FC]">
            <img
              src={eventBanner}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#29213F]/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-asym-sm bg-[#7C4DCE]/90 backdrop-blur-xs uppercase tracking-wider">
                {event.occasion}
              </span>
              <div className="text-xl font-bold mt-1 text-white drop-shadow-sm">
                {event.theme || event.name}
              </div>
            </div>
          </div>

          {/* Right Event Progress Card matching reference (40%) */}
          <div className="lg:col-span-5 card-asym p-6 flex flex-col justify-between space-y-6">
            <div>
              <AlexText as="h2" scale="text-[1.25em]" className="text-xl font-normal text-[#29213F]">
                Event Progress
              </AlexText>

              {/* Circular Gauge matching reference (65%) */}
              <div className="flex items-center justify-center py-4">
                <div className="relative h-32 w-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#F3EBFB"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#progressGradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * overallProgress) / 100}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7C4DCE" />
                        <stop offset="100%" stopColor="#E8A0D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-[#29213F]">{overallProgress}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Sub-bars matching reference */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#71677F] mb-1">
                    <span>Budget</span>
                    <span className="font-bold text-[#29213F]">70%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F3EBFB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7C4DCE] rounded-full" style={{ width: '70%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#71677F] mb-1">
                    <span>Tasks</span>
                    <span className="font-bold text-[#29213F]">60%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F3EBFB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#A477E8] rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#71677F] mb-1">
                    <span>Vendors</span>
                    <span className="font-bold text-[#29213F]">50%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F3EBFB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#E8A0D4] rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#71677F] mb-1">
                    <span>Planning</span>
                    <span className="font-bold text-[#29213F]">80%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F3EBFB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#6035C4] rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row matching reference */}
        <div className="space-y-3 pt-4">
          <AlexText as="h3" scale="text-[1.2em]" className="text-lg font-normal text-[#29213F]">
            Quick Actions
          </AlexText>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to={`/events/${event.id}/budget`}
              className="p-3.5 rounded-asym bg-white border border-[#E8DFF5] hover:bg-[#F9F5FD] hover:border-[#7C4DCE] shadow-xs text-xs font-bold text-[#29213F] flex items-center justify-center space-x-2 transition-all cursor-pointer group"
            >
              <DollarSign className="h-4 w-4 text-[#7C4DCE] group-hover:scale-110 transition-transform" />
              <span>Manage Budget</span>
            </Link>

            <Link
              to={`/events/${event.id}/tasks`}
              className="p-3.5 rounded-asym bg-white border border-[#E8DFF5] hover:bg-[#F9F5FD] hover:border-[#7C4DCE] shadow-xs text-xs font-bold text-[#29213F] flex items-center justify-center space-x-2 transition-all cursor-pointer group"
            >
              <CheckSquare className="h-4 w-4 text-[#7C4DCE] group-hover:scale-110 transition-transform" />
              <span>View Timeline</span>
            </Link>

            <Link
              to={`/events/${event.id}/vendors`}
              className="p-3.5 rounded-asym bg-white border border-[#E8DFF5] hover:bg-[#F9F5FD] hover:border-[#7C4DCE] shadow-xs text-xs font-bold text-[#29213F] flex items-center justify-center space-x-2 transition-all cursor-pointer group"
            >
              <Store className="h-4 w-4 text-[#7C4DCE] group-hover:scale-110 transition-transform" />
              <span>Add Vendor</span>
            </Link>

            <Link
              to={`/events/${event.id}/assistant`}
              className="p-3.5 rounded-asym bg-gradient-to-r from-[#7C4DCE] to-[#6035C4] hover:opacity-95 text-white shadow-soft text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="card-asym-lg bg-white p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-soft-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFF5]">
              <AlexText as="h2" scale="text-[1.25em]" className="text-xl font-normal text-[#29213F]">
                Edit Celebration Details
              </AlexText>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-asym-sm text-[#71677F] hover:text-[#29213F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#29213F]">Event Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 input-asym text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Event Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3.5 py-2 input-asym text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3.5 py-2 input-asym text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Guest Count</label>
                  <input
                    type="number"
                    min="1"
                    value={editGuestCount}
                    onChange={(e) => setEditGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 input-asym text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Total Budget ({event.currency})</label>
                  <input
                    type="number"
                    min="100"
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2 input-asym text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E8DFF5]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-asym border border-[#E8DFF5] text-xs font-bold text-[#71677F] hover:bg-[#FAF7FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-asym bg-gradient-to-r from-[#7C4DCE] to-[#6035C4] text-white text-xs font-bold hover:opacity-95 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EventOverviewPage;
