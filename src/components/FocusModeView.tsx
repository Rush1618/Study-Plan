import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Lightbulb, 
  Clock, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Award,
  ChevronRight,
  Headphones,
  FileText,
  RefreshCw,
  Globe,
  Radio,
  BookOpen,
  Lock,
  Unlock,
  X,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { UserProfile, Question, StudySessionLaunchPayload } from '../types';
import { StorageService } from '../services/storage';
import { LearningEngine } from '../services/learningEngine';
import { FocusAudio } from '../services/focusAudio';
import { RuviVoice } from '../services/ruviVoice';
import { requestBrowserFullscreenSynchronous, exitBrowserFullscreenSynchronous } from '../services/sessionRouter';

interface FocusModeViewProps {
  profile: UserProfile;
  sessionPayload?: StudySessionLaunchPayload | null;
  autoStartSession?: boolean;
  onSessionLockChange?: (isLocked: boolean) => void;
  onFinishSession: (minutesSpent: number) => void;
  onOpenCompanion: (prompt: string) => void;
}

type AmbientType = 'none' | 'rain' | 'gamma' | 'zen';

interface FocusProtocol {
  id: string;
  name: string;
  minutes: number;
  badge: string;
  description: string;
}

export interface ChapterLesson {
  id: string;
  topic: string;
  title: string;
  subject: string;
  weightage: string;
  summary: string;
  formulas: string[];
  distractorTraps: string[];
  hinglishIntuition: string;
  filterKeyword: string;
  webGroundingSources: string[];
  solvedExample: {
    question: string;
    stepByStep: string;
    trick: string;
  };
}

