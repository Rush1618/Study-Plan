import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BrainCircuit, 
  UserCheck, 
  Bot, 
  Languages,
  Clock,
  Cloud,
  Map,
  MoreHorizontal,
  X
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  openCompanion: () => void;
  isCompanionOpen: boolean;
  unresolvedMistakesCount: number;
  onOpenSyncModal?: () => void;
  syncStatus?: 'idle' | 'syncing' | 'connected' | 'error';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  profile,
  setProfile,
  openCompanion,
  isCompanionOpen,
  unresolvedMistakesCount,
  onOpenSyncModal,
  syncStatus = 'idle'
}) => {
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const toggleRole = () => {
    setProfile(prev => ({
      ...prev,
      role: prev.role === 'student' ? 'mentor' : 'student'
    }));
  };

  const toggleLanguage = () => {
    setProfile(prev => ({
      ...prev,
      preferredLanguage: prev.preferredLanguage === 'English' ? 'Hinglish' : 'English'
    }));
  };

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'daily', label: 'Today', icon: Calendar },
    { id: 'companion', label: 'Ruvi', icon: Bot },
    { id: 'focus', label: 'Focus Mode', icon: Clock },
    { id: 'mcq', label: 'Practice', icon: CheckCircle2 },
    { id: 'mistakes', label: 'Mistakes', icon: AlertCircle, badge: unresolvedMistakesCount },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
    { id: 'memory', label: 'AI Memory & Model', icon: BrainCircuit },
    ...(profile.role === 'mentor' ? [{ id: 'mentor', label: 'Mentor Review', icon: UserCheck }] : [])
  ];

  const mobileTabs: NavItem[] = [
    { id: 'daily', label: 'Today', icon: Calendar },
    { id: 'companion', label: 'Ruvi', icon: Bot },
    { id: 'focus', label: 'Focus', icon: Clock },
    { id: 'mcq', label: 'Practice', icon: CheckCircle2 },
  ];

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileMoreOpen(false);
  };

  return (
    <>
      {/* Unified Calm Header - No jarring dark cockpit bar */}
      <header className="sticky top-0 z-40 bg-parchment-50/90 backdrop-blur-md border-b border-parchment-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            
            {/* Brand Wordmark */}
            <button 
              onClick={() => handleSelectTab('daily')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-parchment-200 border border-parchment-300 text-ink-900 flex items-center justify-center font-serif text-base sm:text-lg font-bold group-hover:bg-terracotta-100 group-hover:border-terracotta-300 group-hover:text-terracotta-700 transition-colors">
                H
              </div>
              <div>
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-ink-900 block leading-tight">
                  Her Study Space
                </span>
                <span className="text-[11px] text-ink-500 font-normal hidden sm:block">
                  MAH-MBA/MMS-CET 2027
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative min-h-[36px] ${
                      isActive 
                        ? 'bg-parchment-200 text-ink-900 font-semibold' 
                        : 'text-ink-600 hover:text-ink-900 hover:bg-parchment-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-terracotta-600' : 'text-ink-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Language, Role & Companion */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Cloud Sync */}
              {onOpenSyncModal && (
                <button
                  onClick={onOpenSyncModal}
                  className="p-2 sm:px-2.5 sm:py-1 rounded-lg text-xs text-ink-600 hover:text-ink-900 hover:bg-parchment-100 border border-transparent hover:border-parchment-200 transition-colors flex items-center gap-1.5"
                  title="Cloud Sync"
                >
                  <Cloud className="w-3.5 h-3.5 text-ink-500" />
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    syncStatus === 'connected' ? 'bg-sage-600' : 'bg-amber-500'
                  }`} />
                  <span className="hidden sm:inline text-[11px] font-medium">
                    {syncStatus === 'connected' ? 'Synced' : 'Local'}
                  </span>
                </button>
              )}

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-ink-700 hover:text-ink-900 hover:bg-parchment-100 border border-parchment-200 transition-colors flex items-center gap-1"
                title="Toggle Language"
              >
                <Languages className="w-3.5 h-3.5 text-terracotta-600" />
                <span className="text-[11px]">{profile.preferredLanguage}</span>
              </button>

              {/* Role Toggle */}
              <button
                onClick={toggleRole}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-parchment-100 hover:bg-parchment-200 border border-parchment-200 text-ink-800 transition-colors hidden sm:flex items-center gap-1.5"
                title="Switch between Sanskriti and Mentor view"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500"></span>
                <span className="text-[11px]">
                  {profile.role === 'student' ? 'Sanskriti' : 'Mentor'}
                </span>
              </button>

              {/* Ask Companion Trigger */}
              <button
                onClick={openCompanion}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isCompanionOpen
                    ? 'bg-terracotta-500 text-white border-terracotta-600'
                    : 'bg-parchment-100 hover:bg-parchment-200 text-ink-800 border-parchment-300'
                }`}
                title="Ask Study Companion"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Companion</span>
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb Zone, comfortable touch targets, safe area) */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-parchment-50/95 backdrop-blur-lg border-t border-parchment-200 bottom-mobile-nav"
      >
        <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center px-1">
          {mobileTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg transition-colors relative ${
                  isActive ? 'text-terracotta-700 font-semibold' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-terracotta-600 stroke-[2.2]' : 'text-ink-400'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 leading-none">{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-terracotta-500 mt-0.5"></span>
                )}
              </button>
            );
          })}

          {/* More Drawer */}
          <button
            onClick={() => setIsMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] rounded-lg transition-colors ${
              ['roadmap', 'focus', 'memory', 'mentor'].includes(currentTab)
                ? 'text-terracotta-700 font-semibold'
                : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1 leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* MOBILE "MORE" SHEET */}
      {isMobileMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-ink-950/20 backdrop-blur-sm animate-fadeIn">
          <div 
            className="flex-1"
            onClick={() => setIsMobileMoreOpen(false)}
          ></div>
          <div className="bg-parchment-50 border-t border-parchment-300 rounded-t-2xl p-5 shadow-elevated space-y-4 max-h-[80vh] overflow-y-auto bottom-mobile-nav">
            
            <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
              <h3 className="font-serif text-base font-bold text-ink-900">Study Sanctuary</h3>
              <button
                onClick={() => setIsMobileMoreOpen(false)}
                className="w-7 h-7 rounded-full bg-parchment-200 text-ink-700 flex items-center justify-center hover:bg-parchment-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleSelectTab('syllabus')}
                className={`p-3 rounded-xl border text-left transition-colors flex flex-col gap-1.5 ${
                  currentTab === 'syllabus'
                    ? 'bg-parchment-200 border-parchment-300 font-semibold text-ink-900'
                    : 'bg-white border-parchment-200 text-ink-800 hover:bg-parchment-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-terracotta-600" />
                <div className="text-xs font-medium">Syllabus & Notes</div>
                <div className="text-[10px] text-ink-500">CET Weightage & Docs</div>
              </button>

              <button
                onClick={() => handleSelectTab('roadmap')}
                className={`p-3 rounded-xl border text-left transition-colors flex flex-col gap-1.5 ${
                  currentTab === 'roadmap'
                    ? 'bg-parchment-200 border-parchment-300 font-semibold text-ink-900'
                    : 'bg-white border-parchment-200 text-ink-800 hover:bg-parchment-100'
                }`}
              >
                <Map className="w-4 h-4 text-indigo-600" />
                <div className="text-xs font-medium">24-Week Roadmap</div>
                <div className="text-[10px] text-ink-500">Phases & Milestones</div>
              </button>

              <button
                onClick={() => handleSelectTab('focus')}
                className={`p-3 rounded-xl border text-left transition-colors flex flex-col gap-1.5 ${
                  currentTab === 'focus'
                    ? 'bg-parchment-200 border-parchment-300 font-semibold text-ink-900'
                    : 'bg-white border-parchment-200 text-ink-800 hover:bg-parchment-100'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <div className="text-xs font-medium">Focus Room</div>
                <div className="text-[10px] text-ink-500">Timed Sprints</div>
              </button>

              <button
                onClick={() => handleSelectTab('memory')}
                className={`p-3 rounded-xl border text-left transition-colors flex flex-col gap-1.5 ${
                  currentTab === 'memory'
                    ? 'bg-parchment-200 border-parchment-300 font-semibold text-ink-900'
                    : 'bg-white border-parchment-200 text-ink-800 hover:bg-parchment-100'
                }`}
              >
                <BrainCircuit className="w-4 h-4 text-terracotta-600" />
                <div className="text-xs font-medium">AI Memory</div>
                <div className="text-[10px] text-ink-500">Inspect Hypotheses</div>
              </button>

              <button
                onClick={() => handleSelectTab('mentor')}
                className={`p-3 rounded-xl border text-left transition-colors flex flex-col gap-1.5 ${
                  currentTab === 'mentor'
                    ? 'bg-parchment-200 border-parchment-300 font-semibold text-ink-900'
                    : 'bg-white border-parchment-200 text-ink-800 hover:bg-parchment-100'
                }`}
              >
                <UserCheck className="w-4 h-4 text-sage-600" />
                <div className="text-xs font-medium">Mentor Review</div>
                <div className="text-[10px] text-ink-500">Progress Oversight</div>
              </button>
            </div>

            <div className="pt-2 border-t border-parchment-200 flex items-center justify-between text-xs text-ink-600">
              <span className="text-[11px]">Role: <strong className="text-ink-900">{profile.role === 'student' ? 'Sanskriti' : 'Mentor'}</strong></span>
              <button
                onClick={toggleRole}
                className="text-[11px] text-terracotta-600 font-semibold underline"
              >
                Switch Role
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
