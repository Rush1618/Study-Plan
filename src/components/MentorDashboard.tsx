import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Sliders,
  Calendar,
  Sparkles
} from 'lucide-react';
import { TopicMastery, MistakeRecord, UserProfile } from '../types';
import { StorageService } from '../services/storage';

interface MentorDashboardProps {
  profile: UserProfile;
  topicMasteries: TopicMastery[];
  mistakes: MistakeRecord[];
  onOpenCompanion: (prompt: string) => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({
  profile,
  topicMasteries,
  mistakes,
  onOpenCompanion
}) => {
  const [assignedTopic, setAssignedTopic] = useState<string>('Percentages & Base Values');
  const [targetQuestions, setTargetQuestions] = useState<number>(20);
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);

  const handleAssignTask = () => {
    // Add assigned task to current week roadmap
    const currentRoadmap = StorageService.getRoadmap();
    const updated = currentRoadmap.map(week => {
      if (week.isCurrentWeek || week.weekNumber === 1) {
        return {
          ...week,
          mentorNotes: `Assigned: ${targetQuestions} MCQs in ${assignedTopic}. Priority focus requested by Prof. Sharma.`,
          focusTopics: [
            ...week.focusTopics,
            {
              subject: 'Quantitative Aptitude' as const,
              topic: assignedTopic,
              targetQuestions: targetQuestions,
              completed: false
            }
          ]
        };
      }
      return week;
    });
    StorageService.saveRoadmap(updated);

    setAssignmentNotice(`Assigned: ${targetQuestions} practice MCQs in "${assignedTopic}" sent to ${profile.name}'s daily itinerary & roadmap!`);
    setTimeout(() => setAssignmentNotice(null), 4500);
  };

  const exportSummaryReport = () => {
    const subjects = ['Logical Reasoning', 'Abstract Reasoning', 'Quantitative Aptitude', 'Verbal Ability'] as const;
    const sectionalLines = subjects.map(subj => {
      const items = topicMasteries.filter(t => t.subject === subj);
      const avgAcc = items.length ? Math.round(items.reduce((acc, i) => acc + i.accuracyPercent, 0) / items.length) : 0;
      const avgTime = items.length ? Math.round(items.reduce((acc, i) => acc + i.averageTimePerQSeconds, 0) / items.length) : 60;
      const status = avgAcc >= 80 ? 'Mastered' : avgAcc >= 60 ? 'Practicing' : 'Priority Revision';
      return `- ${subj}: ${avgAcc}% (Speed: ${avgTime}s/Q) - ${status}`;
    }).join('\n');

    const topErrors = mistakes.slice(0, 5).map(m => 
      `- ${m.mistakeCategory} in ${m.topic} (${m.repeatedCount} occurrences)`
    ).join('\n') || '- No critical recurring errors detected yet.';

    const reportData = `
HER STUDY SPACE - MENTOR DIAGNOSTIC AUDIT
Student: ${profile.name}
Target: ${profile.targetExam} (Exam Date Status: ${profile.examDateStatus})
Start Date: ${profile.startDate} | Target Deadline: ${profile.targetEndDate}
Export Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

1. Sectional Mastery:
${sectionalLines}

2. Top Recurring Errors:
${topErrors}

3. Mentor Guidance:
Supervision assigned to Prof. V. Sharma. Weekly calibration adjusts daily question difficulty based on base value and orientation inversion error trends.
    `.trim();

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name}_MAH_CET_Audit_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Mentor Oversight: {profile.name}
          </h1>
          <p className="text-xs sm:text-sm text-ink-700/90 mt-1">
            Real-time audit of {profile.name}'s cognitive history, AI recommendation rationale, and syllabus progress.
          </p>
        </div>

        <button
          onClick={exportSummaryReport}
          className="px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-parchment-50 text-xs font-semibold flex items-center gap-2 transition-colors shadow-soft"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Diagnostic Report</span>
        </button>
      </div>