export const CHAPTERS: ChapterLesson[] = [
  {
    id: 'ch-vocab',
    topic: 'Vocabulary & Verbal Ability',
    title: 'High-Frequency CET Words, Latin/Greek Roots & Context',
    subject: 'Verbal Ability',
    weightage: '15-20 Questions in CET • Target: 30s per question',
    summary: 'Master words in context, identify root etymology (Acro-, Biblio-, Pyro-, Bene-, Mal-), distinguish confused pairs, and decode idiomatic expressions without rote memorization.',
    formulas: [
      'Root + Prefix + Suffix = Lexical Meaning',
      'Phobia = Intense Aversion/Fear | Mania = Compulsive Obsession',
      'Bene- (Good/Well) vs Mal- (Bad/Harmful)',
      'Context Tone (Positive/Negative) eliminates 2-3 distractors immediately'
    ],
    distractorTraps: [
      'Look-alike trap: Options that sound phonetically similar to the root but have unrelated meanings.',
      'Extreme polarity trap: Choosing antonyms when synonymous meaning is demanded.',
      'Secondary definition trap: CET often tests the less common secondary meaning of a familiar word.'
    ],
    hinglishIntuition: 'Word ka exact context dekho. Agar root pata hai (jaise Biblio = Books, Klepto = Steal, Pyro = Fire), to unknown words ko bhi eliminate karke 100% accurate answer nikal jata hai bina panic kiye.',
    filterKeyword: 'vocab',
    webGroundingSources: [
      'MAH-CET Official Verbal Ability Blueprint',
      'Norman Lewis Word Power Made Easy Root Vectors',
      'Authentic CET Pack: 100 Calibrated Verbal Questions'
    ],
    solvedExample: {
      question: 'Identify the meaning of "Alleviate": (A) Worsen, (B) Make less severe, (C) Elevate, (D) Postpone',
      stepByStep: 'Root "levis" means light (as in levity, relieve). Alleviate means to make suffering or problem lighter/less severe.',
      trick: 'Notice option (C) "Elevate" is a phonetic distractor trap meant to confuse rush test-takers.'
    }
  },
  {
    id: 'ch-confused',
    topic: 'Words Confused & Misused',
    title: 'Precision Differentiations & Contextual Traps',
    subject: 'Verbal Ability',
    weightage: '8-10 Questions in CET • Target: 25s per question',
    summary: 'Distinguish subtle homophones and confused pairs: Affect (verb) vs Effect (noun), Advice (noun) vs Advise (verb), Principal (head/main) vs Principle (moral rule/axiom).',
    formulas: [
      'Affect = Verb (to influence) | Effect = Noun (result/consequence)',
      'Advice (-ice) = Noun | Advise (-ise) = Verb',
      'Principal (-al) = Person or Sum | Principle (-le) = Rule or Value',
      'Compliment (Praise) vs Complement (Completes/Pairs well)'
    ],
    distractorTraps: [
      'Part-of-speech switch: Inserting a noun where the sentence grammatically demands a verb.',
      'Spelling mimicry: Choosing "principle" when referring to school principal.'
    ],
    hinglishIntuition: 'Sentence me verb ki jagah hai ya noun ki? "The pollution __ my health" -> yahan action verb chahiye, to "affects" aayega. "The __ of pollution" -> yahan noun chahiye, to "effects" aayega.',
    filterKeyword: 'confused',
    webGroundingSources: [
      'MAH-CET English Grammatical Precision Standards',
      'Standard Business English & CET Verbal Ability Guides'
    ],
    solvedExample: {
      question: 'The committee was asked to give its _______ on the proposal. (A) advice, (B) advise, (C) advising, (D) advised',
      stepByStep: '"its" is a possessive pronoun requiring a noun. "Advice" with a "c" is the noun.',
      trick: 'Option (B) "advise" is a verb, not a noun.'
    }
  },
  {
    id: 'ch-phobias',
    topic: 'Phobias, Manias & Root Etymology',
    title: 'Psychological Prefixes & Behavioral Suffixes',
    subject: 'Verbal Ability',
    weightage: '5-8 Questions in CET • Target: 20s per question',
    summary: 'Decode specific fears, obsessions, and behavioral terms derived from Classical Greek & Latin roots (Acro-, Hydro-, Claustro-, Pyromania, Bibliomania).',
    formulas: [
      'Acro- = Heights | Hydro- = Water | Claustro- = Confined spaces',
      'Xeno- = Strangers/Foreigners | Agro- = Open spaces/Fields',
      'Kleptomania = Compulsive theft | Pyromania = Compulsion to set fires'
    ],
    distractorTraps: [
      'Mixing Agro- (open fields) with Acro- (heights).',
      'Mixing -phobia (fear) with -mania (uncontrollable urge).'
    ],
    hinglishIntuition: 'Acrobat hamesha unchai pe rope pe chalta hai, so Acrophobia = Height ka dar. Klepto me "k" se kabza karna (steal), so Kleptomania = Chori karne ki aadat.',
    filterKeyword: 'phobia',
    webGroundingSources: [
      'MAH-CET Vocabulary & One-Word Substitution Question Bank',
      'Classical Etymology & GRE/CET Root Collections'
    ],
    solvedExample: {
      question: 'Extreme or irrational fear of heights is called: (A) Agoraphobia, (B) Claustrophobia, (C) Acrophobia, (D) Hydrophobia',
      stepByStep: 'Acro (height) + phobia (fear) = Acrophobia.',
      trick: 'Agoraphobia is open crowded places, not height!'
    }
  },
  {
    id: 'ch-quant-perc',
    topic: 'Percentages & Reverse Base Values',
    title: 'Successive Percentage Shifts & Denominator Traps',
    subject: 'Quantitative Aptitude',
    weightage: '12-15 Questions in CET • Target: 45s per question',
    summary: 'When a quantity increases by x%, the base denominator for reverse calculation becomes (100 + x), never original 100. Expenditure constant rule: if price increases by 1/n, consumption must decrease by 1/(n+1).',
    formulas: [
      'Required % Reduction = [x / (100 + x)] × 100',
      'Net Successive Change = x + y + (xy / 100)',
      'Fraction Ladder: +1/4 (+25%) requires -1/5 (-20%) to restore balance'
    ],
    distractorTraps: [
      'Symmetry trap: Assuming that if price increases by 25%, a 25% decrease restores original price.',
      'Direct subtract trap: Subtracting percentages directly without accounting for changing base.'
    ],
    hinglishIntuition: 'Jab ₹100 ki cheez 25% badhkar ₹125 ho jaye, to wapas ₹100 lane ke liye ₹25 kam karna padega. Par ab kam ₹125 pe ho raha hai, isliye 25/125 = 20% reduction hoga, 25% nahi!',
    filterKeyword: 'percent',
    webGroundingSources: [
      'MAH-CET Speed Math & Arithmetic Foundation Guides',
      'Speed Calculation Hacks & Vedic Base Inversion'
    ],
    solvedExample: {
      question: 'If petrol price rises by 25%, by what percent must consumption be cut so expenditure stays constant?',
      stepByStep: 'Rise = 1/4 (+25%). To keep expenditure constant, consumption must fall by 1/(4+1) = 1/5 = 20%.',
      trick: 'Never choose 25% — that is the deliberate bait option.'
    }
  },
  {
    id: 'ch-quant-pl',
    topic: 'Profit, Loss & Successive Discounts',
    title: 'Marked Price, Cost Price & Equated Discounts',
    subject: 'Quantitative Aptitude',
    weightage: '8-10 Questions in CET • Target: 50s per question',
    summary: 'Single equivalent discount for successive discounts d1 and d2 = [d1 + d2 - (d1×d2)/100]. Cost price is always the 100% baseline unless specified on selling price.',
    formulas: [
      'Equivalent Discount = d1 + d2 - (d1 × d2 / 100)',
      'SP = CP × (100 + Profit%) / 100 = MP × (100 - Discount%) / 100',
      'CP : MP = (100 - Discount%) : (100 + Profit%)'
    ],
    distractorTraps: [
      'Adding successive discounts linearly: 20% + 10% is NOT 30%, but 28%!',
      'Calculating discount on Cost Price instead of Marked Price.'
    ],
    hinglishIntuition: 'Dukaan pe 20% + 10% discount ka matlab 30% discount nahi hota! Pehle 100 ka 80 hua, phir 80 pe 10% (8) kam hua, to bacha 72. Total discount hua 28%.',
    filterKeyword: 'profit',
    webGroundingSources: [
      'MAH-CET Arithmetic Formula Sheet & Speed Math Pack'
    ],
    solvedExample: {
      question: 'Two successive discounts of 20% and 10% are equal to a single discount of: (A) 30%, (B) 28%, (C) 25%, (D) 32%',
      stepByStep: '20 + 10 - (20 × 10 / 100) = 30 - 2 = 28%.',
      trick: 'Option (A) 30% is the classic linear addition trap.'
    }
  },
  {
    id: 'ch-puzzles-circ',
    topic: 'Logical Reasoning & Circular Puzzles',
    title: 'Inward vs Outward Direction Decoding & Bifurcation',
    subject: 'Logical Reasoning',
    weightage: '15-20 Questions in CET • Target: 3 mins for a 5-question set',
    summary: 'Left and Right invert depending on whether an entity faces inward toward the center or outward away from the center. Always draw two parallel candidate diagrams (Case A & Case B) for ambiguous clues.',
    formulas: [
      'Inward Facing: Right = Counter-Clockwise | Left = Clockwise',
      'Outward Facing: Right = Clockwise | Left = Counter-Clockwise',
      'Dual Diagram Rule: Split immediately upon finding a 2-possibility clue'
    ],
    distractorTraps: [
      'Direction reversal: Confusing own right-hand side with outward-facing entity right.',
      'Premature commitment: Trying to fit all conditions into one diagram without branching.'
    ],
    hinglishIntuition: 'Kagaz pe gol chakkar me arrow lagao. Agar vyakti bahar dekh raha hai, to uska right aapke ghadi ki disha (clockwise) me hoga. Hamesha do diagram banao, ek apne aap cut jayega.',
    filterKeyword: 'circular',
    webGroundingSources: [
      'MAH-CET 75-Mark Logical Reasoning Blueprint',
      'Seating Arrangement Speed Algorithms'
    ],
    solvedExample: {
      question: '8 people sit around a circular table. A faces center, B faces outside. Who sits 2nd to right of B?',
      stepByStep: 'Since B faces outside, B right goes CLOCKWISE by 2 slots.',
      trick: 'If you use inward logic, you will get the counter-clockwise slot which is wrong.'
    }
  },
  {
    id: 'ch-grammar',
    topic: 'Sentence Correction & Grammar Precision',
    title: 'Subject-Verb Agreement & Intervening Modifiers',
    subject: 'Verbal Ability',
    weightage: '10-12 Questions in CET • Target: 30s per question',
    summary: 'The verb must agree strictly with the true grammatical subject, not with the noun inside an intervening prepositional phrase (e.g. "The bouquet of roses IS fragrant", not "are").',
    formulas: [
      'Singular Subject + Singular Verb (adds -s)',
      'Either...or / Neither...nor: Verb agrees with closest subject',
      'Along with / In addition to / As well as: Verb agrees with the FIRST subject'
    ],
    distractorTraps: [
      'Proximity trap: Matching the verb with the nearest plural noun inside a prepositional phrase.',
      'Either/Neither trap: Forgetting that Either/Neither alone takes a singular verb.'
    ],
    hinglishIntuition: 'Prepositional phrase (jaise "of roses", "along with his friends") ko ungli se chhupa do, phir check karo ki main subject singular hai ya plural. "The leader (along with his followers) IS coming", "are" nahi!',
    filterKeyword: 'grammar',
    webGroundingSources: [
      'Wren & Martin Advanced English Grammar Rules',
      'MAH-CET Sentence Correction Traps Bank'
    ],
    solvedExample: {
      question: 'The quality of these mangoes (A) are (B) is (C) were (D) have been not good.',
      stepByStep: 'True subject is "quality" (singular noun), not "mangoes" (object of preposition "of"). Hence singular "is" is correct.',
      trick: 'Hearing "mangoes are" sounds natural to the ear but is grammatically incorrect!'
    }
  },
  {
    id: 'ch-syllogisms',
    topic: 'Syllogisms & Deductive Logic',
    title: 'Venn Euler Modeling & "Only a Few" Deductive Traps',
    subject: 'Logical Reasoning',
    weightage: '5-7 Questions in CET • Target: 30s per question',
    summary: '"Only a few A are B" means two things simultaneously: (1) Some A are B, AND (2) Some A are NOT B. "Some not" is a definite negative deduction that test creators use to trap students.',
    formulas: [
      '"Only a few A are B" = "Some A are B" + "Some A are NOT B"',
      'All A are B does NOT mean All B are A',
      'Possibility rule: If a conclusion does not violate any basic statement in ANY valid Venn diagram, the possibility is TRUE'
    ],
    distractorTraps: [
      'Assuming "Only a few" is the same as "Some". "Only a few" strictly forbids "All A can be B"!',
      'Negative conclusion trap: Concluding negative fact when statements are entirely positive.'
    ],
    hinglishIntuition: '"Only a few A are B" ka matlab pakka hai ki kuch A, B ban hi nahi sakte! Isliye "All A being B is a possibility" 100% false hoga!',
    filterKeyword: 'syllogism',
    webGroundingSources: [
      'MAH-CET Logical Deductions Blueprint',
      'Venn Diagram Syllogism Traps Catalog'
    ],
    solvedExample: {
      question: 'Statements: Only a few Pens are Books. All Books are Bags. Conclusion: All Pens can never be Bags.',
      stepByStep: 'Some Pens are definitely not Books. But can all Pens be Bags? Yes, Pens can enter Bags without violating "Only a few Pens are Books". Hence conclusion is false.',
      trick: 'Check if the restriction applies to the outer container or inner entity!'
    }
  },
  {
    id: 'ch-di-tables',
    topic: 'Data Interpretation & Tables',
    title: 'Ratio Calculations, Visual Approximations & Percentage Indices',
    subject: 'Quantitative Aptitude',
    weightage: '15-20 Questions in CET • Target: 40s per question',
    summary: 'Never calculate full 6-digit division in CET. Round off denominators to nearest 10 or 100, use 10% and 1% mental brackets, and inspect option spread before dividing.',
    formulas: [
      'Ratio Comparison Trick: a/b vs c/d -> cross-multiply a×d vs b×c',
      'Denominator Rounding: 437/892 ≈ 440/890 = 44/89 ≈ 49.4%',
      'Percentage Growth = [(Final - Initial) / Initial] × 100'
    ],
    distractorTraps: [
      'Full decimal trap: Spending 90 seconds doing exact long division when options differ by >5%.',
      'Inverted base trap: Dividing growth by Final value instead of Initial baseline.'
    ],
    hinglishIntuition: 'Options ko pehle dekho! Agar options me doori hai (jaise 32%, 48%, 65%), to rough approximation se 15 second me answer aa jayega, lambi calculation mat karo!',
    filterKeyword: 'data',
    webGroundingSources: [
      'MAH-CET Data Interpretation Speed Hacks',
      'Speed DI Table Calculation Matrices'
    ],
    solvedExample: {
      question: 'Production grew from 412 tonnes to 528 tonnes. What is the approximate percentage increase?',
      stepByStep: 'Increase = 528 - 412 = 116. Baseline = 412. 116 / 412 ≈ 116 / 400 = 29% (slightly under 29%, ~28.1%).',
      trick: '10% of 412 is 41.2. 30% is ~123. 116 is just under 30% (~28%). 10 seconds flat.'
    }
  }
];

