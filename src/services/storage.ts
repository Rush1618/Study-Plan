import { 
  UserProfile, 
  Question, 
  MistakeRecord, 
  TopicMastery, 
  LibraryDocument, 
  AIMemoryItem, 
  RoadmapWeek,
  FocusSession,
  SupabaseSyncConfig,
  DailyPlanTask,
  SyllabusSection
} from '../types';
import { 
  initialUserProfile, 
  sampleQuestions, 
  sampleMistakes, 
  sampleTopicMastery, 
  sampleLibraryDocuments, 
  sampleAIMemories, 
  sampleRoadmapWeeks,
  sampleDailyPlan,
  sampleSyllabusSections
} from '../data/mockData';

const STORAGE_KEYS = {
  PROFILE: 'hss_user_profile_v2',
  QUESTIONS: 'hss_questions_v2',
  MISTAKES: 'hss_mistakes_v2',
  TOPIC_MASTERY: 'hss_topic_mastery_v2',
  DOCUMENTS: 'hss_documents_v2',
  AI_MEMORIES: 'hss_ai_memories_v2',
  ROADMAP: 'hss_roadmap_v2',
  ATTEMPT_LOGS: 'hss_attempt_logs_v2',
  API_CONFIG: 'hss_api_config_v2',
  FOCUS_SESSIONS: 'hss_focus_sessions_v2',
  SUPABASE_SYNC: 'hss_supabase_sync_v2',
  DAILY_PLAN: 'hss_daily_plan_v2',
  SYLLABUS: 'hss_syllabus_v2',
  MODEL_CHECKPOINT: 'hss_model_checkpoint_v1'
};

export interface ModelCheckpoint {
  version: string;
  majorVersion: number;
  minorVersion: number;
  totalTrainingRuns: number;
  cumulativeAttempts: number;
  lastTrainedAt: string;
  loss: number;
  bktParameters: {
    priorKnowledgePL0: number;
    transitionRatePT: number;
    slipRatePS: number;
    guessRatePG: number;
  };
  topicLatentMastery: Record<string, number>;
}

export const defaultModelCheckpoint: ModelCheckpoint = {
  version: 'v1.0',
  majorVersion: 1,
  minorVersion: 0,
  totalTrainingRuns: 0,
  cumulativeAttempts: 0,
  lastTrainedAt: new Date().toISOString(),
  loss: 0.693,
  bktParameters: {
    priorKnowledgePL0: 0.52,
    transitionRatePT: 0.18,
    slipRatePS: 0.10,
    guessRatePG: 0.20
  },
  topicLatentMastery: {}
};

export interface AttemptLog {
  id: string;
  questionId: string;
  subject: string;
  topic: string;
  chosenAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  isCorrect: boolean;
  timeSpentSeconds: number;
  timestamp: string;
}

export interface AIProviderConfig {
  provider: 'local_socratic' | 'gemini' | 'openai' | 'anthropic';
  apiKey?: string;
  modelName?: string;
}

export const defaultSupabaseConfig: SupabaseSyncConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  syncEnabled: false,
  syncStatus: 'idle'
};

