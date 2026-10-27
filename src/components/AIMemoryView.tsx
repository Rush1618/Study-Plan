import React, { useState } from 'react';
import { 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { AIMemoryItem } from '../types';
import { sampleAIMemories } from '../data/mockData';

export const AIMemoryView: React.FC = () => {
  const [memories, setMemories] = useState<AIMemoryItem[]>(sampleAIMemories);
  const [filterType, setFilterType] = useState<'all' | 'observed_fact' | 'ai_hypothesis'>('all');
  const [editingMemory, setEditingMemory] = useState<AIMemoryItem | null>(null);
  const [correctionText, setCorrectionText] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleDelete = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleStartEdit = (mem: AIMemoryItem) => {
    setEditingMemory(mem);
    setCorrectionText(mem.userCorrection || mem.statement);
  };

  const handleSaveCorrection = () => {
    if (!editingMemory) return;
    setMemories(prev => prev.map(m => {
      if (m.id === editingMemory.id) {
        return {
          ...m,
          statement: correctionText,
          userCorrection: correctionText,
          lastUpdated: "Edited by student just now"
        };
      }
      return m;
    }));
    setEditingMemory(null);
  };

  const handleResetHistory = () => {
    setMemories([]);
    setShowResetConfirm(false);
  };

  const filtered = memories.filter(m => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-600 mb-1">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Open Cognitive Ledger</span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
            AI Memory Transparency Center
          </h1>
          <p className="text-sm text-ink-700/90 mt-1">
            Review, audit, correct, or delete what your Study Companion has recorded about your study patterns.
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Learning History</span>
        </button>
      </div>

      {/* Transparency Architecture Principle Card */}
      <div className="p-6 rounded-3xl bg-ink-900 text-parchment-100 border border-ink-800 shadow-elevated space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-terracotta-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Our Ethical Memory Guarantee</span>
        </div>
        <p className="text-xs sm:text-sm text-parchment-200/90 leading-relaxed font-sans max-w-3xl">
          Her Study Space does not store opaque black-box profiles. We distinguish strictly between 
          <strong className="text-white"> Observed Facts</strong> (verifiable scores, timestamps, and answer clicks) and 
          <strong className="text-terracotta-300"> AI Hypotheses</strong> (provisional theories about conceptual gaps). You have full authority to edit or revoke any memory at any time.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'all' 
              ? 'bg-ink-900 text-parchment-50 shadow-sm' 
              : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200'
          }`}
        >
          All Recorded Memories ({memories.length})
        </button>
        <button
          onClick={() => setFilterType('observed_fact')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'observed_fact' 
              ? 'bg-ink-900 text-parchment-50 shadow-sm' 
              : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200'
          }`}
        >
          Observed Facts Only
        </button>
        <button
          onClick={() => setFilterType('ai_hypothesis')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'ai_hypothesis' 
              ? 'bg-ink-900 text-parchment-50 shadow-sm' 
              : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200'
          }`}
        >
          AI Hypotheses (Provisional)
        </button>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => {
          const isFact = item.type === 'observed_fact';

          return (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                isFact 
                  ? 'bg-white border-parchment-200 shadow-soft' 
                  : 'bg-parchment-50 border-terracotta-200 shadow-soft'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isFact 
                      ? 'bg-sage-100 text-sage-800 border border-sage-200' 
                      : 'bg-terracotta-100 text-terracotta-800 border border-terracotta-200'
                  }`}>
                    {isFact ? "Observed Fact" : "AI Hypothesis"}
                  </span>

                  <span className="text-[11px] font-mono text-ink-500">
                    Confidence: {item.confidenceScore}%
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-ink-900">
                  {item.title}
                </h3>

                <p className="text-xs text-ink-800 leading-relaxed font-sans">
                  {item.statement}
                </p>

                {/* Evidence source pill */}
                <div className="p-3 rounded-xl bg-parchment-100 border border-parchment-200 text-[11px] space-y-1">
                  <div className="font-semibold text-ink-800 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-terracotta-600" />
                    <span>Evidence Basis:</span>
                  </div>
                  <div className="text-ink-600 font-mono">
                    {item.evidenceSource}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-parchment-200 flex items-center justify-between text-xs text-ink-500">
                <span className="text-[10px]">{item.lastUpdated}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 rounded-lg text-ink-600 hover:text-ink-900 hover:bg-parchment-100 transition-colors"
                    title="Edit or correct this memory"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Delete this record permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Memory Modal */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-parchment-300 shadow-elevated space-y-4">
            <h3 className="font-serif text-xl font-bold text-ink-900">
              Correct AI Memory
            </h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              If the companion deduced something inaccurate about your comprehension or schedule, write your direct correction below.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-700 uppercase">
                Corrected Statement:
              </label>
              <textarea
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-parchment-300 bg-parchment-50 text-ink-900 focus:outline-none focus:border-terracotta-500"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingMemory(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-700 hover:bg-parchment-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrection}
                className="px-5 py-2 rounded-xl bg-ink-900 hover:bg-terracotta-500 text-white text-xs font-bold shadow-soft"
              >
                Save Correction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-rose-300 shadow-elevated space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink-900">
              Reset Entire Learning History?
            </h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              This will clear all recorded hypotheses, question accuracy metrics, and mistake patterns. Your uploaded documents will remain safe in your library.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-700 hover:bg-parchment-100"
              >
                Keep Records
              </button>
              <button
                onClick={handleResetHistory}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-soft"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
