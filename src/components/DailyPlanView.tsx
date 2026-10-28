import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  UserCheck, 
  Play, 
  Sparkles, 
  ArrowRight,
  Check,
  X,
  Target,
  Bot
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
  const completionPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

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

    setNewTitle('');
    setNewMentorNote('');
    setShowAddTaskModal(false);
  };

  const getSubjectBadge = (subject: SubjectType) => {
    switch (subject) {
      case 'Logical Reasoning':
        return 'text-indigo-900 bg-indigo-50/80 border-indigo-200/70';
      case 'Abstract Reasoning':
        return 'text-amber-900 bg-amber-50/80 border-amber-200/70';
      case 'Quantitative Aptitude':
        return 'text-terracotta-800 bg-terracotta-50/80 border-terracotta-200/70';
      case 'Verbal Ability':
        return 'text-sage-800 bg-sage-50/80 border-sage-200/70';
      default:
        return 'text-ink-800 bg-parchment-100 border-parchment-200';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      
      {/* Serene Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <div className="text-xs text-ink-500 font-medium mb-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Welcome back, {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 mt-1">
            One focused session at a time. No rushing, no shame.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-3.5 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink-800 text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Add Task</span>
          </button>

          <button
            onClick={onStartFocus}
            className="px-3.5 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 text-parchment-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm min-h-[40px]"
          >
            <Play className="w-3.5 h-3.5 text-terracotta-300 fill-current" />
            <span>Start Study Session (Quiz)</span>
          </button>
        </div>
      </div>

      {/* Calm Daily Progress Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-parchment-200 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-xs text-ink-500 font-medium">Daily Study Budget</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-serif text-xl sm:text-2xl font-bold text-ink-900">
                {completedCount} of {tasks.length}
              </span>
              <span className="text-xs text-ink-600">tasks completed</span>
              <span className="text-ink-300 hidden sm:inline">/</span>
              <span className="text-xs text-ink-600">
                {Math.round(completedMinutes / 60 * 10) / 10}h of {Math.round(totalMinutes / 60 * 10) / 10}h planned
              </span>
            </div>
          </div>

          <div className="text-right sm:text-right text-xs text-ink-500">
            <span>Goal: {profile.dailyGoalHours}h daily</span>
          </div>
        </div>

        {/* Minimal Progress Line */}
        <div className="h-2 w-full bg-parchment-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-terracotta-500 rounded-full transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Note from Personal AI Companion */}
      <div className="p-4 sm:p-5 rounded-2xl bg-parchment-100/70 border border-parchment-200/80 flex items-start gap-3.5 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-ink-900 text-terracotta-300 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-soft">
          <Bot className="w-4 h-4 stroke-[2]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-serif font-bold text-xs text-ink-900 flex items-center gap-1.5">
              <span>Ruvi Daily Briefing</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onStartFocus}
                className="text-xs font-bold text-terracotta-700 hover:text-terracotta-800 transition-colors flex items-center gap-1 bg-terracotta-50 px-2 py-1 rounded-lg border border-terracotta-200"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>Start Quiz Now</span>
              </button>
              <button
                onClick={() => onOpenCompanion('Give me a full readiness report for today.')}
                className="text-xs font-semibold text-ink-600 hover:text-ink-900 transition-colors flex items-center gap-1"
              >
                <span>Consult</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-ink-700 mt-1 leading-relaxed">
            "Hey Sanskriti! Ruvi here. Your English Chapter Pack (100 calibrated questions) is ready for today. Tap 'Start Quiz Now' to automatically open full-screen focus mode and test this chapter right away!"
          </p>
        </div>
      </div>

      {/* Scheduled Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-serif text-base sm:text-lg font-bold text-ink-900">
            Scheduled Sessions
          </h2>
          <span className="text-xs text-ink-500">
            {tasks.length} items
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-parchment-200 space-y-3">
            <CheckCircle2 className="w-8 h-8 text-sage-600 mx-auto" />
            <h3 className="font-serif text-base font-bold text-ink-900">All sessions completed for today</h3>
            <p className="text-xs text-ink-600 max-w-sm mx-auto">
              Your mind has earned a restful break. You can start a practice test whenever you wish.
            </p>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 rounded-xl bg-parchment-100 border border-parchment-300 text-ink-800 text-xs font-medium"
            >
              Add another session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
                  task.completed 
                    ? 'bg-parchment-100/40 border-parchment-200 opacity-60' 
                    : 'bg-white border-parchment-200 shadow-soft hover:border-parchment-300'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  
                  {/* Comfortable Touch Checkbox (min 44px tap zone) */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 border border-parchment-300 hover:border-terracotta-500"
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed ? (
                      <div className="w-full h-full rounded-md bg-sage-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-3 h-3 rounded-sm bg-transparent" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Meta Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${getSubjectBadge(task.subject)}`}>
                        {task.subject}
                      </span>

                      <span className="text-[11px] text-ink-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-ink-400" />
                        <span>{task.estimatedMinutes} mins</span>
                      </span>

                      {task.assignedByMentor && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-parchment-100 text-ink-700 border border-parchment-200 flex items-center gap-1">
                          <UserCheck className="w-2.5 h-2.5 text-ink-500" />
                          <span>Assigned by Rushabh</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`font-semibold text-sm sm:text-base text-ink-900 leading-snug ${task.completed ? 'line-through text-ink-500' : ''}`}>
                      {task.title}
                    </h3>

                    {/* Mentor Note */}
                    {task.mentorNote && (
                      <div className="text-xs text-ink-800 bg-parchment-50 border border-parchment-200 px-3 py-2 mt-2 rounded-xl">
                        <span className="font-semibold text-terracotta-700">Mentor note: </span>
                        <span>{task.mentorNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Practice / Start Button (min 44px tap target) */}
                  <div className="flex items-center flex-shrink-0 self-center sm:self-start">
                    {task.taskType === 'practice' ? (
                      <button
                        onClick={() => onStartPractice(task.topic)}
                        className="px-3 py-2 rounded-xl bg-parchment-100 hover:bg-terracotta-50 hover:text-terracotta-700 border border-parchment-300 text-ink-800 text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[40px]"
                      >
                        <span>Practice</span>
                        <ArrowRight className="w-3 h-3 text-terracotta-600" />
                      </button>
                    ) : (
                      <button
                        onClick={onStartFocus}
                        className="px-3 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink-800 text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[40px]"
                      >
                        <Play className="w-3 h-3 text-ink-600 fill-current" />
                        <span>Focus</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Socratic Hint Pill for Sanskriti */}
      <div className="p-4 rounded-2xl bg-parchment-100/70 border border-parchment-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-terracotta-600 flex-shrink-0" />
          <span className="text-xs text-ink-700">
            Have a question on base-value shifts or circular arrangements?
          </span>
        </div>
        <button
          onClick={() => onOpenCompanion('Explain percentage base value shifts in Hinglish with simple examples.')}
          className="text-xs font-semibold text-terracotta-700 hover:underline flex-shrink-0"
        >
          Ask Companion
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-parchment-300 p-6 max-w-md w-full shadow-elevated space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-parchment-200">
              <h3 className="font-serif text-lg font-bold text-ink-900">
                {profile.role === 'mentor' ? 'Assign Study Task' : 'Add Study Task'}
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="w-7 h-7 rounded-full bg-parchment-100 text-ink-600 hover:bg-parchment-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Circular Arrangement: Facing Inward Practice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-parchment-300 text-xs sm:text-sm text-ink-900 focus:border-terracotta-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value as SubjectType)}
                    className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs text-ink-900 bg-white"
                  >
                    <option value="Quantitative Aptitude">Quant</option>
                    <option value="Logical Reasoning">Logical Reasoning</option>
                    <option value="Abstract Reasoning">Abstract Reasoning</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    step="5"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs text-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Topic Keyword
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-parchment-300 text-xs text-ink-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Mentor Guidance Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific focus or formula advice..."
                  value={newMentorNote}
                  onChange={(e) => setNewMentorNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-parchment-300 text-xs text-ink-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl border border-parchment-300 text-xs text-ink-700 hover:bg-parchment-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-medium shadow-sm"
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
