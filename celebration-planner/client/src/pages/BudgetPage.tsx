import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AlexText } from '../components/AlexText';
import { api } from '../services/api';
import { EventEntity } from '../types/event';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X
} from 'lucide-react';

export const BudgetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);

  // New Expense Form State
  const [expenseTitle, setExpenseTitle] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<string>('Venue');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expensePaid, setExpensePaid] = useState<boolean>(true);
  const [submittingExpense, setSubmittingExpense] = useState<boolean>(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await api.getEventById(eventId);
      setEvent(data);
      if (data.budgetItems && data.budgetItems.length > 0) {
        setExpenseCategory(data.budgetItems[0].category);
      }
    } catch (err) {
      console.error('Failed to load budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || expenseAmount <= 0 || !expenseTitle.trim()) return;

    try {
      setSubmittingExpense(true);
      await api.addExpense(id, {
        title: expenseTitle,
        category: expenseCategory,
        amount: expenseAmount,
        paid: expensePaid,
      });
      setShowExpenseModal(false);
      setExpenseTitle('');
      setExpenseAmount(0);
      await loadData(id);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to add expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!id || !confirm('Are you sure you want to delete this recorded expense?')) return;
    try {
      await api.deleteExpense(id, expenseId);
      await loadData(id);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete expense');
    }
  };

  if (loading || !event) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-[#7C4DCE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-[#71677F]">Loading budget allocations...</p>
        </div>
      </Layout>
    );
  }

  // Currency Formatter
  const formatMoney = (amount: number) => {
    if (event.currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  // Calculations
  const totalBudget = event.budget;
  const totalSpent = event.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const remainingBudget = Math.max(totalBudget - totalSpent, 0);
  const utilization = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  // Categories colors & ratios matching reference
  const categoryColors: Record<string, string> = {
    'Venue': '#7C4DCE',
    'Catering': '#E8A0D4',
    'Decorations': '#A477E8',
    'Photography': '#BD9EE6',
    'Entertainment': '#6035C4',
    'Others': '#9187A0',
  };

  // Build breakdown from event.budgetItems or default to reference proportions
  const defaultAllocations = [
    { category: 'Venue', pct: 35, amount: Math.round(totalBudget * 0.35) },
    { category: 'Catering', pct: 25, amount: Math.round(totalBudget * 0.25) },
    { category: 'Decorations', pct: 15, amount: Math.round(totalBudget * 0.15) },
    { category: 'Photography', pct: 10, amount: Math.round(totalBudget * 0.10) },
    { category: 'Entertainment', pct: 8, amount: Math.round(totalBudget * 0.08) },
    { category: 'Others', pct: 7, amount: Math.round(totalBudget * 0.07) },
  ];

  const breakdown = event.budgetItems && event.budgetItems.length > 0
    ? event.budgetItems.map((b) => {
        const pct = totalBudget > 0 ? Math.round((b.allocatedAmount / totalBudget) * 100) : 0;
        return {
          category: b.category,
          pct,
          amount: b.allocatedAmount,
        };
      })
    : defaultAllocations;

  // Compute SVG Donut Chart Segments
  let cumulativePercent = 0;
  const chartSegments = breakdown.map((item, index) => {
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += item.pct;
    const endAngle = (cumulativePercent / 100) * 360;
    const color = categoryColors[item.category] || ['#7C4DCE', '#E8A0D4', '#A477E8', '#BD9EE6', '#6035C4', '#9187A0'][index % 6];
    return {
      ...item,
      color,
      startAngle,
      endAngle,
    };
  });

  return (
    <Layout activeEventName={event.name}>
      <div className="space-y-6">
        {/* Header matching reference */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <AlexText as="h1" scale="text-[1.28em]" className="text-3xl font-normal text-[#29213F]">
              Budget Management
            </AlexText>
            <p className="text-xs text-[#71677F] mt-0.5">
              Deterministic allocations & actual expense tracking for {event.name}
            </p>
          </div>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-asym bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-xs font-bold shadow-soft transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* 4 Summary Cards matching reference */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-asym p-5 space-y-1">
            <span className="text-xs text-[#71677F] font-semibold block">Total Budget</span>
            <div className="text-xl sm:text-2xl font-black text-[#29213F]">
              {formatMoney(totalBudget)}
            </div>
            <div className="text-[10px] text-[#7C4DCE] font-bold">Planned ceiling</div>
          </div>

          <div className="card-asym p-5 space-y-1">
            <span className="text-xs text-[#71677F] font-semibold block">Spent So Far</span>
            <div className="text-xl sm:text-2xl font-black text-[#29213F]">
              {formatMoney(totalSpent)}
            </div>
            <div className="text-[10px] text-[#BA3E91] font-bold">Paid invoices</div>
          </div>

          <div className="card-asym p-5 space-y-1">
            <span className="text-xs text-[#71677F] font-semibold block">Remaining</span>
            <div className="text-xl sm:text-2xl font-black text-[#29213F]">
              {formatMoney(remainingBudget)}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">Available balance</div>
          </div>

          <div className="card-asym p-5 space-y-1">
            <span className="text-xs text-[#71677F] font-semibold block">Utilization</span>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black text-[#29213F]">{utilization}%</span>
              <span className="px-2 py-0.5 rounded-asym-sm bg-[#F5D9EF] text-[#BA3E91] text-[10px] font-bold">
                On Track
              </span>
            </div>
            <div className="text-[10px] text-[#71677F]">Deterministic buffer</div>
          </div>
        </div>

        {/* Donut Chart & Category Breakdown matching reference */}
        <div className="card-asym p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* SVG Donut Chart with Total in center (Left ~50%) */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="relative h-64 w-64 sm:h-72 sm:w-72 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {chartSegments.map((seg, i) => {
                    const strokeDasharray = `${(seg.pct * 251.2) / 100} 251.2`;
                    const strokeDashoffset = -((seg.startAngle / 360) * 251.2);
                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  })}
                </svg>

                {/* Center Text matching reference: e.g. "₹1,00,000 Total Budget" */}
                <div className="absolute text-center space-y-0.5">
                  <div className="text-lg sm:text-xl font-black text-[#29213F]">
                    {formatMoney(totalBudget)}
                  </div>
                  <div className="text-[11px] font-semibold text-[#71677F]">
                    Total Budget
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown list matching reference (Right ~50%) */}
            <div className="lg:col-span-6 space-y-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#71677F] pb-1 border-b border-[#E8DFF5]">
                Allocation Breakdown
              </div>

              <div className="space-y-3">
                {breakdown.map((item, idx) => {
                  const dotColor = categoryColors[item.category] || '#7C4DCE';
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 hover:bg-[#FAF7FC] rounded-asym-sm px-2 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dotColor }}
                        />
                        <span className="font-bold text-[#29213F]">{item.category}</span>
                      </div>

                      <div className="flex items-center space-x-6">
                        <span className="text-[#71677F] font-semibold w-10 text-right">{item.pct}%</span>
                        <span className="font-bold text-[#29213F] w-20 text-right">
                          {formatMoney(item.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table with Delete Actions */}
        <div className="card-asym p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DFF5]">
            <AlexText as="h2" scale="text-[1.25em]" className="text-xl font-normal text-[#29213F]">
              Recorded Expenses
            </AlexText>
            <span className="text-xs text-[#71677F]">
              {event.expenses?.length || 0} transactions
            </span>
          </div>

          {(!event.expenses || event.expenses.length === 0) ? (
            <p className="text-xs text-[#71677F] py-6 text-center">
              No expenses recorded yet. Click "Add Expense" to track vendor receipts.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DFF5] text-[#71677F] font-bold">
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EBFB]">
                  {event.expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-[#FAF7FC] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#29213F]">{exp.title}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-asym-sm bg-[#F3EBFB] text-[#7C4DCE] font-bold text-[10px]">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-[#29213F]">
                        {formatMoney(exp.amount)}
                      </td>
                      <td className="py-3 px-3">
                        {exp.paid ? (
                          <span className="inline-flex items-center text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-700 font-bold text-[11px]">
                            <Clock className="h-3.5 w-3.5 mr-1 text-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-asym-sm text-[#71677F] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="card-asym-lg bg-white p-6 sm:p-8 max-w-md w-full space-y-5 shadow-soft-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFF5]">
              <AlexText as="h2" scale="text-[1.25em]" className="text-xl font-normal text-[#29213F]">
                Add Event Expense
              </AlexText>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 rounded-asym-sm text-[#71677F] hover:text-[#29213F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#29213F]">Expense Description</label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Venue Booking Deposit"
                  className="w-full px-3.5 py-2 input-asym text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full px-3.5 py-2 input-asym text-xs bg-white cursor-pointer"
                  >
                    {['Venue', 'Catering', 'Decorations', 'Photography', 'Entertainment', 'Others'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Amount ({event.currency})</label>
                  <input
                    type="number"
                    min="1"
                    value={expenseAmount || ''}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    placeholder="e.g. 35000"
                    className="w-full px-3.5 py-2 input-asym text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="paidCheck"
                  checked={expensePaid}
                  onChange={(e) => setExpensePaid(e.target.checked)}
                  className="rounded text-[#7C4DCE] focus:ring-[#7C4DCE]"
                />
                <label htmlFor="paidCheck" className="text-xs font-semibold text-[#29213F]">
                  Mark as Paid Invoice
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E8DFF5]">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-asym border border-[#E8DFF5] text-xs font-bold text-[#71677F] hover:bg-[#FAF7FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-5 py-2 rounded-asym bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submittingExpense ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BudgetPage;
