import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/storage';
import { LearningEngine } from '../services/learningEngine';
import { StudySessionLaunchPayload, Question } from '../types';

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

describe('Phase 2 Typed Study Session Flow Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    StorageService.saveMistakes([]);
    StorageService.saveFocusSessions([]);
  });

  it('validates a typed launch payload contract', () => {
    const payload: StudySessionLaunchPayload = {
      sessionId: 'sess-test-101',
      taskId: 'dp-01',
      subject: 'Quantitative Aptitude',
      topicId: 'ch-quant-perc',
      topicName: 'Percentages & Base Values',
      plannedDurationMinutes: 25,
      quizMode: 'practice',
      sourceContentIds: ['doc-math-01'],
      returnDestination: 'daily',
      autoFullscreen: true
    };

    expect(payload.sessionId).toBe('sess-test-101');
    expect(payload.subject).toBe('Quantitative Aptitude');
    expect(payload.quizMode).toBe('practice');
    expect(payload.returnDestination).toBe('daily');
  });

  it('records exactly one attempt transaction idempotently and updates mistake notebook', () => {
    const q: Question = {
      id: 'q-math-55',
      subject: 'Quantitative Aptitude',
      topic: 'Percentages & Base Values',
      subtopic: 'Reverse Calculation',
      difficulty: 'CET Standard',
      questionText: 'If commodity price falls by 20%, what increase restores original price?',
      options: { A: '20%', B: '25%', C: '16.67%', D: '30%', E: 'None' },
      correctAnswer: 'B',
      explanation: 'Base decreases to 80; 20/80 = 25%.'
    };

    // First attempt incorrect
    const attempt1 = LearningEngine.processAttempt(q, 'A', 35);
    expect(attempt1.isCorrect).toBe(false);

    const mistakes1 = StorageService.getMistakes();
    expect(mistakes1.length).toBe(1);
    expect(mistakes1[0].questionId).toBe('q-math-55');
    expect(mistakes1[0].repeatedCount).toBe(1);

    // Second attempt on same question correct
    const attempt2 = LearningEngine.processAttempt(q, 'B', 22);
    expect(attempt2.isCorrect).toBe(true);

    const mistakes2 = StorageService.getMistakes();
    expect(mistakes2.find(m => m.questionId === 'q-math-55')?.resolved).toBe(true);
  });

  it('session completion logs exactly one FocusSession record', () => {
    const initialCount = StorageService.getFocusSessions().length;

    StorageService.logFocusSession({
      id: 'focus-test-session-1',
      subject: 'Quantitative Aptitude',
      topic: 'Percentages & Base Values',
      targetMinutes: 25,
      actualMinutesSpent: 24,
      completed: true,
      notes: 'Completed calibrated focus sprint.',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      mcqsAttemptedCount: 5,
      accuracyPercent: 80
    });

    const sessions = StorageService.getFocusSessions();
    expect(sessions.length).toBe(initialCount + 1);
    expect(sessions[0].id).toBe('focus-test-session-1');
  });
});
