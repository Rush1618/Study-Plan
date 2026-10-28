import React, { useState } from 'react';
import { 
  AlertCircle, 
  RotateCcw, 
  CheckCircle2, 
  Lightbulb, 
  Filter, 
  Sparkles,
  Zap,
  Clock,
  Target,
  BookOpen
} from 'lucide-react';
import { MistakeRecord, Question } from '../types';
import { StorageService } from '../services/storage';
import { LearningEngine } from '../services/learningEngine';

interface MistakeNotebookProps {
  onStartParallelTest: (mistakeId: string) => void;
  onOpenCompanion: (prompt: string) => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  onStartParallelTest: _onStartParallelTest,
  onOpenCompanion
}) => {
  const [mistakesList, setMistakesList] = useState<MistakeRecord[]>(() => StorageService.getMistakes());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Track open parallel drill per mistake
  const [activeDrillMistakeId, setActiveDrillMistakeId] = useState<string | null>(null);
  // Track selected problem index within the 3 parallel problems (0, 1, 2)
  const [activeProblemIdx, setActiveProblemIdx] = useState<Record<string, number>>({});
  // Track selected answer per (mistakeId + problemIdx)
  const [parallelSelection, setParallelSelection] = useState<Record<string, string>>({});
  // Track correct/incorrect feedback per (mistakeId + problemIdx)
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

  const getDrillQuestions = (mistake: MistakeRecord): Question[] => {
    if (mistake.parallelQuestionsList && mistake.parallelQuestionsList.length > 0) {
      return mistake.parallelQuestionsList;
    }
    if (mistake.parallelQuestion) {
      return [mistake.parallelQuestion];
    }
    // Generate fallback 3 questions
    const fallbackQ: Question = {
      id: mistake.questionId,
      subject: mistake.subject,
      topic: mistake.topic,
      subtopic: mistake.subtopic || mistake.topic,
      difficulty: "CET Standard",
      questionText: mistake.questionExcerpt,
      options: { A: "Option A", B: "Option B", C: "Option C", D: "Option D", E: "Option E" },
      correctAnswer: mistake.correctAnswer,
      explanation: mistake.correctReasoningFormula
    };
    const list = LearningEngine.generateMultipleParallelQuestions(fallbackQ, 3);
    return list;
  };

  const handleSolveParallel = (
    mistakeId: string, 
    problemIdx: number, 
    choice: string, 
    correct: string
  ) => {
    const key = `${mistakeId}-${problemIdx}`;
    setParallelSelection(prev => ({ ...prev, [key]: choice }));
    const isRight = choice === correct;
    setParallelFeedback(prev => ({ ...prev, [key]: isRight }));

    if (isRight) {
      setTimeout(() => {
        const updated = mistakesList.map(m => m.id === mistakeId ? { ...m, resolved: true } : m);
        setMistakesList(updated);
        StorageService.saveMistakes(updated);
      }, 700);
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
    'Careless Speed Trap',
    'Wrong Base Value',
    'Syntax & Agreement Rule Gap',
    'Lexical & Idiom Blindspot',
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
            Mistake Notebook & Error Diagnostics
          </h1>
          <p className="text-sm text-ink-700 mt-1">
            CET 99.99%ile accuracy comes from decoding examiner traps, mastering 10-second checkpoints, and practicing 3 parallel variations.
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
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
        {filteredMistakes.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-parchment-200 text-ink-600 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-serif text-base font-bold text-ink-900">No mistakes found in this category.</p>
            <p className="text-xs text-ink-500">Keep practicing! Any incorrect attempt in mock quizzes will appear here with in-depth examiner trap diagnostics.</p>
          </div>
        ) : (
          filteredMistakes.map((mistake) => {
            const isDrillOpen = activeDrillMistakeId === mistake.id;
            const drillQuestions = getDrillQuestions(mistake);
            const currentIdx = activeProblemIdx[mistake.id] || 0;
            const activeQuestion = drillQuestions[currentIdx] || drillQuestions[0];
            const activeKey = `${mistake.id}-${currentIdx}`;
            const userChoice = parallelSelection[activeKey];
            const hasAnswered = userChoice !== undefined;
            const isCorrect = parallelFeedback[activeKey];

            return (
              <div 
                key={mistake.id}
                className={`p-6 sm:p-8 rounded-3xl border transition-all ${
                  mistake.resolved 
                    ? 'bg-parchment-50/80 border-sage-200 opacity-90' 
                    : 'bg-white border-parchment-200 shadow-soft'
                }`}
              >
                {/* Card Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      mistake.mistakeCategory === 'Careless Speed Trap'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : mistake.mistakeCategory === 'Wrong Base Value' 
                        ? 'bg-terracotta-100 text-terracotta-800 border border-terracotta-200' 
                        : mistake.mistakeCategory === 'Syntax & Agreement Rule Gap'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : mistake.mistakeCategory === 'Lexical & Idiom Blindspot'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
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
                    <span>{mistake.resolved ? "Resolved & Calibrated" : "Mark Resolved"}</span>
                  </button>
                </div>

                {/* Question Excerpt */}
                <div className="font-serif text-base text-ink-900 font-medium mb-4 italic bg-parchment-50 p-4 rounded-2xl border border-parchment-200">
                  "{mistake.questionExcerpt}"
                </div>

                {/* Core Misunderstanding vs Ground Truth Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
                  {/* Student's Choice & Identified Misunderstanding */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                    <div className="font-bold text-rose-900 flex items-center justify-between">
                      <span>Selected: Option ({mistake.selectedAnswer})</span>
                      <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-mono">Recorded Error</span>
                    </div>
                    <div className="text-rose-800 leading-relaxed font-sans">
                      <strong>Misunderstanding:</strong> {mistake.misunderstandingIdentified}
                    </div>
                  </div>

                  {/* Correct Answer & Formula Principle */}
                  <div className="p-4 rounded-2xl bg-sage-50/70 border border-sage-200 space-y-1.5">
                    <div className="font-bold text-sage-900 flex items-center justify-between">
                      <span>Correct Answer: Option ({mistake.correctAnswer})</span>
                      <span className="text-[10px] bg-sage-200 text-sage-800 px-1.5 py-0.5 rounded font-mono">CET Key</span>
                    </div>
                    <div className="text-sage-800 leading-relaxed font-sans">
                      <strong>Correct Principle:</strong> {mistake.correctReasoningFormula}
                    </div>
                  </div>
                </div>

                {/* Rich CET Examiner Trap & Cognitive Diagnostics */}
                {(mistake.examinerTrapAnalysis || mistake.preventiveHabit || mistake.hinglishTip) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-xs">
                    {mistake.examinerTrapAnalysis && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900">
                          <Target className="w-3.5 h-3.5 text-amber-600" />
                          <span>Why Examiner Set This Trap</span>
                        </div>
                        <p className="text-amber-800 text-[11px] leading-relaxed">
                          {mistake.examinerTrapAnalysis}
                        </p>
                      </div>
                    )}

                    {mistake.preventiveHabit && (
                      <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-sky-900">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          <span>10-Second Mental Checkpoint</span>
                        </div>
                        <p className="text-sky-800 text-[11px] leading-relaxed">
                          {mistake.preventiveHabit}
                        </p>
                      </div>
                    )}

                    {mistake.hinglishTip && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Hinglish Intuition Anchor</span>
                        </div>
                        <p className="text-emerald-800 text-[11px] leading-relaxed">
                          {mistake.hinglishTip}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-4 border-t border-parchment-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenCompanion(`I'm reviewing my mistake in "${mistake.topic}" where I chose (${mistake.selectedAnswer}) instead of (${mistake.correctAnswer}): "${mistake.misunderstandingIdentified}". Can you explain this trap to me warmly like ChatGPT with a clean Hinglish example?`)}
                    className="text-xs text-ink-700 hover:text-terracotta-600 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-terracotta-500" />
                    <span>Ask Ruvi to explain in Hinglish</span>
                  </button>

                  <button
                    onClick={() => setActiveDrillMistakeId(isDrillOpen ? null : mistake.id)}
                    className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-terracotta-600 text-parchment-50 text-xs font-bold flex items-center gap-2 transition-colors shadow-soft"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isDrillOpen ? "Hide Parallel Practice" : `Practice 3 Parallel Problems (${drillQuestions.length} Available)`}</span>
                  </button>
                </div>

                {/* 3-Problem Parallel Interactive Drill Box */}
                {isDrillOpen && (
                  <div className="mt-6 p-6 rounded-3xl bg-parchment-100 border border-terracotta-300 shadow-soft space-y-4 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-parchment-300 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-terracotta-600" />
                        <h4 className="font-bold text-xs sm:text-sm text-ink-900">
                          Parallel Concept Drill: Solve 3 Variations to Lock In Pattern
                        </h4>
                      </div>

                      {/* Drill Tabs 1, 2, 3 */}
                      <div className="flex items-center gap-1.5">
                        {drillQuestions.map((_, pIdx) => {
                          const pKey = `${mistake.id}-${pIdx}`;
                          const isDone = parallelFeedback[pKey] === true;
                          return (
                            <button
                              key={pIdx}
                              onClick={() => setActiveProblemIdx(prev => ({ ...prev, [mistake.id]: pIdx }))}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                                currentIdx === pIdx
                                  ? 'bg-ink-900 text-white'
                                  : isDone
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-white text-ink-700 hover:bg-parchment-200'
                              }`}
                            >
                              <span>Problem #{pIdx + 1}</span>
                              {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Question Text */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-wider">
                        Problem {currentIdx + 1} of {drillQuestions.length} • Target: 45s
                      </span>
                      <p className="font-serif text-sm font-semibold text-ink-900 leading-relaxed">
                        {activeQuestion.questionText}
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(['A', 'B', 'C', 'D', 'E'] as const).map((key) => {
                        const optText = activeQuestion.options[key];
                        if (!optText) return null;
                        const isSelected = userChoice === key;

                        return (
                          <button
                            key={key}
                            disabled={hasAnswered}
                            onClick={() => handleSolveParallel(mistake.id, currentIdx, key, activeQuestion.correctAnswer)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                              isSelected 
                                ? isCorrect 
                                  ? 'bg-sage-600 text-white border-sage-700 shadow-sm' 
                                  : 'bg-rose-600 text-white border-rose-700 shadow-sm' 
                                : 'bg-white border-parchment-300 hover:border-terracotta-400 text-ink-900'
                            }`}
                          >
                            <span><strong>({key})</strong> {optText}</span>
                            {isSelected && (
                              isCorrect 
                                ? <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                                : <AlertCircle className="w-4 h-4 text-white flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Answer Feedback & Breakdown */}
                    {hasAnswered && (
                      <div className={`p-4 rounded-2xl text-xs space-y-1.5 animate-fadeIn ${
                        isCorrect ? 'bg-sage-100 text-sage-900 border border-sage-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        <div className="flex items-center gap-2 font-bold">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-sage-700" />
                              <span>Correct! Concept successfully mastered for Problem #{currentIdx + 1}.</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-rose-700" />
                              <span>Incorrect. Correct answer was ({activeQuestion.correctAnswer}).</span>
                            </>
                          )}
                        </div>
                        <p className="text-ink-800 text-[11px] leading-relaxed">
                          {activeQuestion.explanation}
                        </p>
                        {activeQuestion.hinglishExplanation && (
                          <p className="text-ink-700 text-[11px] italic bg-white/60 p-2 rounded-xl mt-1">
                            💡 <strong>Hinglish Hint:</strong> {activeQuestion.hinglishExplanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
