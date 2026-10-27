import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storage';
import { SupabaseSyncConfig } from '../types';

let cachedClient: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';

export function getSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  const currentConfig = StorageService.getSupabaseConfig();
  const targetUrl = url || currentConfig.supabaseUrl;
  const targetKey = key || currentConfig.supabaseAnonKey;

  if (!targetUrl || !targetKey) return null;

  if (cachedClient && cachedUrl === targetUrl && cachedKey === targetKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(targetUrl, targetKey);
    cachedUrl = targetUrl;
    cachedKey = targetKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export const SUPABASE_SQL_SCHEMA = `-- Her Study Space: Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor to enable cross-device sync

create table if not exists public.profiles (
  id text primary key,
  name text not null,
  target_exam text,
  start_date text,
  target_end_date text,
  daily_goal_hours numeric default 3.5,
  preferred_language text default 'English',
  role text default 'student',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.attempts (
  id text primary key,
  question_id text not null,
  subject text not null,
  topic text not null,
  chosen_answer text not null,
  correct_answer text not null,
  is_correct boolean not null,
  time_spent_seconds numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.mistakes (
  id text primary key,
  question_id text not null,
  subject text not null,
  topic text not null,
  subtopic text,
  mistake_category text not null,
  question_excerpt text,
  selected_answer text not null,
  correct_answer text not null,
  misunderstanding_identified text,
  repeated_count integer default 1,
  resolved boolean default false,
  last_tested_date text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.topic_mastery (
  id text primary key,
  subject text not null,
  topic_name text not null,
  status text not null,
  accuracy_percent numeric default 0,
  questions_attempted integer default 0,
  confidence_rating integer default 1,
  average_time_per_q numeric default 60,
  evidence_text text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.focus_sessions (
  id text primary key,
  subject text not null,
  topic text not null,
  target_minutes integer not null,
  actual_minutes_spent integer not null,
  completed boolean default true,
  notes text,
  started_at text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) or allow public anon access for private personal deployment
alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.mistakes enable row level security;
alter table public.topic_mastery enable row level security;
alter table public.focus_sessions enable row level security;

create policy "Allow anon full access" on public.profiles for all using (true) with check (true);
create policy "Allow anon full access" on public.attempts for all using (true) with check (true);
create policy "Allow anon full access" on public.mistakes for all using (true) with check (true);
create policy "Allow anon full access" on public.topic_mastery for all using (true) with check (true);
create policy "Allow anon full access" on public.focus_sessions for all using (true) with check (true);
`;

export const SupabaseSyncService = {
  async testConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
    try {
      const client = createClient(url, key);
      // Query profiles or a simple ping
      const { error } = await client.from('profiles').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        // Table may not exist yet, but credentials could still be valid
        if (error.message.includes('relation "public.profiles" does not exist') || error.code === '42P01') {
          return {
            success: true,
            message: 'Connected to Supabase! (Note: Tables not created yet. Please execute the provided SQL schema.)'
          };
        }
        return {
          success: false,
          message: `Connection failed: ${error.message}`
        };
      }
      return {
        success: true,
        message: 'Successfully connected and verified Supabase database connection.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error connecting to Supabase'
      };
    }
  },

  async syncAll(): Promise<{ success: boolean; pushedCount: number; message: string }> {
    const config = StorageService.getSupabaseConfig();
    if (!config.syncEnabled || !config.supabaseUrl || !config.supabaseAnonKey) {
      return { success: false, pushedCount: 0, message: 'Cloud sync is disabled or credentials missing.' };
    }

    const client = getSupabaseClient(config.supabaseUrl, config.supabaseAnonKey);
    if (!client) {
      return { success: false, pushedCount: 0, message: 'Could not create Supabase client.' };
    }

    let recordsPushed = 0;

    try {
      // 1. Sync Profile
      const profile = StorageService.getProfile();
      const { error: profileError } = await client.from('profiles').upsert({
        id: 'student-profile-1',
        name: profile.name,
        target_exam: profile.targetExam,
        start_date: profile.startDate,
        target_end_date: profile.targetEndDate,
        daily_goal_hours: profile.dailyGoalHours,
        preferred_language: profile.preferredLanguage,
        role: profile.role,
        updated_at: new Date().toISOString()
      });
      if (!profileError) recordsPushed += 1;

      // 2. Sync Attempts
      const attempts = StorageService.getAttemptLogs();
      if (attempts.length > 0) {
        const mappedAttempts = attempts.map(a => ({
          id: a.id,
          question_id: a.questionId,
          subject: a.subject,
          topic: a.topic,
          chosen_answer: a.chosenAnswer,
          correct_answer: a.correctAnswer,
          is_correct: a.isCorrect,
          time_spent_seconds: a.timeSpentSeconds,
          created_at: a.timestamp
        }));
        const { error: attemptError } = await client.from('attempts').upsert(mappedAttempts);
        if (!attemptError) recordsPushed += attempts.length;
      }

      // 3. Sync Topic Mastery
      const masteries = StorageService.getTopicMastery();
      if (masteries.length > 0) {
        const mappedMastery = masteries.map(m => ({
          id: m.id,
          subject: m.subject,
          topic_name: m.topicName,
          status: m.status,
          accuracy_percent: m.accuracyPercent,
          questions_attempted: m.questionsAttempted,
          confidence_rating: m.confidenceRating,
          average_time_per_q: m.averageTimePerQSeconds,
          evidence_text: m.evidenceText,
          updated_at: new Date().toISOString()
        }));
        const { error: masteryError } = await client.from('topic_mastery').upsert(mappedMastery);
        if (!masteryError) recordsPushed += masteries.length;
      }

      // 4. Sync Mistakes
      const mistakes = StorageService.getMistakes();
      if (mistakes.length > 0) {
        const mappedMistakes = mistakes.map(m => ({
          id: m.id,
          question_id: m.questionId,
          subject: m.subject,
          topic: m.topic,
          subtopic: m.subtopic,
          mistake_category: m.mistakeCategory,
          question_excerpt: m.questionExcerpt,
          selected_answer: m.selectedAnswer,
          correct_answer: m.correctAnswer,
          misunderstanding_identified: m.misunderstandingIdentified,
          repeated_count: m.repeatedCount,
          resolved: m.resolved,
          last_tested_date: m.lastTestedDate,
          updated_at: new Date().toISOString()
        }));
        const { error: mistakeError } = await client.from('mistakes').upsert(mappedMistakes);
        if (!mistakeError) recordsPushed += mistakes.length;
      }

      // 5. Sync Focus Sessions
      const sessions = StorageService.getFocusSessions();
      if (sessions.length > 0) {
        const mappedSessions = sessions.map(s => ({
          id: s.id,
          subject: s.subject,
          topic: s.topic,
          target_minutes: s.targetMinutes,
          actual_minutes_spent: s.actualMinutesSpent,
          completed: s.completed,
          notes: s.notes,
          started_at: s.startedAt,
          created_at: s.startedAt
        }));
        const { error: sessionError } = await client.from('focus_sessions').upsert(mappedSessions);
        if (!sessionError) recordsPushed += sessions.length;
      }

      // Update sync status
      const updatedConfig: SupabaseSyncConfig = {
        ...config,
        syncStatus: 'connected',
        lastSyncedTimestamp: new Date().toISOString(),
        errorMessage: undefined
      };
      StorageService.saveSupabaseConfig(updatedConfig);

      return {
        success: true,
        pushedCount: recordsPushed,
        message: `Successfully synchronized ${recordsPushed} records to Supabase cloud.`
      };
    } catch (err: any) {
      const updatedConfig: SupabaseSyncConfig = {
        ...config,
        syncStatus: 'error',
        errorMessage: err.message
      };
      StorageService.saveSupabaseConfig(updatedConfig);
      return {
        success: false,
        pushedCount: recordsPushed,
        message: `Sync failed: ${err.message}`
      };
    }
  }
};
