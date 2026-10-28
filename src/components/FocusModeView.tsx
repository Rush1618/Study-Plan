import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Lightbulb, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Maximize2, 
  Minimize2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { UserProfile, ConceptLesson } from '../types';
import { StorageService } from '../services/storage';

interface FocusModeViewProps {
  profile: UserProfile;
  onFinishSession: (minutesSpent: number) => void;
  onOpenCompanion: (prompt: string) => void;
}

const sampleLessons: ConceptLesson[] = [
  {
    id: "les-01",
    subject: "Quantitative Aptitude",
    topic: "Percentages & Base Values",
    title: "Mastering Successive Percentage & Reverse Base Shifts",
    durationMinutes: 25,
    corePrinciple: "When a quantity increases by x%, the base denominator for reverse calculation becomes (100 + x), never original 100.",
    keyFormulas: [
      "Required % Reduction = [x / (100 + x)] × 100",
      "Net Factor = (1 + r1/100) × (1 - r2/100)"
    ],
    hinglishIntuition: "Jab ₹100 ki cheez 25% badhkar ₹125 ho jaye, to wapas ₹100 lane ke liye ₹25 kam karna padega. Par ab kam ₹125 pe ho raha hai, isliye 25/125 = 20% reduction hoga, 25% nahi!",
    workedExamples: [
      {
        problemStatement: "Petrol price shot up by 20%. By what percent should a commuter curtail consumption so expenditure stays unchanged?",
        stepByStepResolution: [
          "Step 1: Assume original price = ₹100 and consumption = 100 units (Total Exp = ₹10,000).",
          "Step 2: New price = ₹120. New consumption required = 10,000 / 120 = 83.33 units.",
          "Step 3: Reduction in consumption = 100 - 83.33 = 16.67 units.",
          "Step 4: Percentage reduction = (16.67 / 100) × 100 = 16.67% = 1/6."
        ],
        groundedRule: "Expenditure Constant: If Price increases by 1/n, Consumption must decrease by 1/(n+1)."
      }
    ],
    checkpointQuestionIds: ["q-cet-qa-01", "q-cet-qa-01-par"]
  },
  {
    id: "les-02",
    subject: "Logical Reasoning",
    topic: "Circular Seating Arrangements",
    title: "Inward vs Outward Direction Decoding",
    durationMinutes: 30,
    corePrinciple: "Left and Right invert depending on whether an entity faces inward toward the center or outward away from the center.",
    keyFormulas: [
      "Inward: Right = Anti-Clockwise, Left = Clockwise",
      "Outward: Right = Clockwise, Left = Anti-Clockwise"
    ],
    hinglishIntuition: "Kagaz pe gol chakkar me arrow lagao. Agar vyakti bahar dekh raha hai, to uska right aapke ghadi ki disha (clockwise) me hoga.",
    workedExamples: [
      {
        problemStatement: "Eight persons sitting around a table. A faces center, B faces outside. C sits 2nd to the right of B.",
        stepByStepResolution: [
          "Step 1: Place B facing outside. Draw an arrow pointing away from the circle.",
          "Step 2: Right of B is clockwise. Move 2 slots in clockwise direction to fix C."
        ],
        groundedRule: "Always draw directional arrows on every person node."
      }
    ],
    checkpointQuestionIds: ["q-cet-lr-01"]
  }
];

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  profile,
  onFinishSession,
  onOpenCompanion
}) => {
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  const currentLesson = sampleLessons[activeLessonIndex];

  useEffect(() => {
    let timer: any = null;
    if (isRunning && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
      onFinishSession(Math.round(elapsedSeconds / 60));
    }
    return () => clearInterval(timer);
  }, [isRunning, secondsRemaining, elapsedSeconds]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(currentLesson.durationMinutes * 60);
    setElapsedSeconds(0);
    setIsCompleted(false);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`space-y-6 sm:space-y-8 animate-fadeIn transition-colors ${isZenMode ? 'max-w-3xl mx-auto py-4' : ''}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Focus Room
          </h1>
          <p className="text-xs sm:text-sm text-ink-700 mt-1">
            Immersive concept lesson, worked examples, and calibrated focus timer for {profile.name}.
          </p>
        </div>

        <button
          onClick={() => setIsZenMode(!isZenMode)}
          className="px-3.5 py-1.5 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-xs font-semibold flex items-center gap-1.5 text-ink-800 transition-colors"
        >
          {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>{isZenMode ? "Standard View" : "Zen Full View"}</span>
        </button>
      </div>

      {/* Focus Timer Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-ink-900 text-parchment-50 border border-ink-800 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-xs text-terracotta-300 font-medium">
            Active Study Block: {currentLesson.topic}
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
            {currentLesson.title}
          </h2>
          <div className="text-xs text-parchment-300">
            Target: {currentLesson.durationMinutes} Minutes / Zero Distractions
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white">
            {formatTimer(secondsRemaining)}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTimer}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shadow-soft ${
                isRunning 
                  ? 'bg-amber-500 hover:bg-amber-600 text-ink-950' 
                  : 'bg-terracotta-500 hover:bg-terracotta-600 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? "Pause Focus" : "Start Focus Timer"}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-2.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-parchment-300 border border-ink-700 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Content Body */}
      <div className="space-y-6">
        
        {/* Core Principle & Intuition */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-4">
          <h3 className="font-serif text-xl font-bold text-ink-900">
            Grounded Core Principle
          </h3>
          <p className="text-sm text-ink-800 leading-relaxed font-sans">
            {currentLesson.corePrinciple}
          </p>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Hinglish Everyday Intuition:</span>
            </div>
            <p className="leading-relaxed">
              {currentLesson.hinglishIntuition}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {currentLesson.keyFormulas.map((f, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-parchment-100 border border-parchment-200 font-mono text-xs font-semibold text-terracotta-700">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Worked Examples */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-4">
          <h3 className="font-serif text-xl font-bold text-ink-900">
            Step-by-Step Worked Demonstration
          </h3>

          {currentLesson.workedExamples.map((ex, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-parchment-50 border border-parchment-200 space-y-3 text-xs">
              <div className="font-semibold text-sm text-ink-900">
                Problem: {ex.problemStatement}
              </div>

              <div className="space-y-1.5 pl-3 border-l-2 border-terracotta-400">
                {ex.stepByStepResolution.map((step, sIdx) => (
                  <p key={sIdx} className="text-ink-800 leading-relaxed">
                    {step}
                  </p>
                ))}
              </div>

              <div className="pt-2 text-[11px] font-bold text-terracotta-700">
                Takeaway Rule: {ex.groundedRule}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
