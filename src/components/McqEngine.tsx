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
  Award,
  Plus,
  Search,
  Filter,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, PracticeMode, MistakeRecord, UserProfile, SubjectType } from '../types';
import { sampleQuestions, sampleMistakes } from '../data/mockData';
import { LearningEngine } from '../services/learningEngine';
import { StorageService } from '../services/storage';

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

  // Question Bank view state
  const [bankTab, setBankTab] = useState<'launcher' | 'bank'>('launcher');
  const [bankQuestions, setBankQuestions] = useState<Question[]>(() => StorageService.getQuestions());
  const [showAddQuestionModal, setShowAddQuestionModal] = useState<boolean>(false);
  const [bankFilterSubject, setBankFilterSubject] = useState<SubjectType | 'All'>('All');
  const [bankSearch, setBankSearch] = useState<string>('');

  // Form fields for adding question
  const [formSubject, setFormSubject] = useState<SubjectType>('Quantitative Aptitude');
  const [formTopic, setFormTopic] = useState('');
  const [formSubtopic, setFormSubtopic] = useState('');
  const [formText, setFormText] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formOptE, setFormOptE] = useState('');
  const [formCorrect, setFormCorrect] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [formExpl, setFormExpl] = useState('');
  const [formHinglish, setFormHinglish] = useState('');

  // Active question state
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(() => StorageService.getQuestions());
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

  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim() || !formOptA.trim() || !formOptB.trim()) return;

    const newQ: Question = {
      id: `q-mentor-${Date.now()}`,
      subject: formSubject,
      topic: formTopic.trim() || 'General Practice',
      subtopic: formSubtopic.trim() || 'Core Problems',
      difficulty: 'CET Standard',
      questionText: formText.trim(),
      options: {
        A: formOptA.trim(),
        B: formOptB.trim(),
        C: formOptC.trim() || 'None of these',
        D: formOptD.trim() || 'Cannot be determined',
        E: formOptE.trim() || 'Both A and B'
      },
      correctAnswer: formCorrect,
      explanation: formExpl.trim() || 'Standard step-by-step reasoning verified by mentor.',
      hinglishExplanation: formHinglish.trim() || undefined
    };

    StorageService.addQuestion(newQ);
    const updated = StorageService.getQuestions();
    setBankQuestions(updated);
    setActiveQuestions(updated);

    // Reset form
    setFormText('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormOptE('');
    setFormExpl('');
    setFormHinglish('');
    setShowAddQuestionModal(false);
  };

  const startSingleQuestionTest = (question: Question) => {
    setActiveMode('topic');
    setActiveQuestions([question]);
    setCurrentIndex(0);
    setAnswers({});
    setMarkedForReview({});
    setShowHint(false);
    setElapsedSeconds(0);
    setIsTestFinished(false);
    setIsTestRunning(true);
  };

  // Start test launcher
  const startTest = (mode: PracticeMode, customQuestions?: Question[]) => {
    setActiveMode(mode);
    const allStoredQ = StorageService.getQuestions();
    let qs: Question[] = [];
    if (customQuestions && customQuestions.length > 0) {
      qs = customQuestions;
    } else if (mode === 'mistake_redo') {
      const storedMistakes = StorageService.getMistakes();
      qs = storedMistakes.map(m => {
        const found = allStoredQ.find(q => q.id === m.questionId);
        return found || allStoredQ[0];
      });
      if (qs.length === 0) qs = allStoredQ;
    } else if (mode === 'ai_adaptive') {
      qs = allStoredQ.slice(0, 5);
    } else if (selectedSubject !== 'All') {
      qs = allStoredQ.filter(q => q.subject === selectedSubject);
      if (qs.length === 0) qs = allStoredQ;
    } else {
      qs = allStoredQ;
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

    // Feed each attempt directly into the persistent LearningEngine
    activeQuestions.forEach(q => {
      const choice = answers[q.id];
      if (choice) {
        const timeEstimate = Math.max(15, Math.round(elapsedSeconds / activeQuestions.length));
        LearningEngine.processAttempt(q, choice, timeEstimate);
      }
    });

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
              <span>In-App MCQ Arena & Question Bank</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
              Practice & Questions Arena
            </h1>
            <p className="text-sm text-ink-700/90 mt-1">
              5-option CET practice sets with Socratic explanations, plus full visibility into questions entered by Rushabh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tab switch between Practice Modes and Question Bank */}
            <div className="flex items-center bg-parchment-100 p-1 rounded-2xl border border-parchment-300">
              <button
                onClick={() => setBankTab('launcher')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  bankTab === 'launcher' 
                    ? 'bg-ink-900 text-white shadow-soft' 
                    : 'text-ink-700 hover:text-ink-900'
                }`}
              >
                🎯 Practice Sets
              </button>
              <button
                onClick={() => setBankTab('bank')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  bankTab === 'bank' 
                    ? 'bg-ink-900 text-white shadow-soft' 
                    : 'text-ink-700 hover:text-ink-900'
                }`}
              >
                📚 Question Bank ({bankQuestions.length})
              </button>
            </div>

            {/* Add Question Button */}
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="px-3.5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-soft"
            >
              <Plus className="w-4 h-4" />
              <span>Enter New MCQ</span>
            </button>
          </div>
        </div>

        {/* SUBTAB 1: PRACTICE MODES */}
        {bankTab === 'launcher' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-600 uppercase tracking-wider">
                Select Practice Calibration
              </span>
              <div className="flex items-center bg-parchment-100 p-1 rounded-xl border border-parchment-300 text-xs">
                <button
                  onClick={() => setIsExamMode(false)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    !isExamMode ? 'bg-ink-900 text-white shadow-sm' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  🌿 Practice Mode
                </button>
                <button
                  onClick={() => setIsExamMode(true)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    isExamMode ? 'bg-terracotta-500 text-white shadow-sm' : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  ⏱️ Exam Simulation
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
    )}

    {/* SUBTAB 2: QUESTION BANK & ENTERED QUESTIONS */}
    {bankTab === 'bank' && (
      <div className="space-y-6">
        
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-parchment-200">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Abstract Reasoning', 'Verbal Ability'] as const).map(s => (
              <button
                key={s}
                onClick={() => setBankFilterSubject(s)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                  bankFilterSubject === s
                    ? 'bg-ink-900 text-white'
                    : 'bg-parchment-100 hover:bg-parchment-200 text-ink-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-3" />
            <input
              type="text"
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Search questions by text or topic..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-parchment-300 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
            />
          </div>
        </div>

        {/* Questions List */}
        {(() => {
          const filteredList = bankQuestions.filter(q => {
            const matchesSubj = bankFilterSubject === 'All' || q.subject === bankFilterSubject;
            const matchesSearch = !bankSearch || 
              q.questionText.toLowerCase().includes(bankSearch.toLowerCase()) ||
              q.topic.toLowerCase().includes(bankSearch.toLowerCase());
            return matchesSubj && matchesSearch;
          });

          if (filteredList.length === 0) {
            return (
              <div className="p-12 text-center rounded-3xl bg-white border border-parchment-200 space-y-3">
                <p className="text-xs text-ink-600">No questions found matching your filter.</p>
                <button
                  onClick={() => setShowAddQuestionModal(true)}
                  className="px-4 py-2 rounded-xl bg-ink-900 text-parchment-50 text-xs font-semibold"
                >
                  Enter First MCQ Now
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {filteredList.map((q, idx) => (
                <div 
                  key={q.id}
                  className="p-6 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-4 hover:border-terracotta-300 transition-colors"
                >
                  {/* Question Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-parchment-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-terracotta-50 text-terracotta-800 border border-terracotta-200">
                        {q.subject}
                      </span>
                      <span className="text-xs font-semibold text-ink-700">
                        {q.topic}
                      </span>
                      {q.subtopic && (
                        <span className="text-xs text-ink-400">• {q.subtopic}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-ink-500 bg-parchment-100 px-2 py-0.5 rounded">
                        {q.difficulty}
                      </span>
                      <button
                        onClick={() => startSingleQuestionTest(q)}
                        className="px-3 py-1 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <span>Practice This</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="font-serif text-base text-ink-900 leading-relaxed">
                    {idx + 1}. {q.questionText}
                  </p>

                  {/* 5 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map(optKey => {
                      const isCorrect = q.correctAnswer === optKey;
                      return (
                        <div 
                          key={optKey}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                            isCorrect 
                              ? 'bg-sage-50 border-sage-300 text-sage-950 font-semibold' 
                              : 'bg-parchment-50/50 border-parchment-200 text-ink-800'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                            isCorrect ? 'bg-sage-600 text-white' : 'bg-parchment-200 text-ink-700'
                          }`}>
                            {optKey}
                          </span>
                          <span className="flex-1">{q.options[optKey]}</span>
                          {isCorrect && (
                            <span className="text-[10px] text-sage-700 font-bold uppercase tracking-wider flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="p-4 rounded-2xl bg-parchment-50 border border-parchment-200 text-xs space-y-1">
                    <div className="font-bold text-ink-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-terracotta-700">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Detailed Explanation & Method</span>
                    </div>
                    <p className="text-ink-800 leading-relaxed font-sans text-xs">
                      {q.explanation}
                    </p>
                    {q.hinglishExplanation && (
                      <p className="text-ink-600 text-[11px] italic pt-1 border-t border-parchment-200">
                        <strong>Hinglish:</strong> {q.hinglishExplanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

      </div>
    )}

    {/* Enter New MCQ Modal */}
    {showAddQuestionModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white border border-parchment-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated max-h-[90vh] overflow-y-auto">
          <h2 className="font-serif text-2xl font-bold text-ink-900 mb-1">
            Enter New MAH-CET Question
          </h2>
          <p className="text-xs text-ink-600 mb-6">
            Add verified questions to Sanskriti's question bank. They will immediately appear in practice sets and topic drills.
          </p>

          <form onSubmit={handleSaveNewQuestion} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink-800 mb-1">Subject</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value as SubjectType)}
                  className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none bg-white"
                >
                  <option value="Logical Reasoning">Logical Reasoning</option>
                  <option value="Abstract Reasoning">Abstract Reasoning</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Verbal Ability">Verbal Ability</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-800 mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="e.g. Percentages, Puzzles"
                  className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-800 mb-1">Question Text</label>
              <textarea
                required
                rows={3}
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Enter the complete CET question statement here..."
                className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none"
              />
            </div>

            {/* 5 Options Inputs */}
            <div className="space-y-2">
              <label className="block font-semibold text-ink-800">
                5 Options & Select Correct Key:
              </label>

              {(['A', 'B', 'C', 'D', 'E'] as const).map(optKey => {
                const val = optKey === 'A' ? formOptA : optKey === 'B' ? formOptB : optKey === 'C' ? formOptC : optKey === 'D' ? formOptD : formOptE;
                const setVal = optKey === 'A' ? setFormOptA : optKey === 'B' ? setFormOptB : optKey === 'C' ? setFormOptC : optKey === 'D' ? setFormOptD : setFormOptE;

                return (
                  <div key={optKey} className="flex items-center gap-2">
                    <label className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs cursor-pointer transition-colors ${
                      formCorrect === optKey ? 'bg-sage-600 text-white' : 'bg-parchment-200 text-ink-800'
                    }`}>
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={formCorrect === optKey}
                        onChange={() => setFormCorrect(optKey)}
                        className="hidden"
                      />
                      {optKey}
                    </label>
                    <input
                      type="text"
                      required
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      placeholder={`Option ${optKey} text`}
                      className="flex-1 px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none"
                    />
                  </div>
                );
              })}
              <p className="text-[11px] text-ink-500 pl-1">
                Click an option letter (A, B, C, D, E) to mark it as the correct answer key (turns green).
              </p>
            </div>

            {/* Explanations */}
            <div>
              <label className="block font-semibold text-ink-800 mb-1">Step-by-Step Explanation</label>
              <textarea
                rows={2}
                value={formExpl}
                onChange={(e) => setFormExpl(e.target.value)}
                placeholder="Clear mathematical or logical derivation..."
                className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-800 mb-1">Hinglish Explanation (Optional)</label>
              <textarea
                rows={2}
                value={formHinglish}
                onChange={(e) => setFormHinglish(e.target.value)}
                placeholder="Aasan shabdon me samjhana ho to yahan likhein..."
                className="w-full px-3 py-2 rounded-xl border border-parchment-300 text-xs focus:ring-2 focus:ring-terracotta-400 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-parchment-200">
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                className="px-4 py-2 rounded-xl border border-parchment-300 text-ink-700 hover:bg-parchment-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 font-semibold shadow-soft"
              >
                Save to Question Bank
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

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
