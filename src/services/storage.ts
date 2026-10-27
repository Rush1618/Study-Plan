import { 
  UserProfile, 
  Question, 
  MistakeRecord, 
  TopicMastery, 
  LibraryDocument, 
  AIMemoryItem, 
  RoadmapWeek 
} from '../types';
import { 
  initialUserProfile, 
  sampleQuestions, 
  sampleMistakes, 
  sampleTopicMastery, 
  sampleLibraryDocuments, 
  sampleAIMemories, 
  sampleRoadmapWeeks 
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
  API_CONFIG: 'hss_api_config_v2'
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

export const StorageService = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : initialUserProfile;
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
      return data ? JSON.parse(data) : sampleQuestions;
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

  resetAll(): void {
    localStorage.clear();
  }
};
