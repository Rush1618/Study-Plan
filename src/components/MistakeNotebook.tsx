import React, { useState } from 'react';
import { 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight, 
  Filter, 
  TrendingUp, 
  HelpCircle,
  Sparkles,
  Play
} from 'lucide-react';
import { MistakeRecord } from '../types';
import { StorageService } from '../services/storage';

interface MistakeNotebookProps {
  onStartParallelTest: (mistakeId: string) => void;
  onOpenCompanion: (prompt: string) => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  onStartParallelTest,
  onOpenCompanion
}) => {
  const [mistakesList, setMistakesList] = useState<MistakeRecord[]>(() => StorageService.getMistakes());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeParallelId, setActiveParallelId] = useState<string | null>(null);
  const [parallelSelection, setParallelSelection] = useState<Record<string, string>>({});
  const [parallelFeedback, setParallelFeedback] = useState<Record<string, boolean>>({});

  const toggleResolved = (id: string) => {
    const updated = mistakesList.map(m => {
      if (m.id === id) {
        return { ...m, resolved: !m.resolved };
      }
      return m;
    });
    setMistakesList(updated);
    StorageService.saveMistakes(updated);
  };

  const handleSolveParallel = (mistakeId: string, choice: string, correct: string) => {
    setParallelSelection(prev => ({ ...prev, [mistakeId]: choice }));
    const isRight = choice === correct;
    setParallelFeedback(prev => ({ ...prev, [mistakeId]: isRight }));

    if (isRight) {
      setTimeout(() => {
        const updated = mistakesList.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
        setMistakesList(updated);
        StorageService.saveMistakes(updated);
      }, 800);
    }
  };

  const filteredMistakes = mistakesList.filter(m => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Unresolved') return !m.resolved;
    if (selectedCategory === 'Resolved') return m.resolved;
    return m.mistakeCategory === selectedCategory;
  });

  const categories = [
    'All',
    'Unresolved',
    'Wrong Base Value',
    'Direction/Orientation Error',
    'Conceptual Gap',
    'Resolved'
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
            Mistake Notebook & Parallel Calibration
          </h1>
          <p className="text-sm text-ink-700 mt-1">
            We don't hide mistakes or feel shame. We classify the root misunderstanding, master the rule, and prove it with parallel questions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-rose-100 text-rose-800 px-3 py-1.5 rounded-xl font-bold border border-rose-200">
            {mistakesList.filter(m => !m.resolved).length} Unresolved Errors
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <Filter className="w-4 h-4 text-ink-500 mr-1 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-ink-900 text-parchment-50 shadow-sm' 
                : 'bg-parchment-100 hover:bg-parchment-200 text-ink-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mistakes Card Feed */}
      <div className="space-y-6">
        {filteredMistakes.map((mistake) => {
          const isParallelOpen = activeParallelId === mistake.id;
          const userParallelChoice = parallelSelection[mistake.id];
          const hasAnsweredParallel = userParallelChoice !== undefined;
          const isParallelCorrect = parallelFeedback[mistake.id];

          return (
            <div 
              key={mistake.id}
              className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                mistake.resolved 
                  ? 'bg-parchment-50 border-sage-200 opacity-80' 
                  : 'bg-white border-parchment-200 shadow-soft'
              }`}
            >
              {/* Card Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    mistake.mistakeCategory === 'Wrong Base Value' 
                      ? 'bg-terracotta-100 text-terracotta-800 border border-terracotta-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {mistake.mistakeCategory}
                  </span>
                  <span className="text-xs font-bold text-ink-900">
                    {mistake.subject} • {mistake.topic}
                  </span>
                  {mistake.repeatedCount > 1 && (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Repeated {mistake.repeatedCount}×
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleResolved(mistake.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    mistake.resolved 
                      ? 'bg-sage-100 text-sage-800 border-sage-300' 
                      : 'bg-parchment-100 hover:bg-parchment-200 text-ink-700 border-parchment-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{mistake.resolved ? "Resolved & Retested" : "Mark Resolved"}</span>
                </button>
              </div>

              {/* Question Excerpt */}
              <div className="font-serif text-base text-ink-900 font-medium mb-4 italic">
                "{mistake.questionExcerpt}"
              </div>

              {/* Diagnosis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-xs">
                
                {/* Sanskriti's Choice & Identified Misunderstanding */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                  <div className="font-bold text-rose-900 flex items-center justify-between">
                    <span>What Sanskriti Selected: Option ({mistake.selectedAnswer})</span>
                    <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded">Recorded Error</span>
                  </div>
                  <div className="text-rose-800 leading-relaxed font-sans">
                    <strong>Misunderstanding:</strong> {mistake.misunderstandingIdentified}
                  </div>
                </div>

                {/* Correct Answer & Formula Principle */}
                <div className="p-4 rounded-2xl bg-sage-50/60 border border-sage-200 space-y-1.5">
                  <div className="font-bold text-sage-900 flex items-center justify-between">
                    <span>Correct Choice: Option ({mistake.correctAnswer})</span>
                    <span className="text-[10px] bg-sage-200 text-sage-800 px-1.5 py-0.5 rounded">Ground Truth</span>
                  </div>
                  <div className="text-sage-800 leading-relaxed font-sans">
                    <strong>Correct Logic:</strong> {mistake.correctReasoningFormula}
                  </div>
                </div>

              </div>

              {/* Actions Footer: Socratic companion & In-Card Parallel Retest */}
              <div className="pt-4 border-t border-parchment-200 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => onOpenCompanion(`I'm struggling with the mistake "${mistake.misunderstandingIdentified}" in topic ${mistake.topic}. Please teach me Socratic step-by-step.`)}
                  className="text-xs text-ink-700 hover:text-terracotta-600 font-semibold flex items-center gap-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-terracotta-500" />
                  <span>Teach me this concept in Hinglish</span>
                </button>

                {mistake.parallelQuestion && (
                  <button
                    onClick={() => setActiveParallelId(isParallelOpen ? null : mistake.id)}
                    className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-bold flex items-center gap-2 transition-colors shadow-soft"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isParallelOpen ? "Hide Parallel Drill" : "Attempt Parallel Question Now"}</span>
                  </button>
                )}
              </div>

              {/* In-Card Interactive Parallel Question Solver */}
              {isParallelOpen && mistake.parallelQuestion && (
                <div className="mt-6 p-6 rounded-2xl bg-parchment-100 border border-terracotta-400 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-terracotta-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parallel Concept Test (Different Values, Same Logic)</span>
                    </span>
                    <span className="text-[11px] font-mono text-ink-500">Solve in 60s</span>
                  </div>

                  <p className="font-serif text-sm font-semibold text-ink-900">
                    {mistake.parallelQuestion.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((key) => {
                      const optText = mistake.parallelQuestion!.options[key];
                      const isSelected = userParallelChoice === key;

                      return (
                        <button
                          key={key}
                          disabled={hasAnsweredParallel}
                          onClick={() => handleSolveParallel(mistake.id, key, mistake.parallelQuestion!.correctAnswer)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                            isSelected 
                              ? isParallelCorrect 
                                ? 'bg-sage-600 text-white border-sage-700' 
                                : 'bg-rose-600 text-white border-rose-700' 
                              : 'bg-white border-parchment-300 hover:border-ink-500 text-ink-900'
                          }`}
                        >
                          <span><strong>({key})</strong> {optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {hasAnsweredParallel && (
                    <div className={`p-3 rounded-xl text-xs font-medium ${
                      isParallelCorrect ? 'bg-sage-100 text-sage-900 border border-sage-200' : 'bg-rose-100 text-rose-900 border border-rose-200'
                    }`}>
                      {isParallelCorrect ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-sage-600" />
                          <span>Brilliant! You shifted the base correctly. Concept is calibrated! Marked as resolved.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>Not quite. Base was Rohan's salary (150). Difference (50) / 150 = 33.33%. Ask Companion for assistance.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
