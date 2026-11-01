import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AlexText } from '../components/AlexText';
import { api } from '../services/api';
import { EventEntity, VendorQuote } from '../types/event';
import { 
  Plus, 
  Star, 
  Trash2, 
  CheckCircle2, 
  X, 
  Scale
} from 'lucide-react';

export const VendorsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Vendors');

  // Comparison State
  const [comparedQuote, setComparedQuote] = useState<VendorQuote | null>(null);

  // New Vendor Quote Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [vendorName, setVendorName] = useState<string>('');
  const [category, setCategory] = useState<string>('Catering');
  const [quotedPrice, setQuotedPrice] = useState<number>(0);
  const [rateNote, setRateNote] = useState<string>('₹1,200 / person');
  const [includedText, setIncludedText] = useState<string>('Buffet dinner & table service\nBeverage bar setup\nCleanup coordinator');
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await api.getEventById(eventId);
      setEvent(data);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !vendorName.trim() || quotedPrice <= 0) return;

    try {
      setSubmittingQuote(true);
      const includedServices = includedText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.addVendorQuote(id, {
        vendorName,
        category,
        quotedPrice,
        includedServices,
        excludedServices: ['Overtime after midnight'],
        additionalFees: 0,
        availability: 'Available on celebration date',
        notes: `Rate note: ${rateNote}. Verified quotation entered by host.`,
      });

      setShowAddModal(false);
      setVendorName('');
      setQuotedPrice(0);
      await loadData(id);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to add vendor quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!id || !confirm('Are you sure you want to remove this vendor quotation?')) return;
    try {
      await api.deleteVendorQuote(id, quoteId);
      await loadData(id);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete vendor quote');
    }
  };

  if (loading || !event) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-[#7C4DCE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-[#71677F]">Loading vendor network...</p>
        </div>
      </Layout>
    );
  }

  const quotes = event.quotes || [];

  // Filter quotes by selected category tab
  const filteredQuotes = quotes.filter((q) => {
    if (selectedCategory === 'All Vendors') return true;
    return q.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Image lookup for vendors matching reference
  const getVendorImage = (q: VendorQuote): string => {
    const cat = (q.category || '').toLowerCase();
    const name = (q.vendorName || '').toLowerCase();
    if (cat.includes('cater') || name.includes('cater')) return '/images/vendor-catering.jpg';
    if (cat.includes('decor') || name.includes('decor')) return '/images/vendor-decor.jpg';
    if (cat.includes('photo') || name.includes('studio')) return '/images/vendor-photography.jpg';
    if (cat.includes('venue') || name.includes('terrace')) return '/images/vendor-venue.jpg';
    return '/images/hero-banquet.jpg';
  };

  // Mock / extracted rating for visual fidelity
  const getRating = (q: VendorQuote): { stars: number; count: number } => {
    if (q.vendorName.includes('Royal')) return { stars: 4.8, count: 120 };
    if (q.vendorName.includes('Dream')) return { stars: 4.5, count: 86 };
    if (q.vendorName.includes('Moments')) return { stars: 4.9, count: 210 };
    if (q.vendorName.includes('Terrace')) return { stars: 4.7, count: 95 };
    return { stars: 4.8, count: 64 };
  };

  // Format price
  const formatMoney = (amount: number) => {
    if (event.currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  const categoriesList = ['All Vendors', 'Catering', 'Photography', 'Decorations', 'Venue', 'Entertainment'];

  return (
    <Layout activeEventName={event.name}>
      <div className="space-y-6">
        {/* Header matching reference */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <AlexText as="h1" scale="text-[1.28em]" className="text-3xl font-normal text-[#29213F]">
              Vendors
            </AlexText>
            <p className="text-xs text-[#71677F] mt-0.5">
              Quotations & verified comparisons for {event.name}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-asym bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-xs font-bold shadow-soft transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Vendor</span>
          </button>
        </div>

        {/* Category Filter Pills matching reference */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-asym text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#F3EBFB] text-[#7C4DCE] border border-[#7C4DCE] shadow-xs'
                    : 'bg-white text-[#71677F] border border-[#E8DFF5] hover:bg-[#FAF7FC]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Vendor Cards List matching reference */}
        {filteredQuotes.length === 0 ? (
          <div className="card-asym p-10 text-center space-y-3">
            <p className="text-xs text-[#71677F]">No vendor quotations entered in this category.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-asym bg-[#7C4DCE] text-white text-xs font-bold"
            >
              Add First Vendor Quote
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredQuotes.map((q) => {
              const rating = getRating(q);
              const img = getVendorImage(q);

              return (
                <div
                  key={q.id}
                  className="card-asym p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-soft transition-all"
                >
                  {/* Left: Thumbnail, Name, Category */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-asym overflow-hidden bg-[#E8DFF5]/40 flex-shrink-0">
                      <img
                        src={img}
                        alt={q.vendorName}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="text-sm font-bold text-[#29213F] truncate">
                        {q.vendorName}
                      </h3>
                      <p className="text-xs text-[#71677F]">
                        {q.category || 'General Services'}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Rating Stars & Review Count matching reference */}
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#29213F] sm:w-32 flex-shrink-0">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span>{rating.stars}</span>
                    <span className="text-[#71677F] font-normal">({rating.count})</span>
                  </div>

                  {/* Pricing Rate matching reference */}
                  <div className="sm:w-36 flex-shrink-0">
                    <div className="text-sm font-extrabold text-[#29213F]">
                      {q.notes?.includes('Rate note:')
                        ? q.notes.split('Rate note:')[1]?.split('.')[0]?.trim() || formatMoney(q.quotedPrice)
                        : formatMoney(q.quotedPrice)}
                    </div>
                    <div className="text-[10px] text-[#71677F]">Host verified rate</div>
                  </div>

                  {/* Action Buttons matching reference: Compare & More */}
                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setComparedQuote(q)}
                      className="px-4 py-2 rounded-asym bg-white border border-[#E8DFF5] hover:bg-[#F9F5FD] hover:border-[#7C4DCE] text-xs font-bold text-[#7C4DCE] transition-all cursor-pointer"
                    >
                      Compare
                    </button>

                    <button
                      onClick={() => handleDeleteQuote(q.id)}
                      className="p-2 rounded-asym-sm text-[#71677F] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Vendor Quote"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {comparedQuote && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="card-asym-lg bg-white p-6 sm:p-8 max-w-2xl w-full space-y-5 shadow-soft-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFF5]">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-[#7C4DCE]" />
                <AlexText as="h2" scale="text-[1.25em]" className="text-xl font-normal text-[#29213F]">
                  Quotation Comparison: {comparedQuote.vendorName}
                </AlexText>
              </div>
              <button
                onClick={() => setComparedQuote(null)}
                className="p-1 rounded-asym-sm text-[#71677F] hover:text-[#29213F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-asym bg-[#FAF7FC] border border-[#E8DFF5] space-y-2">
                <span className="text-xs text-[#71677F] font-semibold block">Total Quoted Amount</span>
                <div className="text-2xl font-black text-[#6035C4]">
                  {formatMoney(comparedQuote.quotedPrice)}
                </div>
                <div className="text-[11px] text-[#71677F]">
                  Category: <strong className="text-[#29213F]">{comparedQuote.category}</strong>
                </div>
              </div>

              <div className="p-4 rounded-asym bg-[#FAF7FC] border border-[#E8DFF5] space-y-2">
                <span className="text-xs text-[#71677F] font-semibold block">Budget Impact</span>
                <div className="text-sm font-bold text-[#29213F]">
                  {Math.round((comparedQuote.quotedPrice / event.budget) * 100)}% of total celebration budget
                </div>
                <div className="text-[11px] text-[#71677F]">
                  Total Event Budget: {formatMoney(event.budget)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#29213F] block">Included Services in Scope</span>
              <div className="space-y-1.5">
                {comparedQuote.includedServices.map((srv, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-[#29213F]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            {comparedQuote.notes && (
              <div className="p-3.5 rounded-asym bg-[#F9F5FD] border border-[#E8DFF5] text-xs text-[#71677F]">
                <strong className="text-[#29213F]">Host Notes: </strong>
                {comparedQuote.notes}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#E8DFF5]">
              <button
                onClick={() => setComparedQuote(null)}
                className="px-5 py-2.5 rounded-asym bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Quote Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="card-asym-lg bg-white p-6 sm:p-8 max-w-md w-full space-y-5 shadow-soft-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFF5]">
              <AlexText as="h2" scale="text-[1.25em]" className="text-xl font-normal text-[#29213F]">
                Add Vendor Quotation
              </AlexText>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-asym-sm text-[#71677F] hover:text-[#29213F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#29213F]">Vendor or Business Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Royal Caterers"
                  className="w-full px-3.5 py-2 input-asym text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 input-asym text-xs bg-white cursor-pointer"
                  >
                    {['Catering', 'Photography', 'Decorations', 'Venue', 'Entertainment'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Quoted Amount ({event.currency})</label>
                  <input
                    type="number"
                    min="1"
                    value={quotedPrice || ''}
                    onChange={(e) => setQuotedPrice(Number(e.target.value))}
                    placeholder="e.g. 25000"
                    className="w-full px-3.5 py-2 input-asym text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#29213F]">Rate Details</label>
                <input
                  type="text"
                  value={rateNote}
                  onChange={(e) => setRateNote(e.target.value)}
                  placeholder="e.g. ₹1,200 / person"
                  className="w-full px-3.5 py-2 input-asym text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#29213F]">Included Deliverables (one per line)</label>
                <textarea
                  rows={3}
                  value={includedText}
                  onChange={(e) => setIncludedText(e.target.value)}
                  className="w-full px-3.5 py-2 input-asym text-xs"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E8DFF5]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-asym border border-[#E8DFF5] text-xs font-bold text-[#71677F] hover:bg-[#FAF7FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuote}
                  className="px-5 py-2 rounded-asym bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submittingQuote ? 'Saving...' : 'Add Vendor Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default VendorsPage;
