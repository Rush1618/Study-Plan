import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  AlertCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  FileText, 
  Lightbulb, 
  Languages, 
  Grid, 
  Send,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, PracticeMode, MistakeRecord, UserProfile, SubjectType } from '../types';
import { sampleQuestions, sampleMistakes } from '../data/mockData';

interface McqEngineProps {
  profile: UserProfile;
  initialMode?: PracticeMode;
  onRecordMistake?: (mistake: MistakeRecord) => void;
  onOpenCompanion: (query: string) => void;
}

export const McqEngine: React.FC<McqEngineProps> = ({
  profile,
  initialMode = 'quick',
  onRecordMistake,
  onOpenCompanion
}) => {
  // Test configuration state
  const [activeMode, setActiveMode] = useState<PracticeMode>(initialMode);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [isTestFinished, setIsTestFinished] = useState<boolean>(false);

  // Selected filters for setup
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'All'>('All');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isExamMode, setIsExamMode] = useState<boolean>(false); // Practice vs CET Exam mode
  const [showImmediateFeedback, setShowImmediateFeedback] = useState<boolean>(true);
  const [explanationLang, setExplanationLang] = useState<'English' | 'Hinglish'>(profile.preferredLanguage);

  // Active question state
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(sampleQuestions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showPalette, setShowPalette] = useState<boolean>(false);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(150 * 60); // 150 mins for CET mock

  useEffect(() => {
    let interval: any = null;
    if (isTestRunning && !isTestFinished) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        if (isExamMode) {
          setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestRunning, isTestFinished, isExamMode]);

  // Start test launcher
  const startTest = (mode: PracticeMode, customQuestions?: Question[]) => {
    setActiveMode(mode);
    let qs: Question[] = [];
    if (customQuestions && customQuestions.length > 0) {
      qs = customQuestions;
    } else if (mode === 'mistake_redo') {
      qs = sampleMistakes.map(m => {
        const found = sampleQuestions.find(q => q.id === m.questionId);
        return found || sampleQuestions[0];
      });
    } else if (mode === 'ai_adaptive') {
      // Prioritize percentages and logic where mistakes occurred
      qs = [sampleQuestions[0], sampleQuestions[1], sampleQuestions[2], sampleQuestions[4], sampleQuestions[5]];
    } else if (selectedSubject !== 'All') {
      qs = sampleQuestions.filter(q => q.subject === selectedSubject);
      if (qs.length === 0) qs = sampleQuestions;
    } else {
      qs = sampleQuestions;
    }

    setActiveQuestions(qs.slice(0, questionCount));
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setShowHint(false);
    setElapsedSeconds(0);
    setIsTestFinished(false);
    setIsTestRunning(true);
  };

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const currentQ = activeQuestions[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleClearSelection = () => {
    const currentQ = activeQuestions[currentIndex];
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleMarkReview = () => {
    const currentQ = activeQuestions[currentIndex];
    setMarkedForReview(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleToggleBookmark = () => {
    const currentQ = activeQuestions[currentIndex];
    setBookmarkedQuestions(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleFinishTest = () => {
    setIsTestFinished(true);
    setIsTestRunning(false);
    // Trigger celebration if score is decent
    const score = calculateScore();
    if (score.percentage >= 60) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const calculateScore = () => {
    let correct = 0;
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: activeQuestions.length,
      percentage: Math.round((correct / activeQuestions.length) * 100),
      attempted: Object.keys(answers).length
    };
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = activeQuestions[currentIndex];
  const isAnswered = currentQ ? !!answers[currentQ.id] : false;
  const isMarked = currentQ ? !!markedForReview[currentQ.id] : false;

  // 1. SETUP / LAUNCHER VIEW
  if (!isTestRunning && !isTestFinished) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Integrated In-App MCQ Engine</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
              Practice & Assessment Arena
            </h1>
            <p className="text-sm text-ink-700/90 mt-1">
              Real CET 5-option questions with detailed Socratic explanations and zero external links.
            </p>
          </div>

          {/* Practice Mode vs Exam Simulation Mode Toggle */}
          <div className="flex items-center bg-parchment-100 p-1.5 rounded-2xl border border-parchment-300">
            <button
              onClick={() => setIsExamMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                !isExamMode 
                  ? 'bg-ink-900 text-white shadow-soft' 
                  : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              🌿 Deep Practice Mode
            </button>
            <button
              onClick={() => setIsExamMode(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isExamMode 
                  ? 'bg-terracotta-500 text-white shadow-soft' 
                  : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              ⏱️ CET Exam Simulation
            </button>
          </div>
        </div>

        {/* 10 Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Mode 1: AI Grounded Adaptive Practice */}
          <div className="bg-ink-900 text-parchment-50 rounded-3xl p-6 shadow-elevated border border-ink-800 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-terracotta-500/20 text-terracotta-300 text-xs font-bold border border-terracotta-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended Today
                </span>
                <span className="text-xs text-parchment-300/70 font-mono">5 Questions</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white">AI Adaptive Practice</h3>
              <p className="text-xs text-parchment-200/80 leading-relaxed">
                Assembles a set targeting your recorded vulnerabilities (Percentage base shift & Circular inward/outward seating).
              </p>
            </div>
            <button
              onClick={() => startTest('ai_adaptive')}
              className="mt-6 w-full py-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-soft"
            >
              <span>Begin AI Adaptive Set</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode 2: Mistake Redo & Parallel Variants */}
          <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-200 shadow-soft hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                  Mistake Calibrator
                </span>
                <span className="text-xs text-ink-500 font-mono">3 Flagged</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-ink-900">Mistake Redo</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Retest questions and parallel variations of previous errors until you prove concept retention.
              </p>
            </div>
            <button
              onClick={() => startTest('mistake_redo')}
              className="mt-6 w-full py-2.5 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Retest Unresolved Errors</span>
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode 3: Quick Topic Practice */}
          <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-200 shadow-soft hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-parchment-200 text-ink-800 text-xs font-bold">
                  Focused Drill
                </span>
                <span className="text-xs text-ink-500 font-mono">5 - 15 Qs</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-ink-900">Topic-Specific Drill</h3>
              
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block">
                  Select CET Section:
                </label>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value as any)}
                  className="w-full text-xs bg-parchment-100 border border-parchment-300 rounded-lg p-2 text-ink-900 font-medium focus:outline-none focus:border-terracotta-500"
                >
                  <option value="All">All 4 Sections (Mixed)</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude (50 Qs)</option>
                  <option value="Logical Reasoning">Logical Reasoning (75 Qs)</option>
                  <option value="Abstract Reasoning">Abstract Reasoning (25 Qs)</option>
                  <option value="Verbal Ability">Verbal Ability (50 Qs)</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => startTest('topic')}
              className="mt-6 w-full py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-parchment-50 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Start Topic Drill</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode 4: Uploaded Document Practice */}
          <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-200 shadow-soft hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Library Grounded
                </span>
                <span className="text-xs text-ink-500 font-mono">Extracted</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-ink-900">From My Uploaded Notes</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Take a test generated exclusively from <em>MAH-CET-Speed-Math-Formulas.pdf</em> and <em>Logical Puzzles Handbook</em>.
              </p>
            </div>
            <button
              onClick={() => startTest('document_based')}
              className="mt-6 w-full py-2.5 rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Practice from My Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode 5: Sectional Sprint */}
          <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-200 shadow-soft hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-bold">
                  Timed Sprint
                </span>
                <span className="text-xs text-ink-500 font-mono">Strict CET Clock</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-ink-900">Sectional Mock Test</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Test a single section under authentic CET conditions (e.g., Abstract: 25 Qs in 20 minutes).
              </p>
            </div>
            <button
              onClick={() => {
                setIsExamMode(true);
                startTest('sectional');
              }}
              className="mt-6 w-full py-2.5 rounded-xl border border-sage-300 hover:bg-sage-50 text-sage-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Launch Sectional Sprint</span>
              <Clock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode 6: Full-Length CET 2027 Mock */}
          <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-200 shadow-soft hover:shadow-elevated transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-parchment-200 text-ink-800 text-xs font-bold">
                  Grand Simulation
                </span>
                <span className="text-xs text-ink-500 font-mono">150 Mins</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-ink-900">Full CET Mock</h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Full 4-section simulation (75 LR + 25 AR + 50 QA + 50 VARC = 200 Qs). No negative marking.
              </p>
            </div>
            <button
              onClick={() => {
                setIsExamMode(true);
                startTest('full_mock');
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Start Full Simulation</span>
              <Award className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 2. ACTIVE TEST-TAKING ARENA
  if (isTestRunning && currentQ) {
    const isOptionSelected = (key: 'A' | 'B' | 'C' | 'D' | 'E') => answers[currentQ.id] === key;
    const isMarked = markedForReview[currentQ.id];
    const isBookmarked = bookmarkedQuestions[currentQ.id];

    return (
      <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
        
        {/* Test Control Header */}
        <div className="bg-parchment-100 border border-parchment-300 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-ink-900 text-parchment-50 text-xs font-bold">
              {currentQ.subject}
            </span>
            <span className="text-xs text-ink-600 font-medium">
              Question <strong>{currentIndex + 1}</strong> of <strong>{activeQuestions.length}</strong>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-parchment-200 text-ink-700 font-mono">
              {currentQ.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Timer */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink-900 bg-parchment-50 px-3 py-1.5 rounded-lg border border-parchment-300">
              <Clock className="w-4 h-4 text-terracotta-500" />
              <span>{isExamMode ? formatTimer(remainingSeconds) : formatTimer(elapsedSeconds)}</span>
            </div>

            {/* Question Palette Drawer Toggle */}
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="p-2 rounded-lg border border-parchment-300 hover:bg-parchment-200 text-ink-800 transition-colors"
              title="Toggle Question Palette"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Submit / Finish Test Button */}
            <button
              onClick={handleFinishTest}
              className="px-4 py-1.5 rounded-lg bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold transition-colors shadow-soft"
            >
              Submit & Score
            </button>
          </div>
        </div>

        {/* Question Palette Drawer (Collapsible) */}
        {showPalette && (
          <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 shadow-soft animate-fadeIn">
            <div className="text-xs font-bold text-ink-800 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Question Palette ({activeQuestions.length} Questions)</span>
              <div className="flex items-center gap-3 text-[11px] font-normal">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sage-500"></span> Answered</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Review</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-parchment-300"></span> Unattempted</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeQuestions.map((q, idx) => {
                const answered = !!answers[q.id];
                const reviewed = !!markedForReview[q.id];
                const current = idx === currentIndex;

                let colorClasses = "bg-parchment-50 text-ink-800 border-parchment-300";
                if (answered && reviewed) colorClasses = "bg-purple-600 text-white border-purple-700";
                else if (answered) colorClasses = "bg-sage-600 text-white border-sage-700";
                else if (reviewed) colorClasses = "bg-purple-100 text-purple-800 border-purple-300";

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowHint(false);
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${colorClasses} ${
                      current ? 'ring-2 ring-terracotta-500 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Question Presentation Card */}
        <div className="bg-parchment-50 border border-parchment-200 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
          
          {/* Question Text */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-terracotta-600 tracking-wide">
                Topic: {currentQ.topic} • {currentQ.subtopic}
              </span>
              <button
                onClick={handleToggleBookmark}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isBookmarked 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'text-ink-400 hover:text-ink-700 border-transparent hover:border-parchment-200'
                }`}
                title="Bookmark for Revision"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <div className="font-serif text-lg sm:text-xl text-ink-900 leading-relaxed font-medium">
              {currentQ.questionText}
            </div>
          </div>

          {/* 5 Selectable Options (A, B, C, D, E) */}
          <div className="space-y-3 pt-2">
            {(['A', 'B', 'C', 'D', 'E'] as const).map((optKey) => {
              const optionText = currentQ.options[optKey];
              const isSelected = isOptionSelected(optKey);
              
              return (
                <div
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 group ${
                    isSelected 
                      ? 'bg-parchment-100 border-terracotta-500 ring-1 ring-terracotta-400/50 shadow-sm' 
                      : 'bg-white border-parchment-200 hover:border-ink-400 hover:bg-parchment-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-terracotta-500 text-white' 
                        : 'bg-parchment-100 text-ink-700 group-hover:bg-parchment-200'
                    }`}>
                      {optKey}
                    </div>
                    <span className="text-sm font-medium text-ink-900 leading-normal">
                      {optionText}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-terracotta-500 text-white flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Socratic Practice Guidance: Hints & Bilingual Explanation (Only in Practice Mode) */}
          {!isExamMode && (
            <div className="pt-4 border-t border-parchment-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>{showHint ? "Hide Hint" : "Need a Hint / Formula?"}</span>
                </button>

                <button
                  onClick={() => onOpenCompanion(`Explain how to approach question: "${currentQ.questionText.slice(0, 80)}..."`)}
                  className="px-3 py-1.5 rounded-lg bg-parchment-100 hover:bg-parchment-200 text-ink-800 border border-parchment-300 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-terracotta-500" />
                  <span>Ask Companion Socratic Guide</span>
                </button>
              </div>

              {currentQ.sourceDocTitle && (
                <span className="text-[11px] text-ink-500 flex items-center gap-1 font-mono">
                  <FileText className="w-3 h-3 text-ink-400" />
                  {currentQ.sourceDocTitle} (p. {currentQ.sourcePage})
                </span>
              )}
            </div>
          )}

          {/* Hint Dropdown Box */}
          {showHint && currentQ.conceptFormula && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5 animate-fadeIn">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Grounded Principle / Formula:</span>
              </div>
              <div className="font-mono text-sm font-semibold">{currentQ.conceptFormula}</div>
              <p className="text-amber-800/80 leading-relaxed">
                Think about the new denominator base. If original increased, the new total is higher than 100!
              </p>
            </div>
          )}

          {/* Navigation & Question Control Footbar */}
          <div className="pt-6 border-t border-parchment-200 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearSelection}
                disabled={!answers[currentQ.id]}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-ink-600 hover:text-ink-900 hover:bg-parchment-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Clear Response
              </button>

              <button
                onClick={handleToggleMarkReview}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isMarked 
                    ? 'bg-purple-100 text-purple-800 border-purple-300' 
                    : 'bg-parchment-100 hover:bg-parchment-200 text-ink-700 border-parchment-300'
                }`}
              >
                {isMarked ? "✓ Marked for Review" : "Mark for Review"}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex(currentIndex - 1);
                    setShowHint(false);
                  }
                }}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-ink-800 text-xs font-semibold flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < activeQuestions.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentIndex(currentIndex + 1);
                    setShowHint(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold flex items-center gap-1 transition-colors shadow-soft"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinishTest}
                  className="px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-soft"
                >
                  <span>Finish & View Scorecard</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  }

  // 3. POST-TEST DIAGNOSTIC SCORECARD & REVIEW
  if (isTestFinished) {
    const score = calculateScore();

    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        
        {/* Scorecard Hero Banner */}
        <div className="bg-ink-900 text-parchment-50 rounded-3xl p-6 sm:p-8 shadow-elevated border border-ink-800 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-parchment-50/10 text-terracotta-300 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-terracotta-400" />
            <span>Session Assessment Diagnostic</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            {score.percentage >= 80 ? `Exemplary Execution, ${profile.name}.` : score.percentage >= 60 ? "Solid Progress & Clear Focus Areas." : "Valuable Diagnostic Evidence Collected."}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            <div className="bg-ink-800/80 px-6 py-4 rounded-2xl border border-ink-700 text-center">
              <div className="text-3xl font-serif font-bold text-terracotta-400">{score.correct} / {score.total}</div>
              <div className="text-xs text-parchment-300/80 mt-0.5">Raw Score (No Negatives)</div>
            </div>

            <div className="bg-ink-800/80 px-6 py-4 rounded-2xl border border-ink-700 text-center">
              <div className="text-3xl font-serif font-bold text-white">{score.percentage}%</div>
              <div className="text-xs text-parchment-300/80 mt-0.5">Overall Accuracy</div>
            </div>

            <div className="bg-ink-800/80 px-6 py-4 rounded-2xl border border-ink-700 text-center">
              <div className="text-3xl font-serif font-bold text-sage-400 font-mono">{formatTimer(elapsedSeconds)}</div>
              <div className="text-xs text-parchment-300/80 mt-0.5">Total Time Invested</div>
            </div>
          </div>

          <p className="text-xs text-parchment-300/80 max-w-lg mx-auto">
            Your results have updated your persistent learner memory. Mistakes are tagged for targeted calibration.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setIsTestFinished(false);
                setIsTestRunning(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-parchment-100 hover:bg-white text-ink-900 text-xs font-bold transition-colors"
            >
              Back to Practice Arena
            </button>

            <button
              onClick={() => startTest('mistake_redo')}
              className="px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold transition-colors shadow-soft flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retest Incorrect Questions Now</span>
            </button>
          </div>
        </div>

        {/* Detailed Question-by-Question Socratic Review */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-parchment-200">
            <h3 className="font-serif text-xl font-bold text-ink-900">
              Detailed Question Analysis & Citations
            </h3>
            
            {/* Bilingual explanation toggle */}
            <button
              onClick={() => setExplanationLang(explanationLang === 'English' ? 'Hinglish' : 'English')}
              className="flex items-center gap-1.5 text-xs text-ink-700 bg-parchment-100 px-3 py-1.5 rounded-lg border border-parchment-300 font-semibold hover:border-terracotta-500 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Language: <strong>{explanationLang}</strong></span>
            </button>
          </div>

          <div className="space-y-4">
            {activeQuestions.map((q, idx) => {
              const studentChoice = answers[q.id];
              const isCorrect = studentChoice === q.correctAnswer;
              const hasAnswered = !!studentChoice;

              return (
                <div 
                  key={q.id}
                  className={`p-6 rounded-3xl border transition-all ${
                    isCorrect 
                      ? 'bg-parchment-50 border-sage-200' 
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isCorrect ? 'bg-sage-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-ink-900">{q.topic} • {q.subtopic}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sage-100 text-sage-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-sage-600" />
                          Correct (+1)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          {hasAnswered ? `Incorrect (Chose ${studentChoice})` : "Unanswered"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="font-serif text-base text-ink-900 font-medium mb-4">
                    {q.questionText}
                  </div>

                  {/* Options status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => {
                      const isStudent = studentChoice === opt;
                      const isRight = q.correctAnswer === opt;

                      let badgeStyle = "bg-white border-parchment-200 text-ink-700";
                      if (isRight) badgeStyle = "bg-sage-100 border-sage-300 text-sage-900 font-bold";
                      else if (isStudent && !isRight) badgeStyle = "bg-rose-100 border-rose-300 text-rose-900 font-bold";

                      return (
                        <div key={opt} className={`p-2.5 rounded-xl border flex items-center justify-between ${badgeStyle}`}>
                          <span><strong>({opt})</strong> {q.options[opt]}</span>
                          {isRight && <span className="text-sage-700 font-bold text-[10px]">Correct Answer</span>}
                          {isStudent && !isRight && <span className="text-rose-700 font-bold text-[10px]">Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Grounded Socratic Explanation */}
                  <div className="p-4 rounded-2xl bg-white border border-parchment-200 text-xs space-y-2">
                    <div className="font-bold text-ink-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-terracotta-600">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Explanation ({explanationLang}):
                      </span>
                      {q.sourceDocTitle && (
                        <span className="text-[10px] font-mono text-ink-500">
                          {q.sourceDocTitle} (p. {q.sourcePage})
                        </span>
                      )}
                    </div>

                    <p className="text-ink-800 leading-relaxed font-sans">
                      {explanationLang === 'Hinglish' && q.hinglishExplanation 
                        ? q.hinglishExplanation 
                        : q.explanation}
                    </p>

                    {q.conceptFormula && (
                      <div className="pt-1 font-mono text-[11px] text-terracotta-700 font-semibold">
                        Formula Reference: {q.conceptFormula}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  }

  return null;
};
