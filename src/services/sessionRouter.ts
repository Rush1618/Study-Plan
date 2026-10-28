import { StudySessionLaunchPayload, SubjectType } from '../types';

/**
 * Synchronously requests document fullscreen inside real user click handler.
 * Does not rely on useEffect (which browser security rejects).
 * Returns true if request succeeded or element is already fullscreen.
 */
export function requestBrowserFullscreenSynchronous(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('[FocusMode] Browser rejected fullscreen request:', err);
      });
      return true;
    }
    return Boolean(document.fullscreenElement);
  } catch (err) {
    console.warn('[FocusMode] Fullscreen exception:', err);
    return false;
  }
}

/**
 * Cleanly exits fullscreen mode without throwing or trapping the user.
 */
export function exitBrowserFullscreenSynchronous(): void {
  if (typeof document === 'undefined') return;
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  } catch {}
}

/**
 * Factory for creating strongly-typed session launch payloads.
 */
export function createSessionPayload(options: {
  subject: SubjectType;
  topicName: string;
  topicId?: string;
  taskId?: string;
  plannedDurationMinutes?: number;
  quizMode?: 'practice' | 'diagnostic' | 'timed_exam' | 'mistake_drill';
  sourceContentIds?: string[];
  returnDestination?: 'daily' | 'syllabus' | 'roadmap' | 'companion' | 'mistakes';
  autoFullscreen?: boolean;
}): StudySessionLaunchPayload {
  return {
    sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    taskId: options.taskId,
    subject: options.subject,
    topicId: options.topicId,
    topicName: options.topicName,
    plannedDurationMinutes: options.plannedDurationMinutes || 25,
    quizMode: options.quizMode || 'practice',
    sourceContentIds: options.sourceContentIds || [],
    returnDestination: options.returnDestination || 'daily',
    autoFullscreen: options.autoFullscreen !== false
  };
}
