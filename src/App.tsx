import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { McqEngine } from './components/McqEngine';
import { StudyLibrary } from './components/StudyLibrary';
import { MistakeNotebook } from './components/MistakeNotebook';
import { RoadmapView } from './components/RoadmapView';
import { AIMemoryView } from './components/AIMemoryView';
import { MentorDashboard } from './components/MentorDashboard';
import { StudyCompanionDrawer } from './components/StudyCompanionDrawer';
import { 
  initialUserProfile, 
  sampleTopicMastery, 
  sampleMistakes 
} from './data/mockData';
import { UserProfile, TopicMastery, MistakeRecord, PracticeMode } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(initialUserProfile);
  const [topicMasteries, setTopicMasteries] = useState<TopicMastery[]>(sampleTopicMastery);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(sampleMistakes);

  // Companion drawer state
  const [isCompanionOpen, setIsCompanionOpen] = useState<boolean>(false);
  const [companionInitialPrompt, setCompanionInitialPrompt] = useState<string | undefined>(undefined);

  // MCQ Engine initial launch mode
  const [mcqInitialMode, setMcqInitialMode] = useState<PracticeMode>('quick');

  const handleStartPractice = (mode: string, payload?: any) => {
    setMcqInitialMode(mode as PracticeMode);
    setCurrentTab('mcq');
  };

  const handleOpenCompanionWithPrompt = (prompt?: string) => {
    setCompanionInitialPrompt(prompt);
    setIsCompanionOpen(true);
  };

  const unresolvedCount = mistakes.filter(m => !m.resolved).length;

  return (
    <div className="min-h-screen flex flex-col bg-parchment-50 text-ink-900 selection:bg-terracotta-100 selection:text-terracotta-800">
      
      {/* Top Sanctuary Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        profile={profile}
        setProfile={setProfile}
        openCompanion={() => handleOpenCompanionWithPrompt()}
        isCompanionOpen={isCompanionOpen}
        unresolvedMistakesCount={unresolvedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            topicMasteries={topicMasteries}
            mistakes={mistakes}
            onStartPractice={handleStartPractice}
            onOpenCompanion={handleOpenCompanionWithPrompt}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'mcq' && (
          <McqEngine
            profile={profile}
            initialMode={mcqInitialMode}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {currentTab === 'library' && (
          <StudyLibrary
            onStartDocumentPractice={(docId) => handleStartPractice('document_based', { docId })}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {currentTab === 'mistakes' && (
          <MistakeNotebook
            onStartParallelTest={(mistakeId) => handleStartPractice('mistake_redo', { mistakeId })}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {currentTab === 'roadmap' && (
          <RoadmapView
            profile={profile}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}

        {currentTab === 'ai-memory' && (
          <AIMemoryView />
        )}

        {currentTab === 'mentor' && (
          <MentorDashboard
            profile={profile}
            topicMasteries={topicMasteries}
            mistakes={mistakes}
            onOpenCompanion={handleOpenCompanionWithPrompt}
          />
        )}
      </main>

      {/* Socratic Study Companion Drawer */}
      <StudyCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
        profile={profile}
        mistakes={mistakes}
        initialPrompt={companionInitialPrompt}
        onStartPractice={handleStartPractice}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-parchment-200 bg-parchment-100/60 py-8 px-4 text-center text-xs text-ink-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-ink-800 text-sm">Her Study Space</span>
            <span>•</span>
            <span>MAH-MBA/MMS-CET 2027 Personalized Prep Sanctuary</span>
          </div>
          <div className="text-[11px] text-ink-400">
            Target: 13 April 2027 (Date Provisional) • Asia/Kolkata Timezone
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
