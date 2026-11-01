import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AlexText } from '../components/AlexText';
import { api } from '../services/api';
import { OccasionType } from '../types/event';
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export const EventWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Basic Details State (Matches Reference Form)
  const [name, setName] = useState<string>("Aarav's Birthday");
  const [occasion, setOccasion] = useState<OccasionType>('Birthday');
  const [eventDate, setEventDate] = useState<string>('2024-11-14');
  const [location, setLocation] = useState<string>('The Grand Terrace, Delhi');
  const [guestCount, setGuestCount] = useState<number>(50);
  const [budget, setBudget] = useState<number>(100000);
  const [currency, setCurrency] = useState<string>('INR');

  // Step 2: Preferences State
  const [theme, setTheme] = useState<string>('Warm Golden Glow & Celebration Balloons');
  const [priorities, setPriorities] = useState<string[]>([
    'venue',
    'catering',
    'decorations',
    'photography',
    'entertainment',
  ]);
  const [constraints, setConstraints] = useState<string>(
    'Rooftop terrace music curfew at 11 PM; indoor backup dining area reserved.'
  );

  const togglePriority = (item: string) => {
    if (priorities.includes(item)) {
      if (priorities.length > 1) {
        setPriorities(priorities.filter((p) => p !== item));
      }
    } else {
      setPriorities([...priorities, item]);
    }
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMessage('Please enter an event name.');
        return;
      }
      if (!eventDate) {
        setErrorMessage('Please choose a celebration date.');
        return;
      }
      if (!location.trim()) {
        setErrorMessage('Please provide a venue or location.');
        return;
      }
      if (budget <= 0) {
        setErrorMessage('Budget must be greater than zero.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setSubmitting(true);
      const created = await api.createEvent({
        name,
        occasion,
        eventDate: new Date(eventDate).toISOString(),
        location,
        guestCount,
        budget,
        currency,
        theme,
        priorities,
        constraints,
      });

      // Navigate directly to the newly created event workspace
      navigate(`/events/${created.id}`);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to create celebration event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Title matching reference */}
        <div>
          <AlexText as="h1" scale="text-[1.28em]" className="text-3xl sm:text-4xl font-normal text-[#29213F]">
            Create New Event
          </AlexText>
        </div>

        {/* 3-Step Wizard Navigation matching reference */}
        <div className="flex items-center space-x-4 sm:space-x-8 text-xs font-bold border-b border-[#E8DFF5] pb-4">
          <div className="flex items-center space-x-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
              currentStep === 1 
                ? 'bg-[#7C4DCE] text-white shadow-xs' 
                : currentStep > 1 
                ? 'bg-[#E8DFF5] text-[#7C4DCE]' 
                : 'bg-[#FAF7FC] text-[#71677F]'
            }`}>
              {currentStep > 1 ? <Check className="h-3.5 w-3.5" /> : '1'}
            </span>
            <span className={currentStep === 1 ? 'text-[#7C4DCE]' : 'text-[#71677F]'}>
              Basic Details
            </span>
          </div>

          <span className="text-[#E8DFF5]">→</span>

          <div className="flex items-center space-x-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
              currentStep === 2 
                ? 'bg-[#7C4DCE] text-white shadow-xs' 
                : currentStep > 2 
                ? 'bg-[#E8DFF5] text-[#7C4DCE]' 
                : 'bg-[#FAF7FC] text-[#71677F]'
            }`}>
              {currentStep > 2 ? <Check className="h-3.5 w-3.5" /> : '2'}
            </span>
            <span className={currentStep === 2 ? 'text-[#7C4DCE]' : 'text-[#71677F]'}>
              Preferences
            </span>
          </div>

          <span className="text-[#E8DFF5]">→</span>

          <div className="flex items-center space-x-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
              currentStep === 3 
                ? 'bg-[#7C4DCE] text-white shadow-xs' 
                : 'bg-[#FAF7FC] text-[#71677F]'
            }`}>
              3
            </span>
            <span className={currentStep === 3 ? 'text-[#7C4DCE]' : 'text-[#71677F]'}>
              Review & Create
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-asym bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Two-Column Layout: Left Form + Right Festive Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (68%) */}
          <div className="lg:col-span-8 card-asym p-6 sm:p-8 space-y-6">
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* Event Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#29213F] block">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav's Birthday"
                    className="w-full px-4 py-2.5 input-asym text-sm focus:outline-none"
                    required
                  />
                </div>

                {/* Event Type Selectable Chips matching reference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#29213F] block">
                    Event Type
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {(['Birthday', 'Wedding', 'Community Event', 'Anniversary'] as OccasionType[]).map((occ) => {
                      const isSelected = occasion === occ;
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => setOccasion(occ)}
                          className={`px-4 py-2 rounded-asym text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#F3EBFB] text-[#7C4DCE] border border-[#A477E8] shadow-xs'
                              : 'bg-white text-[#71677F] border border-[#E8DFF5] hover:bg-[#FAF7FC]'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-[#7C4DCE]' : 'bg-[#E8DFF5]'}`} />
                          <span>{occ}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#29213F] block">
                      Event Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-2.5 input-asym text-sm focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#29213F] block">
                      Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. The Grand Terrace, Delhi"
                        className="w-full px-4 py-2.5 input-asym text-sm focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Guest Count & Total Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#29213F] block">
                      Estimated Guest Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 input-asym text-sm focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#29213F] block">
                      Total Budget
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="100"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="flex-1 px-4 py-2.5 input-asym text-sm focus:outline-none"
                        required
                      />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="px-3 py-2.5 input-asym text-xs font-bold text-[#29213F] bg-white cursor-pointer"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#29213F] block">
                    Celebration Theme & Style
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g. Warm Golden Glow & Balloon Elegance"
                    className="w-full px-4 py-2.5 input-asym text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#29213F] block">
                    Priority Categories
                  </label>
                  <p className="text-[11px] text-[#71677F]">
                    Select which areas should receive priority budget allocation:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'venue', label: 'Venue & Staging' },
                      { key: 'catering', label: 'Catering & Dining' },
                      { key: 'decorations', label: 'Decorations & Flowers' },
                      { key: 'photography', label: 'Photography & Film' },
                      { key: 'entertainment', label: 'Music & Entertainment' },
                    ].map((p) => {
                      const isSelected = priorities.includes(p.key);
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => togglePriority(p.key)}
                          className={`px-3 py-2 rounded-asym text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#7C4DCE] text-white shadow-xs'
                              : 'bg-white text-[#71677F] border border-[#E8DFF5] hover:bg-[#FAF7FC]'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#29213F] block">
                    Special Constraints or Rules
                  </label>
                  <textarea
                    rows={3}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g. Noise curfew, backup indoor space, dietary guidelines..."
                    className="w-full px-4 py-2.5 input-asym text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="p-5 rounded-asym bg-[#FAF7FC] border border-[#E8DFF5] space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DFF5]">
                    <span className="font-extrabold text-sm text-[#29213F]">{name}</span>
                    <span className="px-2 py-0.5 rounded-asym-sm bg-[#F3EBFB] text-[#7C4DCE] font-bold">
                      {occasion}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#71677F] block">Celebration Date:</span>
                      <strong className="text-[#29213F]">{eventDate}</strong>
                    </div>
                    <div>
                      <span className="text-[#71677F] block">Venue & City:</span>
                      <strong className="text-[#29213F]">{location}</strong>
                    </div>
                    <div>
                      <span className="text-[#71677F] block">Guest Count:</span>
                      <strong className="text-[#29213F]">{guestCount} Guests</strong>
                    </div>
                    <div>
                      <span className="text-[#71677F] block">Planned Budget:</span>
                      <strong className="text-[#6035C4]">
                        {currency === 'INR' ? '₹' : '$'}{budget.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8DFF5]">
                    <span className="text-[#71677F] block mb-1">Prioritized Allocations:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {priorities.map((pr) => (
                        <span key={pr} className="px-2 py-0.5 rounded-asym-sm bg-white border border-[#E8DFF5] text-[11px] font-semibold text-[#29213F]">
                          {pr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-asym bg-[#F9F5FD] border border-[#E8DFF5] flex items-center space-x-3 text-xs text-[#71677F]">
                  <Sparkles className="h-5 w-5 text-[#7C4DCE] flex-shrink-0" />
                  <span>
                    Upon creation, deterministic baseline budget items and essential kickoff milestones will be initialized automatically.
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Form Actions matching reference */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8DFF5]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-5 py-2.5 rounded-asym border border-[#E8DFF5] text-[#71677F] hover:text-[#29213F] hover:bg-[#FAF7FC] text-xs font-bold transition-all cursor-pointer"
                >
                  ← Back
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-asym text-[#71677F] hover:text-[#29213F] text-xs font-bold transition-all"
                >
                  Cancel
                </Link>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-asym bg-gradient-to-r from-[#7C4DCE] to-[#6035C4] hover:from-[#6035C4] hover:to-[#7C4DCE] text-white text-xs font-bold shadow-soft transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-asym bg-gradient-to-r from-[#7C4DCE] to-[#E8A0D4] hover:opacity-95 text-white text-xs font-bold shadow-soft transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'Creating Event...' : 'Confirm & Launch Workspace'}</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          </div>

          {/* Right Banner Card matching reference (Celebratory image with quote) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card-asym overflow-hidden">
              <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-gradient-to-tr from-[#7C4DCE] to-[#E8A0D4]">
                <img
                  src="/images/wedding-palace.jpg"
                  alt="Celebration banquet"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#29213F]/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Quote Card matching reference: "Great celebrations start with a clear plan and a little imagination." */}
              <div className="p-6 bg-white space-y-2">
                <div className="text-sm sm:text-base font-normal text-[#29213F] leading-snug">
                  <AlexText scale="text-[1.25em]">
                    Great celebrations start with a clear plan and a little imagination.
                  </AlexText>
                </div>
                <div className="text-[11px] text-[#71677F] font-semibold pt-1">
                  Planora — AI-Powered Celebration Planner
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventWizardPage;