      {assignmentNotice && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-xs text-sage-900 flex items-center gap-2 animate-fadeIn font-medium">
          <CheckCircle2 className="w-4 h-4 text-sage-600" />
          <span>{assignmentNotice}</span>
        </div>
      )}

      {/* Grid: Mentor Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: AI Evidence Audit & Topic Diagnostics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Evidence Audit Box */}
          <div className="p-6 rounded-3xl bg-parchment-50 border border-parchment-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <span className="editorial-badge text-terracotta-600">
                AI Recommendation Evidence Inspection
              </span>
              <span className="text-xs text-ink-500 font-mono">Logged 27 Oct 2026</span>
            </div>

            <h3 className="font-serif text-xl font-bold text-ink-900">
              Why the AI is recommending "Percentages & Base Values"
            </h3>

            <div className="p-4 rounded-2xl bg-white border border-parchment-200 text-xs space-y-2 text-ink-800">
              <div className="font-bold text-ink-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Underlying Logged Evidence:</span>
              </div>
              <p className="leading-relaxed">
                Across practice sessions #12 and #14, {profile.name} attempted 10 percentage change items and missed 6. In 3 consecutive instances, she selected symmetric percentage reduction (e.g. 25% decrease after 25% increase).
              </p>
              <div className="pt-2 text-[11px] text-ink-500 font-mono">
                Citing Document: <strong>MAH-CET-Speed-Math-Formulas.pdf</strong> (Page 42, §3.4).
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => onOpenCompanion(`Review mentor perspective: Does ${profile.name}'s percentage base confusion require conceptual derivation or speed drills?`)}
                className="px-4 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-ink-900 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-parchment-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Interrogate AI Rationale with Companion</span>
              </button>
            </div>
          </div>

          {/* Weak Areas and Recurring Mistakes */}
          <div className="p-6 rounded-3xl bg-parchment-50 border border-parchment-200 shadow-soft space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink-900">
              Active Vulnerabilities Requiring Mentor Calibration
            </h3>

            <div className="space-y-3">
              {mistakes.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-white border border-parchment-200 text-xs space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink-900">{m.topic} • {m.subtopic}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      {m.mistakeCategory}
                    </span>
                  </div>
                  <p className="text-ink-600 italic">"{m.questionExcerpt.slice(0, 90)}..."</p>
                  <div className="text-[11px] text-ink-700 bg-parchment-100 p-2.5 rounded-xl">
                    <strong>Misunderstanding:</strong> {m.misunderstandingIdentified}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Mentor Assignment & Schedule Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Assign Custom Practice Set Card */}
          <div className="p-6 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink-900">
              Assign Topic or Practice Set
            </h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              Directly inject a customized exercise set into {profile.name}'s dashboard for her next focus block.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink-800 block mb-1">Target Topic:</label>
                <select
                  value={assignedTopic}
                  onChange={(e) => setAssignedTopic(e.target.value)}
                  className="w-full p-2.5 bg-parchment-50 border border-parchment-300 rounded-xl text-ink-900 focus:outline-none focus:border-terracotta-500 font-medium"
                >
                  <option value="Percentages & Base Values">Quant: Percentages & Base Values</option>
                  <option value="Circular Seating Puzzles">LR: Circular Seating (In/Out Facing)</option>
                  <option value="Syllogisms (Only A Few)">LR: Syllogisms (Only A Few)</option>
                  <option value="Visual Series & Rotation">Abstract: Rotational Series</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink-800 block mb-1">Number of Questions:</label>
                <div className="flex items-center gap-3">
                  {[10, 20, 30].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setTargetQuestions(cnt)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs border ${
                        targetQuestions === cnt 
                          ? 'bg-ink-900 text-white border-ink-900' 
                          : 'bg-parchment-50 text-ink-700 border-parchment-300'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAssignTask}
                className="w-full mt-4 py-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-soft transition-colors flex items-center justify-center gap-2"
              >
                <span>Dispatch Assignment to Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Schedule Constraints & Target Pace */}
          <div className="p-6 rounded-3xl bg-parchment-50 border border-parchment-200 shadow-soft space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-ink-900">
              Target Pace & Rest Constraints
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between py-2 border-b border-parchment-200">
                <span className="text-ink-600">Daily Study Target</span>
                <span className="font-bold text-ink-900">{profile.dailyGoalHours} hours</span>
              </div>
              <div className="flex justify-between py-2 border-b border-parchment-200">
                <span className="text-ink-600">Rest Day Schedule</span>
                <span className="font-bold text-ink-900">Sundays (Gentle review only)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-parchment-200">
                <span className="text-ink-600">Roadmap Duration</span>
                <span className="font-bold text-ink-900">24 Weeks (28 Oct → 13 Apr)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-ink-600">Negative Marking Rule</span>
                <span className="font-bold text-sage-700">None (Full attempt strategy)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
