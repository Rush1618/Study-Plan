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
  Plus,
  Cpu,
  Activity,
  Play
} from 'lucide-react';
import { AIMemoryItem } from '../types';
import { StorageService } from '../services/storage';
import { LearningEngine, ModelTrainingResult } from '../services/learningEngine';

export const AIMemoryView: React.FC = () => {
  const [memories, setMemories] = useState<AIMemoryItem[]>(() => StorageService.getAIMemories());
  const [filterType, setFilterType] = useState<'all' | 'observed_fact' | 'ai_hypothesis'>('all');
  const [editingMemory, setEditingMemory] = useState<AIMemoryItem | null>(null);
  const [correctionText, setCorrectionText] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [checkpoint, setCheckpoint] = useState(() => StorageService.getModelCheckpoint());

  // Listen to live background model checkpoint updates
  React.useEffect(() => {
    const handleUpdate = () => {
      setCheckpoint(StorageService.getModelCheckpoint());
      setMemories(StorageService.getAIMemories());
    };
    window.addEventListener('ruvi-model-updated', handleUpdate);
    return () => window.removeEventListener('ruvi-model-updated', handleUpdate);
  }, []);

  // Model Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [currentLoss, setCurrentLoss] = useState<number>(checkpoint.loss);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [trainingResult, setTrainingResult] = useState<ModelTrainingResult | null>(null);

  const handleRunCalibration = async () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setTrainingLogs([`Starting calibration from checkpoint ${checkpoint.version} (P(L0)=${checkpoint.bktParameters.priorKnowledgePL0})...`]);
    try {
      const res = await LearningEngine.trainLearnerModel(10, (epoch, loss, msg) => {
        setCurrentEpoch(epoch);
        setCurrentLoss(loss);
        setTrainingLogs(prev => [...prev, msg]);
      });
      setTrainingResult(res);
      setCheckpoint(StorageService.getModelCheckpoint());
      setMemories(StorageService.getAIMemories());
    } catch (e) {
      console.error(e);
    } finally {
      setIsTraining(false);
    }
  };

  const handleDelete = (id: string) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    StorageService.saveAIMemories(updated);
  };

  const handleStartEdit = (mem: AIMemoryItem) => {
    setEditingMemory(mem);
    setCorrectionText(mem.userCorrection || mem.statement);
  };

  const handleSaveCorrection = () => {
    if (!editingMemory) return;
    const updated = memories.map(m => {
      if (m.id === editingMemory.id) {
        return {
          ...m,
          statement: correctionText,
          userCorrection: correctionText,
          lastUpdated: "Edited by student just now"
        };
      }
      return m;
    });
    setMemories(updated);
    StorageService.saveAIMemories(updated);
    setEditingMemory(null);
  };

  const handleResetHistory = () => {
    setMemories([]);
    StorageService.saveAIMemories([]);
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
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900">
            AI Memory Transparency Center
          </h1>
          <p className="text-sm text-ink-700 mt-1">
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
      <div className="p-5 sm:p-6 rounded-2xl bg-ink-900 text-parchment-100 border border-ink-800 shadow-elevated space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-terracotta-300">
          <ShieldCheck className="w-4 h-4 text-terracotta-400" />
          <span>Our Ethical Memory Guarantee</span>
        </div>
        <p className="text-xs sm:text-sm text-parchment-200/90 leading-relaxed font-sans max-w-3xl">
          Her Study Space does not store opaque black-box profiles. We distinguish strictly between 
          <strong className="text-white"> Observed Facts</strong> (verifiable scores, timestamps, and answer clicks) and 
          <strong className="text-terracotta-300"> AI Hypotheses</strong> (provisional theories about conceptual gaps). You have full authority to edit or revoke any memory at any time.
        </p>
      </div>

      {/* BKT Learner Model Calibration Lab Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-parchment-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-parchment-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-base sm:text-lg font-bold text-ink-900 leading-tight">
                  Learner Model Engine (BKT + IRT)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Version {checkpoint.version}</span>
                </span>
              </div>
              <p className="text-xs text-ink-600 mt-0.5">
                Continuous Checkpoint • Never resets to 0 • Auto-calibrating in background from every answer attempt.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <span className="text-[11px] font-mono text-ink-600 bg-parchment-100 px-2 py-1 rounded-lg border border-parchment-200">
              Runs: {checkpoint.totalTrainingRuns} • Loss: {checkpoint.loss.toFixed(4)}
            </span>
            <button
              onClick={handleRunCalibration}
              disabled={isTraining}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-soft"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isTraining ? 'animate-pulse' : ''}`} />
              <span>{isTraining ? `Calibrating (Epoch ${currentEpoch}/10)...` : "Calibrate Now (+10 Epochs)"}</span>
            </button>
          </div>
        </div>

        {/* Hyperparameter Diagnostics Readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-parchment-50 border border-parchment-200">
            <span className="text-[11px] text-ink-600 block">Prior Knowledge P(L₀)</span>
            <span className="font-mono font-bold text-sm text-ink-900">
              {checkpoint.bktParameters.priorKnowledgePL0.toFixed(3)}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Continuously refined</span>
          </div>

          <div className="p-3 rounded-2xl bg-parchment-50 border border-parchment-200">
            <span className="text-[11px] text-ink-600 block">Transition Rate P(T)</span>
            <span className="font-mono font-bold text-sm text-ink-900">
              {checkpoint.bktParameters.transitionRatePT.toFixed(3)}
            </span>
            <span className="text-[10px] text-ink-500 block mt-0.5">Per focused session</span>
          </div>

          <div className="p-3 rounded-2xl bg-parchment-50 border border-parchment-200">
            <span className="text-[11px] text-ink-600 block">Slip Penalty P(S)</span>
            <span className="font-mono font-bold text-sm text-terracotta-700">
              {checkpoint.bktParameters.slipRatePS.toFixed(3)}
            </span>
            <span className="text-[10px] text-terracotta-600 block mt-0.5">&lt;25s rush errors</span>
          </div>

          <div className="p-3 rounded-2xl bg-parchment-50 border border-parchment-200">
            <span className="text-[11px] text-ink-600 block">Guess Probability P(G)</span>
            <span className="font-mono font-bold text-sm text-ink-900">
              {checkpoint.bktParameters.guessRatePG.toFixed(3)}
            </span>
            <span className="text-[10px] text-ink-500 block mt-0.5">CET 5-choice option baseline</span>
          </div>
        </div>

        {/* Training Animation Console */}
        {isTraining && (
          <div className="p-4 rounded-2xl bg-ink-900 text-emerald-400 font-mono text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-parchment-300">Epoch {currentEpoch} / 10 Optimization</span>
              <span className="text-terracotta-300 font-bold">Cross-Entropy Loss: {currentLoss.toFixed(4)}</span>
            </div>
            <div className="w-full bg-ink-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-150"
                style={{ width: `${(currentEpoch / 10) * 100}%` }}
              />
            </div>
            <div className="text-[11px] opacity-90 leading-tight">
              {trainingLogs[trainingLogs.length - 1] || 'Processing optimization step...'}
            </div>
          </div>
        )}

        {trainingResult && !isTraining && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Calibration complete! Loss converged from {trainingResult.initialLoss} to {trainingResult.finalLoss}. 
              Mastery probabilities updated across all syllabus topics.
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
            filterType === 'all' 
              ? 'bg-ink-900 text-parchment-50 shadow-sm' 
              : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200'
          }`}
        >
          All Memories ({memories.length})
        </button>
        <button
          onClick={() => setFilterType('observed_fact')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
            filterType === 'observed_fact' 
              ? 'bg-ink-900 text-parchment-50 shadow-sm' 
              : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200'
          }`}
        >
          Observed Facts Only
        </button>
        <button
          onClick={() => setFilterType('ai_hypothesis')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
            filterType === 'ai_hypothesis' 
              ? 'bg-ink-900 text-parchment-50 shadow-sm' 
              : 'bg-parchment-100 text-ink-700 hover:bg-parchment-200'
          }`}
        >
          AI Hypotheses (Provisional)
        </button>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filtered.map((item) => {
          const isFact = item.type === 'observed_fact';

          return (
            <div
              key={item.id}
              className={`p-5 sm:p-6 rounded-2xl border transition-colors flex flex-col justify-between ${
                isFact 
                  ? 'bg-white border-parchment-200 shadow-soft' 
                  : 'bg-parchment-50 border-terracotta-200 shadow-soft'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium ${
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