const PROTOCOLS: FocusProtocol[] = [
  { id: 'p15', name: '15m Sprint', minutes: 15, badge: 'Rapid Drill', description: 'Fast chapter test quiz under high-speed CET timer.' },
  { id: 'p25', name: '25m Block', minutes: 25, badge: 'Standard', description: 'Notes review + calibrated chapter test.' },
  { id: 'p45', name: '45m Deep', minutes: 45, badge: 'Endurance', description: 'Deep chapter study and full question batch.' }
];

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  profile,
  sessionPayload,
  autoStartSession = false,
  onSessionLockChange,
  onFinishSession,
  onOpenCompanion
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<FocusProtocol>(PROTOCOLS[1]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterLesson>(CHAPTERS[0]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Ambient Sound
  const [ambientSound, setAmbientSound] = useState<AmbientType>('rain');
  const [ambientVolume] = useState<number>(0.35);

  // Questions & Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | 'E' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'quiz' | 'notes'>('quiz');
  const [qStartTime, setQStartTime] = useState<number>(Date.now());
  const [lastQuestionLatency, setLastQuestionLatency] = useState<number>(0);

  // Ruvi Voice state
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);

  // Auto Fullscreen & Lock Down Session
  const lockEverythingAndStart = (tab: 'quiz' | 'notes' = 'quiz') => {
    requestBrowserFullscreenSynchronous();

    setIsLocked(true);
    if (onSessionLockChange) onSessionLockChange(true);

    if (ambientSound !== 'none') {
      FocusAudio.playTrack(ambientSound as any, ambientVolume);
    }
    setActiveTab(tab);
    setQStartTime(Date.now());
  };

  // Exit & Unlock Session
  const handleExitLockedSession = () => {
    setIsLocked(false);
    if (onSessionLockChange) onSessionLockChange(false);
    FocusAudio.stopAmbient();
    RuviVoice.stopSpeaking();
    exitBrowserFullscreenSynchronous();
  };

  // Handle keyboard Escape to safely exit focus mode without trapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLocked) {
        handleExitLockedSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked]);

  // Synchronize sessionPayload
  useEffect(() => {
    if (sessionPayload) {
      const targetTopic = sessionPayload.topicName.trim();
      const matched = CHAPTERS.find(c => 
        c.topic.toLowerCase().includes(targetTopic.toLowerCase()) ||
        targetTopic.toLowerCase().includes(c.topic.toLowerCase()) ||
        c.id === sessionPayload.topicId
      );
      if (matched) {
        setSelectedChapter(matched);
      } else {
        setSelectedChapter({
          id: sessionPayload.topicId || `ch-${Date.now()}`,
          topic: sessionPayload.topicName,
          title: `${sessionPayload.topicName} — Focus Study`,
          subject: sessionPayload.subject,
          weightage: 'Target CET Weightage',
          summary: `Focused study and calibrated test session for ${sessionPayload.topicName}.`,
          formulas: ['Focus on fundamental rules, base calculations, and eliminating distractors.'],
          distractorTraps: ['Careless arithmetic or rush misreading conditions.'],
          hinglishIntuition: `${sessionPayload.topicName} me question ki condition aur base dhyan se padho.`,
          filterKeyword: sessionPayload.topicName.split(' ')[0].toLowerCase(),
          webGroundingSources: ['MAH-CET Official Syllabus Baseline'],
          solvedExample: {
            question: `Standard diagnostic question for ${sessionPayload.topicName}.`,
            stepByStep: 'Apply standard formula or diagram method step-by-step.',
            trick: 'Check units and options before computing full decimals.'
          }
        });
      }

      const durMins = sessionPayload.plannedDurationMinutes || 25;
      setSelectedProtocol({
        id: `p-${durMins}`,
        name: `${durMins}m Block`,
        minutes: durMins,
        badge: sessionPayload.quizMode === 'timed_exam' ? 'Timed Exam' : 'Target Drill',
        description: `Calibrated focus block for ${sessionPayload.topicName}.`
      });
      setSecondsRemaining(durMins * 60);
      setElapsedSeconds(0);
      setIsCompleted(false);
      setSolvedCount(0);
      setCorrectCount(0);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
      setCurrentQIndex(0);
      setQStartTime(Date.now());
    }
  }, [sessionPayload]);

  // Auto start on mount if requested
  useEffect(() => {
    if (autoStartSession) {
      lockEverythingAndStart();
    }
  }, [autoStartSession]);

  // Load questions filtered by selected chapter
  useEffect(() => {
    const allQuestions = StorageService.getQuestions();
    const keyword = selectedChapter.filterKeyword.toLowerCase();
    
    let filtered = allQuestions.filter(q => 
      q.topic.toLowerCase().includes(keyword) || 
      q.subtopic.toLowerCase().includes(keyword) ||
      (keyword === 'vocab' && q.subject === 'Verbal Ability') ||
      (keyword === 'confused' && (q.subtopic.toLowerCase().includes('confused') || q.questionText.toLowerCase().includes('affect') || q.questionText.toLowerCase().includes('advice'))) ||
      (keyword === 'phobia' && (q.subtopic.toLowerCase().includes('phobia') || q.questionText.toLowerCase().includes('phobia') || q.questionText.toLowerCase().includes('mania')))
    );

    // Strict Topic Filtering: Never silently fall back to unrelated subjects!
    setQuestions(filtered);
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQStartTime(Date.now());
  }, [selectedChapter]);

  // Timer Interval
  useEffect(() => {
    let timer: any = null;
    if (isLocked && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isLocked) {
      handleSessionComplete();
    }
    return () => clearInterval(timer);
  }, [isLocked, secondsRemaining]);

  // Clean audio on unmount
  useEffect(() => {
    return () => {
      FocusAudio.stopAmbient();
      RuviVoice.stopSpeaking();
    };
  }, []);

  const handleProtocolSelect = (proto: FocusProtocol) => {
    if (isLocked) return;
    setSelectedProtocol(proto);
    setSecondsRemaining(proto.minutes * 60);
    setElapsedSeconds(0);
    setIsCompleted(false);
  };

  const resetTimer = () => {
    handleExitLockedSession();
    setSecondsRemaining(selectedProtocol.minutes * 60);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setSolvedCount(0);
    setCorrectCount(0);
  };

  const handleSoundCycle = () => {
    const cycle: AmbientType[] = ['rain', 'gamma', 'zen', 'none'];
    const nextIdx = (cycle.indexOf(ambientSound) + 1) % cycle.length;
    const nextSound = cycle[nextIdx];
    setAmbientSound(nextSound);
    if (nextSound === 'none') {
      FocusAudio.stopAmbient();
    } else {
      FocusAudio.playTrack(nextSound as any, ambientVolume);
    }
  };

  const handleSessionComplete = () => {
    setIsLocked(false);
    if (onSessionLockChange) onSessionLockChange(false);
    setIsCompleted(true);
    FocusAudio.stopAmbient();
    RuviVoice.stopSpeaking();
    FocusAudio.playCompletionChime();

    const minutesSpent = Math.max(1, Math.round(elapsedSeconds / 60));
    const sessionTopic = sessionPayload?.topicName || selectedChapter.topic;
    const sessionSubject = (sessionPayload?.subject || selectedChapter.subject) as any;
    const targetMins = sessionPayload?.plannedDurationMinutes || selectedProtocol.minutes;
    const accuracy = solvedCount > 0 ? Math.round((correctCount / solvedCount) * 100) : 0;
    
    StorageService.logFocusSession({
      id: sessionPayload?.sessionId || `foc-${Date.now()}`,
      subject: sessionSubject,
      topic: sessionTopic,
      targetMinutes: targetMins,
      actualMinutesSpent: minutesSpent,
      completed: true,
      notes: `Focus block on ${sessionTopic}. Solved ${solvedCount} questions with ${correctCount} correct answers (${accuracy}%).`,
      startedAt: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      finishedAt: new Date().toISOString(),
      mcqsAttemptedCount: solvedCount,
      accuracyPercent: accuracy
    });

    onFinishSession(minutesSpent);
  };

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswerSubmitted || !questions[currentQIndex]) return;
    const q = questions[currentQIndex];
    const durationSecs = Math.max(3, Math.round((Date.now() - qStartTime) / 1000));
    setLastQuestionLatency(durationSecs);
    
    LearningEngine.processAttempt(q, selectedAnswer, durationSecs);
    setIsAnswerSubmitted(true);
    setSolvedCount(prev => prev + 1);
    if (selectedAnswer === q.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCurrentQIndex(prev => (prev + 1) % questions.length);
    setQStartTime(Date.now());
  };

  const handleToggleVoiceReadout = (text: string) => {
    if (isVoiceSpeaking) {
      RuviVoice.stopSpeaking();
      setIsVoiceSpeaking(false);
    } else {
      setIsVoiceSpeaking(true);
      RuviVoice.speak(
        text, 
        () => setIsVoiceSpeaking(false), 
        () => setIsVoiceSpeaking(false)
      );
    }
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round(((selectedProtocol.minutes * 60 - secondsRemaining) / (selectedProtocol.minutes * 60)) * 100));
  const currentQ = questions[currentQIndex];

  // ==========================================
  // VIEW 1: LOCKED FULLSCREEN FOCUS MODE
  // ==========================================
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-parchment-50 flex flex-col overflow-y-auto selection:bg-terracotta-100 selection:text-terracotta-800 animate-fadeIn">
        
        {/* Simple Minimalist Top Bar (48px) - Clean, simple icon & timer pill */}
        <header className="sticky top-0 z-40 bg-ink-950/95 backdrop-blur-md text-parchment-100 px-3.5 py-2.5 sm:px-6 sm:py-3 border-b border-ink-800 flex items-center justify-between gap-2 shadow-elevated">
          
          {/* Simple Lock Icon & Chapter */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shrink-0 shadow-soft">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xs sm:text-sm text-white truncate">
                  {sessionPayload?.topicName || selectedChapter.topic}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              </div>
              <span className="text-[10px] text-parchment-400 font-mono block truncate">
                Locked Focus Session • {selectedProtocol.name}
              </span>
            </div>
          </div>

          {/* Compact Timer Pill & Quick Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Timer Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-ink-900 border border-ink-700 font-mono font-bold text-sm text-terracotta-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-terracotta-400" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Ambient Sound Cycle Icon */}
            <button
              onClick={handleSoundCycle}
              className="w-9 h-9 rounded-xl bg-ink-900 border border-ink-700 text-parchment-300 hover:text-white flex items-center justify-center transition-colors"
              title={`Ambient sound: ${ambientSound}. Tap to change.`}
            >
              {ambientSound === 'none' ? (
                <VolumeX className="w-4 h-4 text-parchment-500" />
              ) : (
                <Headphones className="w-4 h-4 text-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Manual Fullscreen Toggle */}
            <button
              onClick={() => {
                if (typeof document !== 'undefined') {
                  if (document.fullscreenElement) {
                    exitBrowserFullscreenSynchronous();
                  } else {
                    requestBrowserFullscreenSynchronous();
                  }
                }
              }}
              className="w-9 h-9 rounded-xl bg-ink-900 border border-ink-700 text-parchment-300 hover:text-white flex items-center justify-center transition-colors"
              title="Toggle Fullscreen"
            >
              {typeof document !== 'undefined' && document.fullscreenElement ? (
                <Minimize2 className="w-4 h-4 text-parchment-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-terracotta-400" />
              )}
            </button>

            {/* Emergency Exit / Unlock */}
            <button
              onClick={handleExitLockedSession}
              className="px-2.5 py-1.5 rounded-xl bg-ink-900 hover:bg-red-950/80 border border-ink-700 hover:border-red-800 text-[11px] font-semibold text-parchment-300 hover:text-red-300 flex items-center gap-1 transition-colors"
              title="Unlock & Exit Focus Session (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </header>

        {/* Minimal Progress Line */}
        <div className="h-1 w-full bg-ink-900 overflow-hidden">
          <div 
            className="h-full bg-terracotta-500 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Locked Body: Takes full screen space directly for Question & Notes */}
        <div className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4">
          
          {/* Minimal Tab Switcher Pill */}
          <div className="flex items-center justify-between gap-2 border-b border-parchment-200 pb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'quiz'
                    ? 'bg-parchment-200 text-ink-950 shadow-2xs'
                    : 'text-ink-600 hover:bg-parchment-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-terracotta-600" />
                <span>Chapter Test Quiz ({questions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-parchment-200 text-ink-950 shadow-2xs'
                    : 'text-ink-600 hover:bg-parchment-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-terracotta-600" />
                <span>Chapter Study Notes</span>
              </button>
            </div>

            <span className="text-[11px] text-ink-500 font-medium hidden sm:inline">
              Solved: {solvedCount} • Correct: {correctCount}
            </span>
          </div>

          {/* Active Quiz View: Fills screen with zero distraction */}
          {activeTab === 'quiz' && (
            questions.length === 0 ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-parchment-200 shadow-soft text-center space-y-4 animate-fadeIn">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="font-serif text-lg font-bold text-ink-900">
                    No Verified Questions for "{selectedChapter.topic}" Yet
                  </h3>
                  <p className="text-xs text-ink-600 mt-1.5 leading-relaxed font-sans">
                    Ruvi strictly adheres to exam alignment and will never silently substitute unrelated questions. You can read the comprehensive chapter study notes, review formulas, or select another syllabus topic.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveTab('notes')}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-xs font-semibold text-ink-800 transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-terracotta-600" />
                    <span>Read Chapter Study Notes</span>
                  </button>
                  <button
                    onClick={() => {
                      const verified = CHAPTERS.find(c => c.id !== selectedChapter.id && StorageService.getQuestions().some(q => q.topic.toLowerCase().includes(c.filterKeyword))) || CHAPTERS[0];
                      setSelectedChapter(verified);
                    }}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>Switch to Verified Topic</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : currentQ && (
              <div className="p-4 sm:p-7 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-4 animate-fadeIn">
              
              <div className="flex items-center justify-between text-xs text-ink-600 pb-2 border-b border-parchment-200">
                <span className="font-semibold text-terracotta-700">
                  {currentQ.subtopic || selectedChapter.topic} • Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="text-[11px] text-ink-500 font-mono">
                  Speed Benchmark: &lt;45s
                </span>
              </div>

              {/* Question Text */}
              <h3 className="font-serif text-base sm:text-lg font-bold text-ink-900 leading-snug">
                {currentQ.questionText}
              </h3>

              {/* Options List (A to E) */}
              <div className="space-y-2.5">
                {(['A', 'B', 'C', 'D', 'E'] as const).map(key => {
                  const optText = currentQ.options[key];
                  if (!optText) return null;
                  const isSelected = selectedAnswer === key;
                  const isCorrect = currentQ.correctAnswer === key;
                  
                  let optionStyle = 'bg-white border-parchment-200 hover:border-parchment-400 text-ink-900';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-red-50 border-red-400 text-red-950';
                    }
                  } else if (isSelected) {
                    optionStyle = 'bg-parchment-100 border-terracotta-500 text-ink-950 font-semibold';
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={isAnswerSubmitted}
                      className={`w-full min-h-[48px] p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-colors ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-terracotta-500 text-white' : 'bg-parchment-100 text-ink-700'
                      }`}>
                        {key}
                      </span>
                      <span className="text-xs sm:text-sm pt-0.5 leading-relaxed">{optText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-parchment-200">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className={`min-h-[48px] px-6 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      selectedAnswer 
                        ? 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-soft' 
                        : 'bg-parchment-200 text-ink-400 cursor-not-allowed'
                    }`}
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="min-h-[48px] px-6 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-soft"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <div className="text-xs text-ink-600 font-medium">
                  {lastQuestionLatency > 0 && isAnswerSubmitted && (
                    <span className={`mr-2 font-mono ${lastQuestionLatency <= 45 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {lastQuestionLatency}s ({lastQuestionLatency <= 45 ? 'CET Speed' : 'Pacing Gap'})
                    </span>
                  )}
                  <span>Score: {correctCount}/{solvedCount}</span>
                </div>
              </div>

              {/* Instant Explanation Card */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-parchment-50 border border-parchment-200 space-y-2 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="font-bold flex items-center gap-1.5 text-ink-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Answer Explanation ({currentQ.correctAnswer}):</span>
                    </div>
                    <button
                      onClick={() => handleToggleVoiceReadout(`${currentQ.explanation}. ${currentQ.hinglishExplanation || ''}`)}
                      className="p-1 rounded-lg text-terracotta-700 hover:bg-parchment-100 flex items-center gap-1 text-[11px] font-semibold"
                      title="Ruvi Audio Readout"
                    >
                      <Radio className={`w-3.5 h-3.5 ${isVoiceSpeaking ? 'animate-pulse text-terracotta-600' : ''}`} />
                      <span>{isVoiceSpeaking ? "Stop Voice" : "Hear Ruvi"}</span>
                    </button>
                  </div>
                  <p className="text-ink-800 leading-relaxed font-sans">
                    {currentQ.explanation}
                  </p>
                  {currentQ.hinglishExplanation && (
                    <div className="text-[11px] text-amber-900 pt-1 border-t border-parchment-200/80">
                      <span className="font-semibold">Hinglish Key: </span>
                      {currentQ.hinglishExplanation}
                    </div>
                  )}
                </div>
              )}

            </div>
            )
          )}

          {/* Active Study Notes View */}
          {activeTab === 'notes' && (
            <div className="p-4 sm:p-7 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
                <div>
                  <span className="text-[11px] font-mono text-terracotta-700 font-semibold block mb-0.5">
                    {selectedChapter.weightage}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-900">
                    {selectedChapter.topic}: {selectedChapter.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleToggleVoiceReadout(`${selectedChapter.title}. ${selectedChapter.summary}. ${selectedChapter.hinglishIntuition}`)}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-xs font-semibold flex items-center gap-1.5 text-ink-800 transition-colors"
                >
                  <Radio className={`w-4 h-4 text-terracotta-600 ${isVoiceSpeaking ? 'animate-pulse' : ''}`} />
                  <span>{isVoiceSpeaking ? "Pause Audio" : "Ruvi Audio Note"}</span>
                </button>
              </div>

              <p className="text-sm text-ink-800 leading-relaxed font-sans">
                {selectedChapter.summary}
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hinglish Memory Anchor & Intuition:</span>
                </div>
                <p className="leading-relaxed">
                  {selectedChapter.hinglishIntuition}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-ink-800 block">Core Formulas & Short-cuts:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedChapter.formulas.map((f, i) => (
                    <div key={i} className="p-2 rounded-xl bg-parchment-100 border border-parchment-200 font-mono text-xs font-semibold text-terracotta-800 flex items-start gap-2">
                      <span className="w-4 h-4 rounded bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>CET Distractor Traps & Speed Traps (Avoid in 40s):</span>
                </span>
                <div className="space-y-1.5">
                  {selectedChapter.distractorTraps.map((trap, i) => (
                    <div key={i} className="p-2 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{trap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-parchment-200 flex justify-end">
                <button
                  onClick={() => setActiveTab('quiz')}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-soft"
                >
                  <span>Start Test Quiz on this Chapter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNLOCKED STANDARD SETUP VIEW
  // Clean, serene, zero-clutter. Simple icon & button.
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-7 animate-fadeIn">
      
      {/* Header with simple focus icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ink-900 text-terracotta-400 flex items-center justify-center shrink-0 shadow-soft">
            <Lock className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-ink-900">
              Focus Sanctuary
            </h1>
            <p className="text-xs text-ink-600 mt-0.5">
              Select chapter and lock in. Locks full screen with ambient audio and immediate quiz for {profile.name}.
            </p>
          </div>
        </div>

        <button
          onClick={() => lockEverythingAndStart('quiz')}
          className="self-start sm:self-auto min-h-[48px] px-5 py-2.5 rounded-2xl bg-ink-900 hover:bg-ink-800 text-parchment-50 text-xs font-bold flex items-center gap-2 transition-colors shadow-soft"
        >
          <Lock className="w-4 h-4 text-terracotta-400" />
          <span>Lock In & Start Test</span>
        </button>
      </div>

      {/* Completion Modal / Scorecard if completed */}
      {isCompleted && (
        <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-soft space-y-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-emerald-900">
                Focus Milestone Completed!
              </h3>
              <p className="text-xs text-emerald-800">
                Logged {Math.round(elapsedSeconds / 60)} mins on {selectedChapter.topic}. Solved {solvedCount} questions ({correctCount} correct).
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => lockEverythingAndStart('quiz')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              Start Another Locked Session
            </button>
            <button
              onClick={() => onOpenCompanion(`Review my performance on ${selectedChapter.topic}.`)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 text-xs font-semibold transition-colors"
            >
              Ask Ruvi for Debrief
            </button>
          </div>
        </div>
      )}

      {/* Chapter Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink-800 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Select Chapter:</span>
          </span>
          <span className="text-[11px] text-ink-500 font-medium">
            MAH-CET English & VARC Syllabus
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {CHAPTERS.map(ch => {
            const isSelected = selectedChapter.id === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(ch)}
                className={`p-3 rounded-2xl border text-left min-h-[56px] transition-colors flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-parchment-100 border-terracotta-500 shadow-soft ring-1 ring-terracotta-400' 
                    : 'bg-white border-parchment-200 hover:border-parchment-300'
                }`}
              >
                <span className="font-serif font-bold text-xs text-ink-900 line-clamp-1">{ch.topic}</span>
                <span className="text-[10px] text-ink-500 mt-0.5 line-clamp-1">{ch.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Study Guide & Formula Briefing for selected chapter */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-parchment-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-terracotta-100 text-terracotta-800 uppercase tracking-wider">
                Study Guide & Blueprint
              </span>
              <span className="text-[11px] text-ink-500 font-mono">
                {selectedChapter.weightage}
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-ink-900 mt-1">
              {selectedChapter.topic}: {selectedChapter.title}
            </h2>
          </div>

          <button
            onClick={() => handleToggleVoiceReadout(`${selectedChapter.title}. ${selectedChapter.summary}. ${selectedChapter.hinglishIntuition}`)}
            className="self-start sm:self-auto min-h-[38px] px-3 py-1.5 rounded-xl border border-parchment-300 hover:bg-parchment-100 text-xs font-semibold flex items-center gap-1.5 text-ink-800 transition-colors"
          >
            <Radio className={`w-3.5 h-3.5 text-terracotta-600 ${isVoiceSpeaking ? 'animate-pulse' : ''}`} />
            <span>{isVoiceSpeaking ? "Stop Voice" : "Hear Ruvi Voice Summary"}</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-ink-800 leading-relaxed font-sans">
          {selectedChapter.summary}
        </p>

        {/* Hinglish Intuition Anchor */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Hinglish Memory Anchor & Intuition:</span>
          </div>
          <p className="leading-relaxed">
            {selectedChapter.hinglishIntuition}
          </p>
        </div>

        {/* Core Formulas */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Core Speed Formulas & Shortcuts:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedChapter.formulas.map((f, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-parchment-100/90 border border-parchment-200 font-mono text-xs font-semibold text-terracotta-900 flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0 text-[10px]">
                  {i + 1}
                </span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CET Examiner Traps */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>CET Examiner Distractor Traps (Avoid in 45s):</span>
          </span>
          <div className="space-y-1.5">
            {selectedChapter.distractorTraps.map((trap, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span>{trap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Solved Worked Example */}
        {selectedChapter.solvedExample && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-1.5">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>CET Solved Benchmark Example:</span>
            </div>
            <p className="font-semibold text-ink-900">Q: {selectedChapter.solvedExample.question}</p>
            <p className="text-ink-700"><span className="font-semibold text-indigo-900">Step-by-step:</span> {selectedChapter.solvedExample.stepByStep}</p>
            <p className="text-indigo-800 font-mono text-[11px]"><span className="font-semibold">⚡ 30s Speed Trick:</span> {selectedChapter.solvedExample.trick}</p>
          </div>
        )}

        {/* Dual Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={() => lockEverythingAndStart('notes')}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-ink-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Read Study Guide in Fullscreen</span>
          </button>
          <button
            onClick={() => lockEverythingAndStart('quiz')}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-soft"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Start Interactive Test Quiz ({questions.length} Questions)</span>
          </button>
        </div>
      </div>

      {/* Protocol Duration Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-ink-800 block">Session Protocol:</span>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {PROTOCOLS.map(proto => {
            const isSelected = selectedProtocol.id === proto.id;
            return (
              <button
                key={proto.id}
                onClick={() => handleProtocolSelect(proto)}
                className={`p-3.5 rounded-2xl border text-left transition-colors min-h-[48px] flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-parchment-100 border-terracotta-500 shadow-soft' 
                    : 'bg-white border-parchment-200 hover:border-parchment-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs sm:text-sm text-ink-900">{proto.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isSelected ? 'bg-terracotta-100 text-terracotta-800' : 'bg-parchment-100 text-ink-600'
                  }`}>
                    {proto.badge}
                  </span>
                </div>
                <p className="text-[10px] text-ink-600 mt-1 line-clamp-1 hidden sm:block">{proto.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ambient Soundscape Selection */}
      <div className="p-4 rounded-2xl bg-white border border-parchment-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-terracotta-600" />
          <span className="text-ink-800 font-semibold">Ambient Focus Audio:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'rain', label: 'Monsoon Rain' },
            { id: 'gamma', label: '40Hz Gamma' },
            { id: 'zen', label: 'Zen Resonance' },
            { id: 'none', label: 'Silence' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setAmbientSound(item.id as AmbientType);
                if (item.id === 'none') FocusAudio.stopAmbient();
              }}
              className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                ambientSound === item.id 
                  ? 'bg-terracotta-500 text-white shadow-2xs' 
                  : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Start & Lock In Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-ink-900 text-parchment-50 border border-ink-800 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-terracotta-300 uppercase tracking-wider block">
            Target: {selectedChapter.topic}
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
            Ready to Lock In for {selectedProtocol.minutes} Minutes?
          </h2>
          <p className="text-xs text-parchment-300 mt-1">
            Fullscreen immersion will lock away all menus and start Question 1 immediately.
          </p>
        </div>

        <button
          onClick={() => lockEverythingAndStart('quiz')}
          className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft transition-colors shrink-0"
        >
          <Lock className="w-4 h-4 fill-current" />
          <span>Lock In & Start Test</span>
        </button>
      </div>

    </div>
  );
};
