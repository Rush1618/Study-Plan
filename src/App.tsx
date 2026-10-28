import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DailyPlanView } from './components/DailyPlanView';
import { McqEngine } from './components/McqEngine';
import { SyllabusView } from './components/SyllabusView';
import { FocusModeView } from './components/FocusModeView';
import { MentorDashboard } from './components/MentorDashboard';
import { MistakeNotebook } from './components/MistakeNotebook';
import { AIMemoryView } from './components/AIMemoryView';
import { RoadmapView } from './components/RoadmapView';
import { CompanionView } from './components/CompanionView';
import { StudyCompanionDrawer } from './components/StudyCompanionDrawer';
import { CloudSyncModal } from './components/CloudSyncModal';
import { UserProfile, TopicMastery, MistakeRecord, PracticeMode, SupabaseSyncConfig } from './types';
import { StorageService } from './services/storage';
import { LearningEngine } from './services/learningEngine';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('daily');
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [topicMasteries, setTopicMasteries] = useState<TopicMastery[]>(() => StorageService.getTopicMastery());
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => StorageService.getMistakes());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseSyncConfig>(() => StorageService.getSupabaseConfig());

  // Automatic Background Continuous Learning Runner
  // Starts from previous checkpoint (never resets to 0), updates version automatically
  useEffect(() => {
    const stopRunner = LearningEngine.startAutoLearningRunner(120000);
    return () => stopRunner();
  }, []);

  // Refresh latest state from persistent storage when tab changes or reset occurs
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setTopicMasteries(StorageService.getTopicMastery());
    setMistakes(StorageService.getMistakes());
    setProfile(StorageService.getProfile());
    setSupabaseConfig(StorageService.getSupabaseConfig());
  };

  const handleProfileReset = () => {
    setProfile(StorageService.getProfile());
    setTopicMasteries(StorageService.getTopicMastery());
    setMistakes(StorageService.getMistakes());
    setSupabaseConfig(StorageService.getSupabaseConfig());
  };

  // Companion drawer state
  const [isCompanionOpen, setIsCompanionOpen] = useState<boolean>(false);
  const [companionInitialPrompt, setCompanionInitialPrompt] = useState<string | undefined>(undefined);

  // Cloud Sync Modal state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // MCQ Engine initial launch mode
  const [mcqInitialMode, setMcqInitialMode] = useState<PracticeMode>('quick');

  const handleStartPractice = (mode: string, _payload?: any) => {
    if (mode === 'focus') {
      handleStartFocus(true);
      return;
    }
    setMcqInitialMode(mode as PracticeMode);
    handleTabChange('mcq');
  };

  const handleOpenCompanionWithPrompt = (prompt?: string) => {
    setCompanionInitialPrompt(prompt);
    setIsCompanionOpen(true);
  };

  const [autoStartFocus, setAutoStartFocus] = useState<boolean>(false);

  const handleStartFocus = (autoFullscreen: boolean = true) => {
    if (autoFullscreen && typeof document !== 'undefined') {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } catch {}
    }
    setAutoStartFocus(true);
    handleTabChange('focus');
  };

  const [isFocusLocked, setIsFocusLocked] = useState<boolean>(false);
  const unresolvedCount = mistakes.filter(m => !m.resolved).length;

  return (
    <div className="min-h-screen flex flex-col bg-parchment-50 text-ink-900 selection:bg-terracotta-100 selection:text-terracotta-800">
      
      {/* Top Sanctuary Navigation (Hidden during locked focus mode) */}
      {!isFocusLocked && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          profile={profile}
          setProfile={setProfile}
          openCompanion={() => handleOpenCompanionWithPrompt()}
          isCompanionOpen={isCompanionOpen}
          unresolvedMistakesCount={unresolvedCount}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          syncStatus={supabaseConfig.syncStatus}
        />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto transition-all ${
        isFocusLocked 
          ? 'p-0 max-w-full' 
          : 'max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-mobile-nav lg:pb-8'
      }`}>
        
        {/* 1. Daily Plan & Sanctuary Focus */}
        {currentTab === 'daily' && (
          <DailyPlanView
            profile={profile}
            onStartPractice={(topic) => handleStartPractice('topic', { topic })}
            onStartFocus={() => handleStartFocus(true)}
            onOpenCompanion={(prompt) => {
              if (prompt) {
                handleOpenCompanionWithPrompt(prompt);
              } else {
                handleTabChange('companion');
              }
            }}
          />
        )}

        {/* 2. Personal AI Companion Sanctuary */}
        {currentTab === 'companion' && (
          <CompanionView
            profile={profile}
            mistakes={mistakes}
            onStartPractice={handleStartPractice}
          />
        )}

        {/* 3. MCQ Practice & Question Bank */}
        {currentTab === 'mcq' && (
          <McqEngine
            profile={profile}
            initialMode={mcqInitialMode}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {/* 3. Mistake Notebook & Parallel Calibration (Re-homed) */}
        {currentTab === 'mistakes' && (
          <MistakeNotebook
            onStartParallelTest={(_id) => handleStartPractice('mistake_redo')}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {/* 4. Official Syllabus & Uploaded Materials */}
        {currentTab === 'syllabus' && (
          <SyllabusView
            profile={profile}
            onStartTopicPractice={(topic) => handleStartPractice('topic', { topic })}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {/* 5. 24-Week Strategic Roadmap (Re-homed) */}
        {currentTab === 'roadmap' && (
          <RoadmapView
            profile={profile}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {/* 6. Focus Room */}
        {currentTab === 'focus' && (
          <FocusModeView
            profile={profile}
            autoStartSession={autoStartFocus}
            onSessionLockChange={(locked) => setIsFocusLocked(locked)}
            onFinishSession={(minutes) => {
              setAutoStartFocus(false);
              setIsFocusLocked(false);
              StorageService.logFocusSession({
                id: `focus-${Date.now()}`,
                subject: 'Quantitative Aptitude',
                topic: 'Percentages & Base Values',
                targetMinutes: 25,
                actualMinutesSpent: minutes || 25,
                completed: true,
                notes: `Completed calibrated focus sprint.`,
                startedAt: new Date().toISOString(),
                mcqsAttemptedCount: 2
              });
              handleTabChange('daily');
            }}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {/* 7. AI Memory Transparency Center (Re-homed) */}
        {currentTab === 'memory' && (
          <AIMemoryView />
        )}

        {/* 8. Mentor Dashboard */}
        {currentTab === 'mentor' && (
          <MentorDashboard
            profile={profile}
            topicMasteries={topicMasteries}
            mistakes={mistakes}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

      </main>

      {/* Socratic Study Companion Drawer (Mobile Bottom Sheet / Desktop Drawer) */}
      <StudyCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        profile={profile}
        mistakes={mistakes}
        initialPrompt={companionInitialPrompt}
        onStartPractice={handleStartPractice}
      />

      {/* Supabase Cloud Sync & Slate Reset Modal */}
      <CloudSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => {
          setIsSyncModalOpen(false);
          setSupabaseConfig(StorageService.getSupabaseConfig());
        }}
        profile={profile}
        onProfileReset={handleProfileReset}
      />

      {/* Editorial Sanctuary Footer */}
      <footer className="border-t border-parchment-200 bg-parchment-100/60 py-6 px-4 text-center text-xs text-ink-700 font-sans pb-mobile-nav lg:pb-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-ink-900 text-sm">Her Study Space</span>
            <span className="text-ink-400">/</span>
            <span>MAH-MBA/MMS-CET 2027 Sanctuary for {profile.name}</span>
          </div>
          <div className="text-[11px] text-ink-600">
            Target: 13 April 2027 (Date Provisional) / Asia/Kolkata Timezone
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
