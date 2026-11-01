import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AlexText } from '../components/AlexText';
import { api } from '../services/api';
import { EventEntity, Task, TaskPriority } from '../types/event';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  List, 
  Calendar as CalendarIcon, 
  Clock, 
  X
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'timeline'>('list');

  // New Task Modal State
  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskCategory, setTaskCategory] = useState<string>('Venue');
  const [taskDueDate, setTaskDueDate] = useState<string>('2024-11-05');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [submittingTask, setSubmittingTask] = useState<boolean>(false);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  const loadData = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await api.getEventById(eventId);
      setEvent(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!id) return;
    try {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      await api.updateTask(id, task.id, { status: nextStatus });
      await loadData(id);
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!id || !confirm('Are you sure you want to delete this milestone task?')) return;
    try {
      await api.deleteTask(id, taskId);
      await loadData(id);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete task');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !taskTitle.trim() || !taskDueDate) return;

    try {
      setSubmittingTask(true);
      await api.addTask(id, {
        title: taskTitle,
        description: `Category: ${taskCategory}`,
        dueDate: new Date(taskDueDate).toISOString(),
        priority: taskPriority,
      });
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDueDate('2024-11-05');
      await loadData(id);
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to add task');
    } finally {
      setSubmittingTask(false);
    }
  };

  if (loading || !event) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-[#7C4DCE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-[#71677F]">Loading timeline milestones...</p>
        </div>
      </Layout>
    );
  }

  const tasks = event.tasks || [];

  // Group tasks by month (e.g. "October 2024", "November 2024")
  const groupedTasks: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    const d = new Date(t.dueDate);
    const monthYear = isNaN(d.getTime())
      ? 'Milestones'
      : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groupedTasks[monthYear]) {
      groupedTasks[monthYear] = [];
    }
    groupedTasks[monthYear].push(t);
  });

  // Extract category from description or default
  const getCategory = (t: Task): string => {
    if (t.description && t.description.startsWith('Category: ')) {
      return t.description.replace('Category: ', '');
    }
    if (t.title.toLowerCase().includes('venue')) return 'Venue';
    if (t.title.toLowerCase().includes('cater')) return 'Catering';
    if (t.title.toLowerCase().includes('invit')) return 'Invitations';
    if (t.title.toLowerCase().includes('photo')) return 'Photography';
    if (t.title.toLowerCase().includes('decor')) return 'Decor';
    if (t.title.toLowerCase().includes('guest')) return 'Planning';
    return 'General';
  };

  const formatShortDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  // Status Badge Helper matching reference
  const renderStatusBadge = (t: Task) => {
    if (t.status === 'completed') {
      return (
        <span className="px-2.5 py-1 rounded-asym-sm text-[10px] font-bold bg-[#D5F5E3] text-[#1E8449]">
          Completed
        </span>
      );
    }
    if (t.status === 'in_progress') {
      return (
        <span className="px-2.5 py-1 rounded-asym-sm text-[10px] font-bold bg-[#E8DFF5] text-[#7C4DCE]">
          In Progress
        </span>
      );
    }
    if (t.priority === 'critical' || t.priority === 'high') {
      return (
        <span className="px-2.5 py-1 rounded-asym-sm text-[10px] font-bold bg-[#FADBD8] text-[#C0392B]">
          Pending
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-asym-sm text-[10px] font-bold bg-[#FAF7FC] border border-[#E8DFF5] text-[#71677F]">
        Not Started
      </span>
    );
  };

  return (
    <Layout activeEventName={event.name}>
      <div className="space-y-6">
        {/* Header with View Switcher & Add Task CTA matching reference */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <AlexText as="h1" scale="text-[1.28em]" className="text-3xl font-normal text-[#29213F]">
              Timeline & Tasks
            </AlexText>
            <p className="text-xs text-[#71677F] mt-0.5">
              Chronological milestone checklist for {event.name}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Switcher matching reference: List, Calendar, Timeline */}
            <div className="inline-flex p-1 bg-[#FAF7FC] border border-[#E8DFF5] rounded-asym">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-asym-sm text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#7C4DCE] shadow-xs'
                    : 'text-[#71677F] hover:text-[#29213F]'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>List</span>
              </button>

              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-asym-sm text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-[#7C4DCE] shadow-xs'
                    : 'text-[#71677F] hover:text-[#29213F]'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Calendar</span>
              </button>

              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-asym-sm text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-[#7C4DCE] shadow-xs'
                    : 'text-[#71677F] hover:text-[#29213F]'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Timeline</span>
              </button>
            </div>

            {/* + Add Task Button */}
            <button
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-asym bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-xs font-bold shadow-soft transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* View Mode: List (Matching Reference Grouped by Month) */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {Object.keys(groupedTasks).length === 0 ? (
              <div className="card-asym p-10 text-center space-y-3">
                <p className="text-xs text-[#71677F]">No tasks created yet for this celebration.</p>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-4 py-2 rounded-asym bg-[#7C4DCE] text-white text-xs font-bold"
                >
                  Create First Task
                </button>
              </div>
            ) : (
              Object.entries(groupedTasks).map(([monthYear, monthTasks]) => (
                <div key={monthYear} className="space-y-3">
                  {/* Month Heading */}
                  <h2 className="text-sm font-extrabold text-[#29213F] tracking-wide uppercase px-1">
                    {monthYear}
                  </h2>

                  {/* Task Items Table / Card matching reference */}
                  <div className="card-asym divide-y divide-[#F3EBFB] overflow-hidden">
                    {monthTasks.map((t) => {
                      const isCompleted = t.status === 'completed';
                      const category = getCategory(t);
                      const shortDate = formatShortDate(t.dueDate);

                      return (
                        <div
                          key={t.id}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF7FC] transition-colors"
                        >
                          {/* Checkbox & Title */}
                          <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleTask(t)}
                              className="text-[#7C4DCE] hover:text-[#6035C4] transition-colors cursor-pointer flex-shrink-0"
                              aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-[#7C4DCE]" />
                              ) : (
                                <Circle className="h-5 w-5 text-[#A477E8] hover:scale-110 transition-transform" />
                              )}
                            </button>

                            <span className={`text-xs sm:text-sm font-bold truncate ${
                              isCompleted ? 'line-through text-[#71677F]' : 'text-[#29213F]'
                            }`}>
                              {t.title}
                            </span>
                          </div>

                          {/* Category Tag matching reference */}
                          <div className="w-24 flex-shrink-0 text-center">
                            <span className="px-2.5 py-1 rounded-asym-sm text-[11px] font-semibold text-[#71677F] bg-[#FAF7FC] border border-[#E8DFF5] inline-block">
                              {category}
                            </span>
                          </div>

                          {/* Due Date matching reference */}
                          <div className="w-20 flex-shrink-0 text-xs font-bold text-[#71677F] text-center">
                            {shortDate}
                          </div>

                          {/* Status Badge matching reference */}
                          <div className="w-24 flex-shrink-0 text-right">
                            {renderStatusBadge(t)}
                          </div>

                          {/* Delete action */}
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-1 rounded-asym-sm text-[#71677F] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Milestone"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* View Mode: Calendar View */}
        {viewMode === 'calendar' && (
          <div className="card-asym p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFF5]">
              <span className="text-sm font-bold text-[#29213F]">Calendar Schedule</span>
              <span className="text-xs text-[#71677F]">Showing {tasks.length} active deadlines</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((t) => (
                <div key={t.id} className="p-4 rounded-asym bg-[#FAF7FC] border border-[#E8DFF5] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#7C4DCE]">{formatShortDate(t.dueDate)}</span>
                    {renderStatusBadge(t)}
                  </div>
                  <div className="text-xs font-bold text-[#29213F]">{t.title}</div>
                  <div className="text-[11px] text-[#71677F]">{getCategory(t)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode: Timeline View */}
        {viewMode === 'timeline' && (
          <div className="card-asym p-6 sm:p-8 space-y-6">
            <div className="text-sm font-bold text-[#29213F] pb-2 border-b border-[#E8DFF5]">
              Chronological Roadmap
            </div>
            <div className="relative pl-6 space-y-6 border-l-2 border-[#E8DFF5] ml-2">
              {tasks.map((t) => (
                <div key={t.id} className="relative group">
                  <span className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-[#7C4DCE] ring-4 ring-[#FAF7FC]" />
                  <div className="p-3.5 rounded-asym bg-[#FAF7FC] border border-[#E8DFF5] hover:bg-white hover:shadow-xs transition-all flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#7C4DCE] uppercase block">
                        {formatShortDate(t.dueDate)}
                      </span>
                      <span className="text-xs font-bold text-[#29213F]">{t.title}</span>
                    </div>
                    {renderStatusBadge(t)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="card-asym-lg bg-white p-6 sm:p-8 max-w-md w-full space-y-5 shadow-soft-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFF5]">
              <AlexText as="h2" scale="text-[1.25em]" className="text-xl font-normal text-[#29213F]">
                Add Timeline Task
              </AlexText>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1 rounded-asym-sm text-[#71677F] hover:text-[#29213F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#29213F]">Task Name</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Finalize catering tasting menu"
                  className="w-full px-3.5 py-2 input-asym text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full px-3.5 py-2 input-asym text-xs bg-white cursor-pointer"
                  >
                    {['Venue', 'Catering', 'Invitations', 'Photography', 'Decor', 'Planning', 'Entertainment'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#29213F]">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 input-asym text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#29213F]">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full px-3.5 py-2 input-asym text-xs bg-white cursor-pointer"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Deadline</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E8DFF5]">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-asym border border-[#E8DFF5] text-xs font-bold text-[#71677F] hover:bg-[#FAF7FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-5 py-2 rounded-asym bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  {submittingTask ? 'Adding...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TasksPage;
