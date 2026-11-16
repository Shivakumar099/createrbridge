import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CalendarTask, CalendarTaskType } from '../types';
import { formatDate } from '../utils/helpers';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Tag,
  AlertCircle
} from 'lucide-react';

export const ContentCalendarPage: React.FC = () => {
  const { calendarTasks, toggleCalendarTask, deleteCalendarTask, addCalendarTask, collaborations } = useData();
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('All');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarTaskType>('personal');
  const [newDueDate, setNewDueDate] = useState('2026-11-20');
  const [newDueTime, setNewDueTime] = useState('17:00');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newNotes, setNewNotes] = useState('');

  // Subtle color map per task type
  const taskColors: Record<CalendarTaskType, { bg: string; text: string; border: string; label: string }> = {
    script_writing: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Script Writing' },
    content_shooting: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Content Shooting' },
    video_editing: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Video Editing' },
    content_submission: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Content Submission' },
    brand_review: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Brand Review' },
    final_publishing: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Final Publishing' },
    payment_due: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Payment Due' },
    personal: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'Personal Task' },
  };

  const filteredTasks = useMemo(() => {
    return calendarTasks.filter(task => {
      if (selectedTaskType !== 'All' && task.taskType !== selectedTaskType) {
        return false;
      }
      return true;
    });
  }, [calendarTasks, selectedTaskType]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCalendarTask({
      title: newTitle,
      taskType: newType,
      dueDate: newDueDate,
      dueTime: newDueTime,
      priority: newPriority,
      notes: newNotes
    });
    setIsAddTaskModalOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  // Days mock for Month Grid
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const dateStr = `2026-11-${day < 10 ? '0' + day : day}`;
    const dayTasks = filteredTasks.filter(t => t.dueDate === dateStr);
    return { day, dateStr, tasks: dayTasks };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Title and Add Task button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
              <CalendarIcon className="w-3.5 h-3.5" /> Deliverable Tracking System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary">
              Content Calendar
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary">
              Automatically schedules brand campaign milestones and personal creator tasks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
            >
              <Plus className="w-4 h-4" />
              Add Personal Task
            </button>
          </div>
        </div>

        {/* View Switcher and Task Filter Toolbar */}
        <div className="p-4 rounded-card bg-surface-card border border-surface-border shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-surface-bg p-1 rounded-xl border border-surface-border w-full md:w-auto">
            {(['month', 'week', 'day', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setCurrentView(mode)}
                className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  currentView === mode
                    ? 'bg-white text-brand-primary shadow-xs font-bold'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          {/* Month Navigator Header */}
          <div className="flex items-center gap-3 text-sm font-bold text-content-primary">
            <button className="p-1 rounded-lg hover:bg-surface-bg border border-surface-border">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>November 2026</span>
            <button className="p-1 rounded-lg hover:bg-surface-bg border border-surface-border">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter by Task Type */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-content-muted" />
            <select
              value={selectedTaskType}
              onChange={e => setSelectedTaskType(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-surface-border bg-white text-xs text-content-primary font-medium focus:outline-none focus:border-brand-primary"
            >
              <option value="All">All Task Types</option>
              <option value="script_writing">Script Writing</option>
              <option value="content_shooting">Content Shooting</option>
              <option value="video_editing">Video Editing</option>
              <option value="content_submission">Content Submission</option>
              <option value="brand_review">Brand Review</option>
              <option value="final_publishing">Final Publishing</option>
              <option value="payment_due">Payment Due</option>
              <option value="personal">Personal</option>
            </select>
          </div>
        </div>

        {/* COLOR CODE LEGEND */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] p-3 rounded-xl bg-white border border-surface-border">
          <span className="font-bold text-content-muted mr-1">Legend:</span>
          {Object.entries(taskColors).map(([type, color]) => (
            <span
              key={type}
              className={`px-2.5 py-1 rounded-md border font-semibold ${color.bg} ${color.text} ${color.border}`}
            >
              {color.label}
            </span>
          ))}
        </div>

        {/* MONTH VIEW GRID */}
        {currentView === 'month' && (
          <div className="bg-surface-card rounded-card border border-surface-border shadow-subtle overflow-hidden">
            <div className="grid grid-cols-7 bg-surface-bg border-b border-surface-border text-center text-xs font-bold text-content-muted py-2.5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-surface-border/60">
              {daysInMonth.map((dayItem, index) => {
                const isToday = dayItem.day === 11;
                return (
                  <div
                    key={index}
                    className={`min-h-[115px] p-2 transition-colors flex flex-col justify-between ${
                      isToday ? 'bg-brand-light/30' : 'hover:bg-surface-bg/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                          isToday
                            ? 'bg-brand-primary text-white shadow-xs'
                            : 'text-content-primary'
                        }`}
                      >
                        {dayItem.day}
                      </span>
                      {dayItem.tasks.length > 0 && (
                        <span className="text-[10px] text-content-muted font-medium">
                          {dayItem.tasks.length} {dayItem.tasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                      )}
                    </div>

                    {/* Task Pills for this day */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayItem.tasks.slice(0, 2).map(task => {
                        const style = taskColors[task.taskType] || taskColors.personal;
                        return (
                          <div
                            key={task.id}
                            onClick={() => toggleCalendarTask(task.id)}
                            className={`p-1.5 rounded-lg border text-[10px] cursor-pointer transition-all truncate flex items-center gap-1 ${
                              style.bg
                            } ${style.border} ${task.completed ? 'opacity-40 line-through' : ''}`}
                            title={`${task.title} (${task.completed ? 'Completed' : 'Click to complete'})`}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-3 h-3 text-status-success flex-shrink-0" />
                            ) : (
                              <Circle className="w-3 h-3 text-content-muted flex-shrink-0" />
                            )}
                            <span className={`truncate font-semibold ${style.text}`}>
                              {task.title}
                            </span>
                          </div>
                        );
                      })}
                      {dayItem.tasks.length > 2 && (
                        <span className="text-[9px] text-content-muted font-bold block pl-1">
                          +{dayItem.tasks.length - 2} more
                        </span>
                      )}
                    </div>

                    <div />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIST VIEW (OR WEEK/DAY VIEW) */}
        {(currentView === 'list' || currentView === 'week' || currentView === 'day') && (
          <div className="bg-surface-card rounded-card border border-surface-border shadow-subtle p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-base font-bold text-content-primary">Scheduled Deliverable Tasks</h3>
              <span className="text-xs text-content-muted">{filteredTasks.length} tasks scheduled</span>
            </div>

            <div className="divide-y divide-surface-border/60">
              {filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-content-muted">
                  No tasks scheduled for the selected filter.
                </div>
              ) : (
                filteredTasks.map(task => {
                  const style = taskColors[task.taskType] || taskColors.personal;
                  return (
                    <div
                      key={task.id}
                      className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-opacity ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <button
                          onClick={() => toggleCalendarTask(task.id)}
                          className="mt-0.5 sm:mt-0 text-content-muted hover:text-status-success transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-status-success" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div>
                          <h4 className={`text-xs font-bold text-content-primary ${task.completed ? 'line-through text-content-muted' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-content-secondary mt-0.5">
                            {task.brandName ? <strong className="text-brand-primary">{task.brandName} • </strong> : null}
                            Due: {formatDate(task.dueDate)} {task.dueTime ? `at ${task.dueTime}` : ''}
                            {task.notes && <span> — {task.notes}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                          {style.label}
                        </span>

                        <button
                          onClick={() => deleteCalendarTask(task.id)}
                          className="p-1 text-content-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-content-primary/45 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-surface-card rounded-card-lg border border-surface-border shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-brand-primary" />
                Add Personal Creator Task
              </h3>
              <button onClick={() => setIsAddTaskModalOpen(false)} className="text-content-muted hover:text-content-primary">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-content-secondary mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Record Winter Lookbook Voiceover"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-content-secondary mb-1">
                    Task Category
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as CalendarTaskType)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white text-xs focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="personal">Personal Task</option>
                    <option value="script_writing">Script Writing</option>
                    <option value="content_shooting">Content Shooting</option>
                    <option value="video_editing">Video Editing</option>
                    <option value="final_publishing">Final Publishing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-content-secondary mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border bg-white text-xs focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-content-secondary mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-content-secondary mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={e => setNewDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-content-secondary mb-1">
                  Notes & Equipment Checklist
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring ring light and backup microphone..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-surface-border text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
              >
                Schedule Task
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