export const StorageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const prof: UserProfile = data ? JSON.parse(data) : initialUserProfile;
      if (prof.companionName === 'Study Companion' || prof.companionName === 'J.A.R.V.I.S.') {
        prof.companionName = 'Ruvi';
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(prof));
      }
      return prof;
    } catch {
      return initialUserProfile;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (!data) return sampleQuestions;
      const parsed: Question[] = JSON.parse(data);
      if (parsed.length < sampleQuestions.length) {
        const existingIds = new Set(parsed.map(q => q.id));
        const merged = [...parsed, ...sampleQuestions.filter(q => !existingIds.has(q.id))];
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return sampleQuestions;
    }
  },

  saveQuestions(questions: Question[]): void {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  addQuestion(q: Question): void {
    const list = this.getQuestions();
    this.saveQuestions([q, ...list]);
  },

  getMistakes(): MistakeRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISTAKES);
      return data ? JSON.parse(data) : sampleMistakes;
    } catch {
      return sampleMistakes;
    }
  },

  saveMistakes(mistakes: MistakeRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  },

  getTopicMastery(): TopicMastery[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPIC_MASTERY);
      return data ? JSON.parse(data) : sampleTopicMastery;
    } catch {
      return sampleTopicMastery;
    }
  },

  saveTopicMastery(mastery: TopicMastery[]): void {
    localStorage.setItem(STORAGE_KEYS.TOPIC_MASTERY, JSON.stringify(mastery));
  },

  getDocuments(): LibraryDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : sampleLibraryDocuments;
    } catch {
      return sampleLibraryDocuments;
    }
  },

  saveDocuments(docs: LibraryDocument[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  addDocument(doc: LibraryDocument): void {
    const list = this.getDocuments();
    this.saveDocuments([doc, ...list]);
  },

  getAIMemories(): AIMemoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_MEMORIES);
      return data ? JSON.parse(data) : sampleAIMemories;
    } catch {
      return sampleAIMemories;
    }
  },

  saveAIMemories(memories: AIMemoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.AI_MEMORIES, JSON.stringify(memories));
  },

  getRoadmap(): RoadmapWeek[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROADMAP);
      return data ? JSON.parse(data) : sampleRoadmapWeeks;
    } catch {
      return sampleRoadmapWeeks;
    }
  },

  saveRoadmap(roadmap: RoadmapWeek[]): void {
    localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(roadmap));
  },

  getAttemptLogs(): AttemptLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  logAttempt(attempt: AttemptLog): void {
    const logs = this.getAttemptLogs();
    logs.push(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPT_LOGS, JSON.stringify(logs));
  },

  getFocusSessions(): FocusSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  logFocusSession(session: FocusSession): void {
    const sessions = this.getFocusSessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
  },

  getAIConfig(): AIProviderConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
      return data ? JSON.parse(data) : { provider: 'local_socratic' };
    } catch {
      return { provider: 'local_socratic' };
    }
  },

  saveAIConfig(config: AIProviderConfig): void {
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
  },

  getSupabaseConfig(): SupabaseSyncConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPABASE_SYNC);
      return data ? JSON.parse(data) : defaultSupabaseConfig;
    } catch {
      return defaultSupabaseConfig;
    }
  },

  saveSupabaseConfig(config: SupabaseSyncConfig): void {
    localStorage.setItem(STORAGE_KEYS.SUPABASE_SYNC, JSON.stringify(config));
  },

  getDailyPlan(): DailyPlanTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_PLAN);
      return data ? JSON.parse(data) : sampleDailyPlan;
    } catch {
      return sampleDailyPlan;
    }
  },

  saveDailyPlan(tasks: DailyPlanTask[]): void {
    localStorage.setItem(STORAGE_KEYS.DAILY_PLAN, JSON.stringify(tasks));
  },

  addDailyTask(task: DailyPlanTask): void {
    const list = this.getDailyPlan();
    this.saveDailyPlan([task, ...list]);
  },

  toggleDailyTask(id: string): void {
    const list = this.getDailyPlan();
    const updated = list.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    this.saveDailyPlan(updated);
  },

  getSyllabus(): SyllabusSection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYLLABUS);
      return data ? JSON.parse(data) : sampleSyllabusSections;
    } catch {
      return sampleSyllabusSections;
    }
  },

  saveSyllabus(sections: SyllabusSection[]): void {
    localStorage.setItem(STORAGE_KEYS.SYLLABUS, JSON.stringify(sections));
  },

  updateSyllabusTopicStatus(subject: string, topicId: string, status: 'Not Started' | 'In Progress' | 'Completed'): void {
    const sections = this.getSyllabus();
    const updated = sections.map(sec => {
      if (sec.subject === subject) {
        return {
          ...sec,
          topics: sec.topics.map(t => t.id === topicId ? { ...t, status } : t)
        };
      }
      return sec;
    });
    this.saveSyllabus(updated);
  },

  getModelCheckpoint(): ModelCheckpoint {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODEL_CHECKPOINT);
      return data ? JSON.parse(data) : defaultModelCheckpoint;
    } catch {
      return defaultModelCheckpoint;
    }
  },

  saveModelCheckpoint(checkpoint: ModelCheckpoint): void {
    localStorage.setItem(STORAGE_KEYS.MODEL_CHECKPOINT, JSON.stringify(checkpoint));
  },

  exportAllData(): Record<string, any> {
    return {
      profile: this.getProfile(),
      questions: this.getQuestions(),
      mistakes: this.getMistakes(),
      topicMastery: this.getTopicMastery(),
      documents: this.getDocuments(),
      aiMemories: this.getAIMemories(),
      roadmap: this.getRoadmap(),
      attemptLogs: this.getAttemptLogs(),
      focusSessions: this.getFocusSessions(),
      supabaseConfig: this.getSupabaseConfig(),
      dailyPlan: this.getDailyPlan(),
      syllabus: this.getSyllabus(),
      modelCheckpoint: this.getModelCheckpoint(),
      exportedAt: new Date().toISOString()
    };
  },

  importAllData(data: Record<string, any>): boolean {
    try {
      if (!data || typeof data !== 'object') return false;
      if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
      if (data.questions) localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(data.questions));
      if (data.mistakes) localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(data.mistakes));
      if (data.topicMastery) localStorage.setItem(STORAGE_KEYS.TOPIC_MASTERY, JSON.stringify(data.topicMastery));
      if (data.documents) localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(data.documents));
      if (data.aiMemories) localStorage.setItem(STORAGE_KEYS.AI_MEMORIES, JSON.stringify(data.aiMemories));
      if (data.roadmap) localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(data.roadmap));
      if (data.attemptLogs) localStorage.setItem(STORAGE_KEYS.ATTEMPT_LOGS, JSON.stringify(data.attemptLogs));
      if (data.focusSessions) localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(data.focusSessions));
      if (data.dailyPlan) localStorage.setItem(STORAGE_KEYS.DAILY_PLAN, JSON.stringify(data.dailyPlan));
      if (data.syllabus) localStorage.setItem(STORAGE_KEYS.SYLLABUS, JSON.stringify(data.syllabus));
      if (data.modelCheckpoint) localStorage.setItem(STORAGE_KEYS.MODEL_CHECKPOINT, JSON.stringify(data.modelCheckpoint));
      return true;
    } catch (e) {
      console.error("Failed to import data:", e);
      return false;
    }
  },

  downloadBackup(): void {
    const backup = this.exportAllData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ruvi_memory_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  resetToFreshProfile(studentName: string = 'Sanskriti'): void {
    const freshProfile: UserProfile = {
      ...initialUserProfile,
      name: studentName
    };
    // Initialize clean topic mastery with 0 attempts
    const freshMastery: TopicMastery[] = sampleTopicMastery.map(tm => ({
      ...tm,
      status: 'Unexplored',
      accuracyPercent: 0,
      questionsAttempted: 0,
      sessionsCount: 0,
      confidenceRating: 1,
      commonErrors: [],
      evidenceText: 'Fresh study journey. No attempts recorded yet.'
    }));

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(freshProfile));
    localStorage.setItem(STORAGE_KEYS.TOPIC_MASTERY, JSON.stringify(freshMastery));
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ATTEMPT_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AI_MEMORIES, JSON.stringify([
      {
        id: 'mem-init',
        type: 'observed_fact',
        category: 'Profile',
        title: 'Initial Onboarding',
        statement: `${studentName} started preparation for MAH-CET 2027.`,
        evidenceSource: 'System Initialization',
        confidenceScore: 100,
        lastUpdated: new Date().toISOString(),
        editable: false
      }
    ]));
  },

  resetAll(): void {
    localStorage.clear();
  }
};
