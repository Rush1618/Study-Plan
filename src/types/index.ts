export type SubjectType = 'Logical Reasoning' | 'Abstract Reasoning' | 'Quantitative Aptitude' | 'Verbal Ability';

export type DifficultyLevel = 'Easy' | 'Moderate' | 'CET Standard' | 'Challenging';

export interface Question {
  id: string;
  subject: SubjectType;
  topic: string;
  subtopic: string;
  difficulty: DifficultyLevel;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  hinglishExplanation?: string;
  sourceDocId?: string;
  sourceDocTitle?: string;
  sourcePage?: number;
  conceptFormula?: string;
  parallelQuestionId?: string;
}

export type MistakeCategory = 
  | 'Wrong Base Value'
  | 'Careless Calculation'
  | 'Misread Question'
  | 'Poor Option Elimination'
  | 'Time Pressure Panic'
  | 'Conceptual Gap'
  | 'Direction/Orientation Error';

export interface MistakeRecord {
  id: string;
  questionId: string;
  subject: SubjectType;
  topic: string;
  subtopic: string;
  mistakeCategory: MistakeCategory;
  questionExcerpt: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  misunderstandingIdentified: string;
  correctReasoningFormula: string;
  repeatedCount: number;
  firstFailedDate: string;
  lastTestedDate: string;
  resolved: boolean;
  parallelQuestion?: Question;
}

export interface TopicMastery {
  id: string;
  subject: SubjectType;
  topicName: string;
  status: 'Mastered' | 'Practicing' | 'Needs Revision' | 'Unexplored';
  accuracyPercent: number;
  questionsAttempted: number;
  sessionsCount: number;
  confidenceRating: number; // 1-5
  averageTimePerQSeconds: number;
  lastPracticedDate: string;
  nextRevisionDate: string;
  commonErrors: string[];
  evidenceText: string;
}

export interface LibraryDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'TXT' | 'IMAGE';
  sizeFormatted: string;
  uploadDate: string;
  status: 'Ready' | 'Processing' | 'Indexed';
  totalPages?: number;
  topicsDetected: string[];
  extractedMCQsCount: number;
  chunksCount: number;
  summary: string;
  sampleChunks: {
    pageNumber: number;
    chunkId: string;
    text: string;
    keyFormulas?: string[];
  }[];
}

export interface AIMemoryItem {
  id: string;
  type: 'observed_fact' | 'ai_hypothesis';
  category: 'Profile' | 'Mastery' | 'Mistake Pattern' | 'Learning Preference' | 'Schedule Constraint';
  title: string;
  statement: string;
  evidenceSource: string;
  confidenceScore: number; // 0 to 100
  lastUpdated: string;
  editable: boolean;
  userCorrection?: string;
}

export interface RoadmapWeek {
  weekNumber: number;
  dateRange: string;
  phaseName: string;
  theme: string;
  focusTopics: {
    subject: SubjectType;
    topic: string;
    targetQuestions: number;
    completed: boolean;
  }[];
  mentorNotes?: string;
  isCurrentWeek?: boolean;
}

export type PracticeMode = 
  | 'quick' 
  | 'topic' 
  | 'ai_adaptive' 
  | 'mistake_redo' 
  | 'document_based' 
  | 'sectional' 
  | 'full_mock'
  | 'bookmarked';

export interface PracticeSessionState {
  sessionId: string;
  mode: PracticeMode;
  title: string;
  subtitle: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
  markedForReview: Record<string, boolean>;
  timePerQuestion: Record<string, number>; // seconds
  startTime: number;
  timeRemainingSeconds?: number;
  isTimed: boolean;
  isFinished: boolean;
  explanationLanguage: 'English' | 'Hinglish';
}

export interface UserProfile {
  name: string;
  targetExam: string;
  examDateStatus: 'Provisional (Official date not yet announced)' | 'Confirmed';
  startDate: string; // 28 October 2026
  targetEndDate: string; // 13 April 2027
  totalWeeks: number; // 24
  dailyGoalHours: number;
  preferredLanguage: 'English' | 'Hinglish';
  companionName: string;
  role: 'student' | 'mentor';
}
