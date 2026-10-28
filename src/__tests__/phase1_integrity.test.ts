import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';
import { LearningEngine } from '../services/learningEngine';
import { DocumentIndexer } from '../services/documentIndexer';
import { Question } from '../types';

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('Phase 1 Integrity & Safety Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Learner Model & Attempt Tracking', () => {
    it('computes topic accuracy strictly from observed attempts without synthetic corruption', () => {
      const sampleQ: Question = {
        id: 'test-q-1',
        subject: 'Quantitative Aptitude',
        topic: 'Percentages & Ratios',
        subtopic: 'Base Shifts',
        difficulty: 'CET Standard',
        questionText: 'Test percentage question',
        options: { A: '10%', B: '20%', C: '30%', D: '40%', E: '50%' },
        correctAnswer: 'B',
        explanation: 'Correct answer is B'
      };

      // 1. First attempt correct
      const res1 = LearningEngine.processAttempt(sampleQ, 'B', 30);
      expect(res1.isCorrect).toBe(true);

      const masteryAfter1 = StorageService.getTopicMastery().find(m => m.topicName.includes('Percentages & Ratios'));
      expect(masteryAfter1).toBeDefined();
      expect(masteryAfter1?.questionsAttempted).toBe(1);
      expect(masteryAfter1?.accuracyPercent).toBe(100);

      // 2. Second attempt incorrect
      const res2 = LearningEngine.processAttempt(sampleQ, 'A', 40);
      expect(res2.isCorrect).toBe(false);

      const masteryAfter2 = StorageService.getTopicMastery().find(m => m.topicName.includes('Percentages & Ratios'));
      expect(masteryAfter2?.questionsAttempted).toBe(2);
      expect(masteryAfter2?.accuracyPercent).toBe(50); // 1 of 2 = 50%
    });

    it('creates an attempt log for every response idempotently', () => {
      const sampleQ: Question = {
        id: 'test-q-2',
        subject: 'Logical Reasoning',
        topic: 'Circular Seating',
        subtopic: 'Inward Facing',
        difficulty: 'CET Standard',
        questionText: 'Test seating question',
        options: { A: 'Left', B: 'Right', C: 'Opposite', D: 'Adjacent', E: 'None' },
        correctAnswer: 'A',
        explanation: 'Correct answer is A'
      };

      LearningEngine.processAttempt(sampleQ, 'A', 25);
      const attempts = StorageService.getAttemptLogs();
      expect(attempts.length).toBe(1);
      expect(attempts[0].questionId).toBe('test-q-2');
      expect(attempts[0].isCorrect).toBe(true);
    });
  });

  describe('Security & Sensitive Credential Stripping', () => {
    it('exportData never exports API keys or provider secrets', () => {
      // Set an API config with key
      StorageService.saveAIConfig({
        provider: 'openrouter',
        apiKey: 'sk-secret-test-key',
        modelName: 'test-model'
      });

      const exported = StorageService.exportAllData();
      const parsed = JSON.parse(exported);

      // API keys must NEVER be in exported JSON
      expect(parsed.apiConfig).toBeUndefined();
      expect(exported).not.toContain('sk-secret-test-key');
    });
  });

  describe('Document Indexing Deduplication', () => {
    it('prevents duplicate document addition with same title or hash', () => {
      const initialDocs = StorageService.getDocuments().length;

      const dummyDoc = {
        id: 'doc-test-1',
        title: 'Unique Document Title',
        fileName: 'unique.txt',
        fileType: 'TXT' as const,
        sizeFormatted: '1.2 MB',
        uploadDate: '28 Oct 2026',
        status: 'Ready' as const,
        totalPages: 1,
        topicsDetected: ['Percentages'],
        extractedMCQsCount: 3,
        chunksCount: 2,
        summary: 'Test summary',
        sampleChunks: []
      };

      // Add once
      const added1 = StorageService.addDocument(dummyDoc);
      expect(added1).toBe(true);
      expect(StorageService.getDocuments().length).toBe(initialDocs + 1);

      // Add identical document again -> should reject or be idempotent
      const added2 = StorageService.addDocument(dummyDoc);
      expect(added2).toBe(false);
      expect(StorageService.getDocuments().length).toBe(initialDocs + 1);
    });
  });
});
