import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Plus, 
  UserCheck, 
  Play, 
  Sparkles, 
  BookOpen, 
  AlertCircle,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';
import { DailyPlanTask, UserProfile, SubjectType } from '../types';
import { StorageService } from '../services/storage';

interface DailyPlanViewProps {
  profile: UserProfile;
  onStartPractice: (topic: string) => void;
  onStartFocus: () => void;
  onOpenCompanion: (prompt: string) => void;
}

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  profile,
  onStartPractice,
  onStartFocus,
  onOpenCompanion
}) => {
  const [tasks, setTasks] = useState<DailyPlanTask[]>(() => StorageService.getDailyPlan());
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<SubjectType>('Quantitative Aptitude');
  const [newTopic, setNewTopic] = useState('Percentages & Base Values');
  const [newMinutes, setNewMinutes] = useState(30);
  const [newMentorNote, setNewMentorNote] = useState('');
  const [newTaskType, setNewTaskType] = useState<'practice' | 'concept' | 'revision'>('practice');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completedMinutes = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    StorageService.saveDailyPlan(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: DailyPlanTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      topic: newTopic.trim(),
      estimatedMinutes: Number(newMinutes) || 30,
      completed: false,
      assignedByMentor: profile.role === 'mentor',
      mentorNote: newMentorNote.trim() || (profile.role === 'mentor' ? 'Assigned by Rushabh for today.' : undefined),
      taskType: newTaskType
    };

    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    StorageService.saveDailyPlan(nextTasks);

    // Reset form
    setNewTitle('');
    setNewMentorNote('');
    setShowAddTaskModal(false);
  };

  const getSubjectColor = (subject: SubjectType) => {
    switch (subject) {
      case 'Logical Reasoning':
        return 'text-indigo-800 bg-indigo-50 border-indigo-200';
      case 'Abstract Reasoning':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Quantitative Aptitude':
        return 'text-terracotta-700 bg-terracotta-50 border-terracotta-200';
      case 'Verbal Ability':
        return 'text-sage-800 bg-sage-50 border-sage-200';
      default:
        return 'text-ink-800 bg-parchment-100 border-parchment-300';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Study Agenda • {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
            Welcome back, {profile.name}
          </h1>
          <p className="text-sm text-ink-700 mt-1">
            Here is your clean, focused study plan for today. Complete one session at a time with full concentration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-3.5 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-terracotta-600" />
            <span>{profile.role === 'mentor' ? 'Assign Task' : 'Add Task'}</span>
          </button>

          <button
            onClick={onStartFocus}
            className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold flex items-center gap-2 transition-colors shadow-soft"
          >
            <Play className="w-3.5 h-3.5 text-terracotta-300 fill-current" />
            <span>Start Focus Session</span>
          </button>
        </div>
      </div>

      {/* Progress & Target Overview Card */}
      <div className="p-6 rounded-3xl bg-white border border-parchment-200 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
          <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">
            Today's Target Completion
          </span>
          <div className="flex items-baseline gap-2 justify-center sm:justify-start">
            <span className="font-serif text-3xl font-bold text-ink-900">
              {completedCount} of {tasks.length}
            </span>
            <span className="text-xs text-ink-600 font-medium">tasks done</span>
            <span className="text-ink-300">•</span>
            <span className="text-xs text-ink-700 font-medium">
              {Math.round(completedMinutes / 60 * 10) / 10}h / {Math.round(totalMinutes / 60 * 10) / 10}h planned
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-64 space-y-2">
          <div className="h-2.5 w-full bg-parchment-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-terracotta-500 transition-all duration-500 rounded-full"
              style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-ink-500 font-medium">
            <span>Progress: {tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}%</span>
            <span>Target: {profile.dailyGoalHours}h Daily Goal</span>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-serif text-lg font-bold text-ink-900">
            Scheduled Tasks for Today
          </h2>
          <span className="text-xs text-ink-500">
            {tasks.length} items
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-parchment-200 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-sage-500 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-ink-900">All caught up for today!</h3>
            <p className="text-xs text-ink-600 max-w-sm mx-auto">
              No tasks currently scheduled. You can relax or add custom practice tasks whenever you are ready.
            </p>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 rounded-xl bg-ink-900 text-parchment-50 text-xs font-semibold"
            >
              Add a Study Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id}
                className={`p-5 rounded-2xl border transition-all ${
                  task.completed 
                    ? 'bg-parchment-100/60 border-parchment-200 opacity-75' 
                    : 'bg-white border-parchment-200 shadow-soft hover:border-terracotta-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Complete Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      task.completed 
                        ? 'bg-sage-600 text-white' 
                        : 'border-2 border-parchment-300 hover:border-terracotta-500 bg-white'
                    }`}
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSubjectColor(task.subject)}`}>
                        {task.subject}
                      </span>

                      <span className="text-[11px] text-ink-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-ink-400" />
                        <span>{task.estimatedMinutes} mins</span>
                      </span>

                      {task.assignedByMentor && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <UserCheck className="w-2.5 h-2.5 text-amber-600" />
                          <span>Assigned by Rushabh</span>
                        </span>
                      )}
                    </div>

                    <h3 className={`font-semibold text-sm text-ink-900 leading-snug ${task.completed ? 'line-through text-ink-500' : ''}`}>
                      {task.title}
                    </h3>

                    {task.mentorNote && (
                      <p className="text-xs text-amber-900 bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 mt-2 rounded-xl">
                        <strong>Mentor Note:</strong> {task.mentorNote}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.taskType === 'practice' ? (
                      <button
                        onClick={() => onStartPractice(task.topic)}
                        className="px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>Practice MCQs</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={onStartFocus}
                        className="px-3 py-1.5 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-ink-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <BookOpen className="w-3 h-3 text-terracotta-600" />
                        <span>Open Lesson</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-parchment-200 rounded-3xl max-w-lg w-full p-6 shadow-elevated">
            <h2 className="font-serif text-xl font-bold text-ink-900 mb-1">
              {profile.role === 'mentor' ? "Assign Daily Task to Sanskriti" : "Add Task to Today's Plan"}
            </h2>
            <p className="text-xs text-ink-600 mb-5">
              Set clear goals for today so study sessions remain structured and measurable.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-800 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Practice 15 Questions on Successive Percentages"
                  className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ink-800 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none bg-white"
                  >
                    <option value="Logical Reasoning">Logical Reasoning</option>
                    <option value="Abstract Reasoning">Abstract Reasoning</option>
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-ink-800 mb-1">Estimated Time (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink-800 mb-1">Topic Name</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Percentages & Base Values"
                  className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-800 mb-1">Mentor Note (Optional)</label>
                <textarea
                  value={newMentorNote}
                  onChange={(e) => setNewMentorNote(e.target.value)}
                  placeholder="e.g. Pay special attention to the reverse base ratio formula."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl border border-parchment-300 text-ink-700 hover:bg-parchment-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 font-semibold shadow-soft"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
