import React from 'react';
import { 
  Compass, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BrainCircuit, 
  UserCheck, 
  Bot, 
  Languages,
  ShieldCheck,
  ChevronRight
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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  profile,
  setProfile,
  openCompanion,
  isCompanionOpen,
  unresolvedMistakesCount
}) => {
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

  const navItems = [
    { id: 'dashboard', label: "Today's Session", icon: Compass },
    { id: 'mcq', label: "MCQ Engine", icon: CheckCircle2 },
    { id: 'library', label: "Study Library", icon: BookOpen },
    { id: 'mistakes', label: "Mistake Notebook", icon: AlertCircle, badge: unresolvedMistakesCount },
    { id: 'roadmap', label: "24-Week Roadmap", icon: Calendar },
    { id: 'ai-memory', label: "AI Memory", icon: BrainCircuit },
    ...(profile.role === 'mentor' ? [{ id: 'mentor', label: "Mentor Hub", icon: UserCheck }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-parchment-50/95 backdrop-blur-md border-b border-parchment-200 transition-colors">
      {/* Top micro-bar: Exam context and status banner */}
      <div className="bg-ink-900 text-parchment-100 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-2 border-b border-ink-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-terracotta-400 animate-pulse"></span>
          <span className="font-medium tracking-wide">MAH-MBA/MMS-CET 2027</span>
          <span className="text-ink-200/60 hidden md:inline">•</span>
          <span className="text-ink-200/80 text-[11px] bg-ink-800 px-2 py-0.5 rounded border border-ink-700">
            Exam Date Provisional (Target: 13 April 2027)
          </span>
          <span className="text-ink-200/60 hidden lg:inline">•</span>
          <span className="text-ink-200/80 hidden lg:inline text-[11px]">
            Week 1 of 24 (Started 28 Oct 2026)
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          {/* Language toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-parchment-200 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-ink-800 border border-transparent hover:border-ink-700"
            title="Toggle between English and Hinglish explanations"
          >
            <Languages className="w-3.5 h-3.5 text-terracotta-400" />
            <span>Expl: <strong className="text-white">{profile.preferredLanguage}</strong></span>
          </button>

          {/* Role switcher toggle */}
          <div className="flex items-center bg-ink-950 p-0.5 rounded-full border border-ink-700">
            <button
              onClick={toggleRole}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                profile.role === 'student' 
                  ? 'bg-terracotta-500 text-white shadow-sm' 
                  : 'text-ink-200 hover:text-white'
              }`}
            >
              Student: {profile.name}
            </button>
            <button
              onClick={toggleRole}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                profile.role === 'mentor' 
                  ? 'bg-ink-700 text-white shadow-sm' 
                  : 'text-ink-200 hover:text-white'
              }`}
            >
              Mentor: Prof. Sharma
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Product Identity */}
          <div 
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-ink-900 text-parchment-50 flex items-center justify-center font-serif text-xl font-bold shadow-soft border border-ink-800 group-hover:bg-terracotta-500 transition-colors">
              H
            </div>
            <div>
              <div className="font-serif text-lg font-bold tracking-tight text-ink-900 group-hover:text-terracotta-600 transition-colors">
                Her Study Space
              </div>
              <p className="text-[11px] text-ink-500/90 font-medium tracking-wide">
                One focused session at a time.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all relative ${
                    isActive 
                      ? 'bg-ink-900 text-parchment-50 shadow-sm' 
                      : 'text-ink-700 hover:text-ink-900 hover:bg-parchment-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-terracotta-400' : 'text-ink-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive 
                        ? 'bg-terracotta-500 text-white' 
                        : 'bg-terracotta-100 text-terracotta-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: AI Companion Drawer Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={openCompanion}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isCompanionOpen
                  ? 'bg-terracotta-500 text-white border-terracotta-600 shadow-soft'
                  : 'bg-parchment-100 hover:bg-terracotta-50 text-ink-900 hover:text-terracotta-700 border-parchment-300'
              }`}
              title="Open Socratic AI Study Companion"
            >
              <Bot className="w-4 h-4 text-terracotta-600 group-hover:rotate-6 transition-transform" />
              <span className="hidden sm:inline">Ask Companion</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-parchment-200 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'text-terracotta-600 font-bold bg-terracotta-50' 
                    : 'text-ink-700 hover:text-ink-900'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
