import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  BarChart3, 
  FileText, 
  ChevronRight,
  BrainCircuit,
  Lightbulb
} from 'lucide-react';
import { TopicMastery, MistakeRecord, UserProfile } from '../types';
import { LearningEngine } from '../services/learningEngine';

interface DashboardViewProps {
  profile: UserProfile;
  topicMasteries: TopicMastery[];
  mistakes: MistakeRecord[];
  onStartPractice: (type: string, payload?: any) => void;
  onOpenCompanion: (initialPrompt?: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  topicMasteries,
  mistakes,
  onStartPractice,
  onOpenCompanion,
  onNavigateToTab
}) => {
  const unresolvedMistakes = mistakes.filter(m => !m.resolved);
  const liveRecommendation = LearningEngine.generateCurrentRecommendation();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-parchment-200">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
            Welcome to your sanctuary, {profile.name}.
          </h1>
          <p className="text-sm text-ink-700 mt-2 max-w-2xl font-normal leading-relaxed">
            Wednesday, 28 October 2026 • One clear concept, one calm breath, one focused session at a time.
          </p>
        </div>

        {/* Daily Target Progress Widget */}
        <div className="bg-parchment-100 border border-parchment-300 rounded-2xl p-4 flex items-center gap-4 shadow-soft">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-parchment-200"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-terracotta-500"
                strokeDasharray="125.6"
                strokeDashoffset="75.3"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-bold text-ink-900">40%</span>
          </div>
          <div>
            <div className="text-xs text-ink-700 font-medium">Daily Focus Budget</div>
            <div className="text-sm font-bold text-ink-900">1.4 / {profile.dailyGoalHours} hrs completed</div>
            <div className="text-[11px] text-sage-600 font-medium">Sustainable pace maintained</div>
          </div>
        </div>
      </div>

      {/* Hero Recommendation Card: Live Cognitive Engine Priority */}
      <div className="bg-ink-900 text-parchment-50 rounded-3xl p-6 sm:p-8 shadow-elevated border border-ink-800 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-terracotta-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-10 bottom-0 opacity-5 pointer-events-none">
          <BrainCircuit className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-500/20 border border-terracotta-400/30 text-terracotta-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Study Companion Live Recommendation</span>
            </div>
            <span className="text-xs text-parchment-300/70 font-mono">
              Recalculated from latest attempt events
            </span>
          </div>

          <div className="max-w-3xl space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
              “{liveRecommendation.priorityTopic}: {liveRecommendation.identifiedGap}”
            </h2>
            <p className="text-sm sm:text-base text-parchment-200/90 leading-relaxed font-sans">
              {liveRecommendation.recommendationText}
            </p>
          </div>

          {/* Evidence citation pill */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-parchment-300">
            <div className="flex items-center gap-2 bg-ink-800/80 px-3 py-1.5 rounded-lg border border-ink-700">
              <FileText className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Evidence: <strong>MAH-CET-Speed-Math-Formulas.pdf</strong> (Page 42, §3.4)</span>
            </div>
            <div className="flex items-center gap-2 bg-ink-800/80 px-3 py-1.5 rounded-lg border border-ink-700">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{unresolvedMistakes.length} Active Errors in Mistake Notebook</span>
            </div>
          </div>

          {/* Action trigger */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartPractice('ai_adaptive')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-sm transition-all shadow-soft transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Calibrated Practice (5 Qs)</span>
            </button>

            <button
              onClick={() => onOpenCompanion(`Explain ${liveRecommendation.priorityTopic} step by step in Hinglish with worked examples.`)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-ink-800 hover:bg-ink-700 text-parchment-100 text-sm font-medium transition-colors border border-ink-700"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Teach Me Concept in Hinglish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 3 Primary Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pillar 1: Unresolved Mistake Redo */}
        <div className="bg-parchment-50 border border-parchment-200 rounded-3xl p-6 shadow-soft hover:shadow-elevated transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {unresolvedMistakes.length} to calibrate
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-ink-900">Mistake Notebook Redo</h3>
            <p className="text-xs text-ink-700 mt-1 leading-relaxed">
              Never let mistakes linger. Retest flagged questions with parallel variants testing the exact same underlying mathematical logic.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-parchment-100 border border-parchment-200 text-xs space-y-1">
              <div className="font-semibold text-ink-900">Highest Recurring Trap:</div>
              <div className="text-ink-700">"Wrong Base Value in Percentage Inversion"</div>
            </div>
          </div>

          <button
            onClick={() => onStartPractice('mistake_redo')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Attempt Mistake Redo Set</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 2: CET Sectional Timing & Balance */}
        <div className="bg-parchment-50 border border-parchment-200 rounded-3xl p-6 shadow-soft hover:shadow-elevated transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-ink-100 border border-ink-200 flex items-center justify-center text-ink-800">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-ink-100 text-ink-800">
                CET Exam Profile
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-ink-900">Sectional Mastery Pulse</h3>
            <p className="text-xs text-ink-700 mt-1 leading-relaxed">
              MAH-CET consists of 200 questions in 150 minutes with no negative marking. Speed-to-accuracy ratio determines top percentiles.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-ink-800 mb-1">
                  <span>Abstract Reasoning (25 Qs)</span>
                  <span className="font-bold text-sage-600">88% (Fast: 34s)</span>
                </div>
                <div className="w-full bg-parchment-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sage-500 h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink-800 mb-1">
                  <span>Verbal Ability (50 Qs)</span>
                  <span className="font-bold text-ink-900">70%</span>
                </div>
                <div className="w-full bg-parchment-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-ink-700 h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink-800 mb-1">
                  <span>Logical Reasoning (75 Qs)</span>
                  <span className="font-bold text-ink-900">64%</span>
                </div>
                <div className="w-full bg-parchment-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-ink-700 h-full rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-ink-800 mb-1">
                  <span>Quantitative Aptitude (50 Qs)</span>
                  <span className="font-bold text-terracotta-600">{liveRecommendation.topicAccuracy}% (Active Focus)</span>
                </div>
                <div className="w-full bg-parchment-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-terracotta-500 h-full rounded-full" style={{ width: `${liveRecommendation.topicAccuracy}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartPractice('sectional')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-ink-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Start Sectional Test Sprint</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 3: Study Library & Grounded Material */}
        <div className="bg-parchment-50 border border-parchment-200 rounded-3xl p-6 shadow-soft hover:shadow-elevated transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                3 Notes Active
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-ink-900">My Study Library</h3>
            <p className="text-xs text-ink-700 mt-1 leading-relaxed">
              Every practice set and Socratic explanation is verified against your uploaded materials with exact page citations.
            </p>

            <div className="mt-4 space-y-2">
              <div className="p-2.5 rounded-xl bg-parchment-100 border border-parchment-200 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <div className="font-semibold text-ink-900 truncate">MAH-CET-Speed-Math.pdf</div>
                  <div className="text-[10px] text-ink-500">35 MCQs Extracted • 142 Chunks</div>
                </div>
                <span className="text-sage-600 font-bold text-[10px]">Indexed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-parchment-100 border border-parchment-200 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <div className="font-semibold text-ink-900 truncate">Logical-Puzzles-Handbook.docx</div>
                  <div className="text-[10px] text-ink-500">28 MCQs Extracted • 88 Chunks</div>
                </div>
                <span className="text-sage-600 font-bold text-[10px]">Indexed</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('library')}
            className="mt-6 w-full py-2.5 px-4 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-ink-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Open Study Library</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Today's Structured Session Schedule */}
      <div className="bg-parchment-100/70 border border-parchment-200 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-ink-900">Today's Focus Itinerary</h3>
            <p className="text-xs text-ink-600 mt-0.5">Customized for Sanskriti's 3.5 planned hours with intentional cognitive breaks</p>
          </div>
          <div className="text-xs text-ink-700 bg-parchment-50 px-3 py-1.5 rounded-xl border border-parchment-200 font-medium">
            Roadmap Phase 1: Foundation & Arithmetic Core (Week 1 of 24)
          </div>
        </div>

        <div className="space-y-3">
          {/* Task 1 */}
          <div className="p-4 rounded-2xl bg-white border border-parchment-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-terracotta-300 transition-colors">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-ink-900">Quant: Successive Percentage & Base Inversion</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-terracotta-100 text-terracotta-800">
                    High Priority
                  </span>
                </div>
                <div className="text-xs text-ink-600 mt-0.5">
                  Revise base value shift formula [x / (100 + x)] and calibrate with 10 questions.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-500 font-mono">45 mins</span>
              <button
                onClick={() => onStartPractice('topic', { subject: 'Quantitative Aptitude', topic: 'Percentages & Ratios' })}
                className="px-3.5 py-1.5 rounded-lg bg-ink-900 hover:bg-terracotta-500 text-white text-xs font-semibold transition-colors"
              >
                Begin
              </button>
            </div>
          </div>

          {/* Task 2 */}
          <div className="p-4 rounded-2xl bg-white border border-parchment-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-ink-400 transition-colors">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-ink-100 text-ink-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-ink-900">LR: Circular Seating (Dual Inward/Outward Direction)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ink-100 text-ink-800">
                    Core Puzzle
                  </span>
                </div>
                <div className="text-xs text-ink-600 mt-0.5">
                  Practice 2 full 8-person circular puzzles with mixed facing constraints.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-500 font-mono">50 mins</span>
              <button
                onClick={() => onStartPractice('topic', { subject: 'Logical Reasoning', topic: 'Seating Arrangements' })}
                className="px-3.5 py-1.5 rounded-lg bg-ink-900 hover:bg-terracotta-500 text-white text-xs font-semibold transition-colors"
              >
                Begin
              </button>
            </div>
          </div>

          {/* Task 3 */}
          <div className="p-4 rounded-2xl bg-white border border-parchment-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-sage-400 transition-colors">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-ink-900">Abstract Reasoning: Rotational Series Sprint</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sage-100 text-sage-800">
                    Speed Maintenance
                  </span>
                </div>
                <div className="text-xs text-ink-600 mt-0.5">
                  15 questions targeting under 40 seconds per question with high accuracy.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-500 font-mono">20 mins</span>
              <button
                onClick={() => onStartPractice('quick', { subject: 'Abstract Reasoning' })}
                className="px-3.5 py-1.5 rounded-lg bg-ink-900 hover:bg-terracotta-500 text-white text-xs font-semibold transition-colors"
              >
                Begin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
