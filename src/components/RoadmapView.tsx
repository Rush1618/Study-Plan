import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Compass, 
  Edit3, 
  Sparkles,
  BookOpen,
  UserCheck
} from 'lucide-react';
import { RoadmapWeek, UserProfile } from '../types';
import { sampleRoadmapWeeks } from '../data/mockData';

interface RoadmapViewProps {
  profile: UserProfile;
  onOpenCompanion: (prompt: string) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  profile,
  onOpenCompanion
}) => {
  const [weeks, setWeeks] = useState<RoadmapWeek[]>(sampleRoadmapWeeks);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [mentorNoteDraft, setMentorNoteDraft] = useState<string>('');

  const selectedWeek = weeks.find(w => w.weekNumber === selectedWeekNumber) || weeks[0];

  const toggleTopicCompleted = (topicIndex: number) => {
    setWeeks(prev => prev.map(w => {
      if (w.weekNumber === selectedWeekNumber) {
        const updated = [...w.focusTopics];
        updated[topicIndex].completed = !updated[topicIndex].completed;
        return { ...w, focusTopics: updated };
      }
      return w;
    }));
  };

  const handleSaveMentorNotes = () => {
    setWeeks(prev => prev.map(w => {
      if (w.weekNumber === selectedWeekNumber) {
        return { ...w, mentorNotes: mentorNoteDraft };
      }
      return w;
    }));
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Structured 24-Week Journey</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
            MAH-CET 2027 Adaptive Study Roadmap
          </h1>
          <p className="text-sm text-ink-700/90 mt-1">
            From foundation to mock calibration. 28 October 2026 → 13 April 2027.
          </p>
        </div>

        {/* Caution Banner: Date Unconfirmed */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 max-w-md shadow-sm">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Official Notice:</strong> Exam date for CET 2027 remains unannounced. 
            The 13 April 2027 target is our internal preparation deadline, never a confirmed exam date.
          </span>
        </div>
      </div>

      {/* 5 Preparation Phases Milestone Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        {[
          { phase: "Phase 1", name: "Foundation & Speed", weeks: "Weeks 1–6", active: true },
          { phase: "Phase 2", name: "Core CET Reasoning", weeks: "Weeks 7–12", active: false },
          { phase: "Phase 3", name: "DI & Sectional Sprints", weeks: "Weeks 13–18", active: false },
          { phase: "Phase 4", name: "Full-Length Mocks", weeks: "Weeks 19–22", active: false },
          { phase: "Phase 5", name: "Final Precision", weeks: "Weeks 23–24", active: false },
        ].map((p, idx) => (
          <div 
            key={idx}
            className={`p-3.5 rounded-2xl border transition-all ${
              p.active 
                ? 'bg-ink-900 text-parchment-50 border-ink-800 shadow-soft' 
                : 'bg-parchment-50 text-ink-700 border-parchment-200 opacity-75'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wider ${p.active ? 'text-terracotta-400' : 'text-ink-500'}`}>
              {p.phase}
            </div>
            <div className="font-serif font-bold text-sm mt-0.5 leading-snug">{p.name}</div>
            <div className="text-[11px] opacity-70 mt-1">{p.weeks}</div>
          </div>
        ))}
      </div>

      {/* Week Selector Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-ink-700 uppercase tracking-wider block">
          Navigate Week Curriculum:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {weeks.map((w) => (
            <button
              key={w.weekNumber}
              onClick={() => setSelectedWeekNumber(w.weekNumber)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedWeekNumber === w.weekNumber 
                  ? 'bg-terracotta-500 text-white shadow-soft' 
                  : 'bg-parchment-100 hover:bg-parchment-200 text-ink-800'
              }`}
            >
              Week {w.weekNumber} {w.isCurrentWeek ? "(Current)" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Week Detailed Plan */}
      <div className="bg-parchment-50 border border-parchment-200 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
          <div>
            <div className="text-xs font-bold text-terracotta-600 uppercase tracking-wider">
              {selectedWeek.phaseName}
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink-900 mt-1">
              Week {selectedWeek.weekNumber}: {selectedWeek.theme}
            </h2>
            <div className="text-xs text-ink-500 mt-1 font-mono">
              Date Span: {selectedWeek.dateRange}
            </div>
          </div>

          <button
            onClick={() => onOpenCompanion(`Propose a daily day-by-day timetable for Week ${selectedWeek.weekNumber} focusing on ${selectedWeek.theme}`)}
            className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold flex items-center gap-2 transition-colors shadow-soft"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Day-by-Day Schedule</span>
          </button>
        </div>

        {/* Weekly Focus Topics Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-ink-800 uppercase tracking-wider">
            Target Objectives & Question Quotas
          </h3>

          <div className="space-y-2.5">
            {selectedWeek.focusTopics.map((topicItem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-parchment-200 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTopicCompleted(idx)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      topicItem.completed 
                        ? 'bg-sage-600 border-sage-700 text-white' 
                        : 'border-parchment-400 hover:border-ink-600'
                    }`}
                  >
                    {topicItem.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ink-900">
                        {topicItem.topic}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-parchment-100 text-ink-700">
                        {topicItem.subject}
                      </span>
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      Target quota: <strong>{topicItem.targetQuestions} practice MCQs</strong>
                    </div>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  topicItem.completed 
                    ? 'bg-sage-100 text-sage-800' 
                    : 'bg-parchment-100 text-ink-600'
                }`}>
                  {topicItem.completed ? "Completed" : "In Progress"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor / Student Collaboration Notes */}
        <div className="p-5 rounded-2xl bg-parchment-100 border border-parchment-300 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-ink-900">
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-ink-700" />
              <span>Mentor Guidance & Calibration Notes:</span>
            </span>

            <button
              onClick={() => {
                setMentorNoteDraft(selectedWeek.mentorNotes || '');
                setIsEditingNotes(!isEditingNotes);
              }}
              className="text-xs text-terracotta-600 hover:text-terracotta-700 font-semibold flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingNotes ? "Cancel Edit" : "Edit Guidance Note"}</span>
            </button>
          </div>

          {isEditingNotes ? (
            <div className="space-y-2">
              <textarea
                value={mentorNoteDraft}
                onChange={(e) => setMentorNoteDraft(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-parchment-400 bg-white text-ink-900 focus:outline-none focus:border-terracotta-500"
                rows={3}
              />
              <button
                onClick={handleSaveMentorNotes}
                className="px-4 py-1.5 rounded-lg bg-ink-900 text-white text-xs font-bold"
              >
                Save Note
              </button>
            </div>
          ) : (
            <p className="text-xs text-ink-800 font-sans leading-relaxed">
              {selectedWeek.mentorNotes || "No specific mentor notes for this week yet."}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
