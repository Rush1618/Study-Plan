import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { StudyLibrary } from './components/StudyLibrary';
import { StudyCompanionDrawer } from './components/StudyCompanionDrawer';
import { CloudSyncModal } from './components/CloudSyncModal';
import { UserProfile, TopicMastery, MistakeRecord, PracticeMode, SupabaseSyncConfig, StudySessionLaunchPayload } from './types';
import { StorageService } from './services/storage';
import { requestBrowserFullscreenSynchronous, createSessionPayload } from './services/sessionRouter';

export const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [topicMasteries, setTopicMasteries] = useState<TopicMastery[]>(() => StorageService.getTopicMastery());
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => StorageService.getMistakes());
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseSyncConfig>(() => StorageService.getSupabaseConfig());

  // Active study session payload for Focus Mode
  const [activeSessionPayload, setActiveSessionPayload] = useState<StudySessionLaunchPayload | null>(null);
  const [autoStartFocus, setAutoStartFocus] = useState<boolean>(false);
  const [isFocusLocked, setIsFocusLocked] = useState<boolean>(false);

  // Companion drawer state
  const [isCompanionOpen, setIsCompanionOpen] = useState<boolean>(false);
  const [companionInitialPrompt, setCompanionInitialPrompt] = useState<string | undefined>(undefined);

  // Cloud Sync Modal state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // MCQ Engine initial launch mode
  const [mcqInitialMode, setMcqInitialMode] = useState<PracticeMode>('quick');

  // Refresh latest state on location change
  useEffect(() => {
    setTopicMasteries(StorageService.getTopicMastery());
    setMistakes(StorageService.getMistakes());
    setProfile(StorageService.getProfile());
    setSupabaseConfig(StorageService.getSupabaseConfig());
  }, [location.pathname]);

  // Dynamic Document Title for SEO & Accessibility
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': "Today's Plan | RUVI — MAH-CET 2027",
      '/daily': "Today's Plan | RUVI — MAH-CET 2027",
      '/companion': "Ruvi Study Companion | MAH-CET 2027",
      '/focus': "Focus Room & Timed Sprints | RUVI",
      '/practice': "Practice & Question Bank | RUVI",
      '/mcq': "Practice & Question Bank | RUVI",
      '/mistakes': "Mistake Notebook & Error Log | RUVI",
      '/syllabus': "Official Syllabus & Weightage | RUVI",
      '/library': "Study Library & Chunks | RUVI",
      '/roadmap': "24-Week Strategic Roadmap | RUVI",
      '/memory': "AI Memory & Transparency | RUVI",
      '/mentor': "Mentor Dashboard | RUVI"
    };
    document.title = titles[location.pathname] || "RUVI — MAH-MBA/MMS-CET 2027 Sanctuary";
  }, [location.pathname]);

  const handleProfileReset = () => {
    setProfile(StorageService.getProfile());
    setTopicMasteries(StorageService.getTopicMastery());
    setMistakes(StorageService.getMistakes());
    setSupabaseConfig(StorageService.getSupabaseConfig());
  };

  const handleOpenCompanionWithPrompt = (prompt?: string) => {
    setCompanionInitialPrompt(prompt);
    setIsCompanionOpen(true);
  };

  const handleStartPractice = (mode: string, payload?: { topic?: string; subject?: string }) => {
    if (mode === 'focus') {
      handleStartFocus({ topicName: payload?.topic, subject: payload?.subject as any });
      return;
    }
    setMcqInitialMode(mode as PracticeMode);
    if (payload?.topic) {
      navigate(`/practice?mode=${encodeURIComponent(mode)}&topic=${encodeURIComponent(payload.topic)}&subject=${encodeURIComponent(payload.subject || '')}`);
    } else {
      navigate(`/practice?mode=${encodeURIComponent(mode)}`);
    }
  };

  const handleStartFocus = (payloadOverrides?: Partial<StudySessionLaunchPayload>) => {
    // Request document fullscreen synchronously inside the real user click handler
    requestBrowserFullscreenSynchronous();
    const payload = createSessionPayload({
      returnDestination: (location.pathname.replace('/', '') as any) || 'daily',
      ...payloadOverrides
    });
    setActiveSessionPayload(payload);
    setAutoStartFocus(true);
    navigate('/focus');
  };

  const unresolvedCount = mistakes.filter(m => !m.resolved).length;

  return (
    <div className="min-h-screen flex flex-col bg-parchment-50 text-ink-900 selection:bg-terracotta-100 selection:text-terracotta-800">
      
      {/* Top Sanctuary Navigation (Hidden during locked focus mode) */}
      {!isFocusLocked && (
        <Navbar
          profile={profile}
          setProfile={setProfile}
          openCompanion={() => handleOpenCompanionWithPrompt()}
          isCompanionOpen={isCompanionOpen}
          unresolvedMistakesCount={unresolvedCount}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          syncStatus={supabaseConfig.syncStatus}
        />
      )}

      {/* Main Multi-Page Routed Content Area */}
      <main className={`flex-1 w-full mx-auto transition-all ${
        isFocusLocked 
          ? 'p-0 max-w-full' 
          : 'max-w-7xl px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-mobile-nav lg:pb-8'
      }`}>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/daily" replace />} />

          {/* 1. Daily Plan Page */}
          <Route 
            path="/daily" 
            element={
              <DailyPlanView
                profile={profile}
                onStartPractice={(topic) => handleStartPractice('topic', { topic })}
                onStartFocus={() => handleStartFocus()}
                onOpenCompanion={(prompt) => {
                  if (prompt) {
                    handleOpenCompanionWithPrompt(prompt);
                  } else {
                    navigate('/companion');
                  }
                }}
              />
            } 
          />

          {/* 2. Ruvi AI Companion Page */}
          <Route 
            path="/companion" 
            element={
              <CompanionView
                profile={profile}
                mistakes={mistakes}
                onStartPractice={handleStartPractice}
              />
            } 
          />

          {/* 3. MCQ Practice & Question Bank Page */}
          <Route 
            path="/practice" 
            element={
              <McqEngine
                profile={profile}
                initialMode={mcqInitialMode}
                onOpenCompanion={handleOpenCompanionWithPrompt}
              />
            } 
          />
          <Route path="/mcq" element={<Navigate to="/practice" replace />} />

          {/* 4. Mistake Notebook Page */}
          <Route 
            path="/mistakes" 
            element={
              <MistakeNotebook
                onStartParallelTest={(_id) => handleStartPractice('mistake_redo')}
                onOpenCompanion={handleOpenCompanionWithPrompt}
              />
            } 
          />

          {/* 5. Official Syllabus & Notes Page */}
          <Route 
            path="/syllabus" 
            element={
              <SyllabusView
                profile={profile}
                onStartTopicPractice={(topic) => handleStartPractice('topic', { topic })}
                onOpenCompanion={handleOpenCompanionWithPrompt}
              />
            } 
          />

          {/* 6. Study Library Page (Document Ingestion & Chunks) */}
          <Route 
            path="/library" 
            element={
              <StudyLibrary
                onStartDocumentPractice={(docId) => handleStartPractice('topic', { topic: docId })}
                onOpenCompanion={handleOpenCompanionWithPrompt}
              />
            } 
          />

          {/* 7. 24-Week Strategic Roadmap Page */}
          <Route 
            path="/roadmap" 
            element={
              <RoadmapView
                profile={profile}
                onOpenCompanion={handleOpenCompanionWithPrompt}
              />
            } 
          />

          {/* 8. Focus Room Page (with optional topic param) */}
          <Route 
            path="/focus" 
            element={
              <FocusModeView
                profile={profile}
                sessionPayload={activeSessionPayload}
                autoStartSession={autoStartFocus}
                onSessionLockChange={(locked) => setIsFocusLocked(locked)}
                onFinishSession={(_minutes) => {
                  setAutoStartFocus(false);
                  setIsFocusLocked(false);
                  const returnDest = activeSessionPayload?.returnDestination || 'daily';
                  setActiveSessionPayload(null);
                  navigate(`/${returnDest}`);
                }}
                onOpenCompanion={handleOpenCompanionWithPrompt}
              />
            } 
          />
          <Route 
            path="/focus/:chapterId" 
            element={
              <FocusModeView
                profile={profile}
                sessionPayload={activeSessionPayload}
                autoStartSession={autoStartFocus}
                onSessionLockChange={(locked) => setIsFocusLocked(locked)}
                onFinishSession={(_minutes) => {
                  setAutoStartFocus(false);
                  setIsFocusLocked(false);
                  const returnDest = activeSessionPayload?.returnDestination || 'daily';
                  setActiveSessionPayload(null);
                  navigate(`/${returnDest}`);
                }}
                onOpenCompanion={handleOpenCompanionWithPrompt}
              />
            } 
          />

          {/* 9. AI Memory & Transparency Page */}
          <Route path="/memory" element={<AIMemoryView />} />

          {/* 10. Mentor Dashboard Page */}
          <Route 
            path="/mentor" 
            element={
              <MentorDashboard
                profile={profile}
                topicMasteries={topicMasteries}
                mistakes={mistakes}
                onOpenCompanion={handleOpenCompanionWithPrompt}
              />
            } 
          />

          {/* Fallback to Daily */}
          <Route path="*" element={<Navigate to="/daily" replace />} />
        </Routes>
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
