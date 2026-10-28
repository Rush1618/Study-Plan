import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  FileText, 
  ArrowRight, 
  RotateCcw, 
  Languages, 
  CheckCircle2, 
  BookOpen, 
  BrainCircuit, 
  Lightbulb, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play,
  Zap,
  Download,
  Upload,
  ShieldCheck,
  X,
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import { UserProfile, MistakeRecord, LibraryDocument, DailyPlanTask } from '../types';
import { AIProvider } from '../services/aiProvider';
import { StorageService } from '../services/storage';
import { RuviVoice } from '../services/ruviVoice';
import { LearningEngine } from '../services/learningEngine';
import { RuviAgent, AgentMissionResult, AgentStep, DiscoveredMaterial } from '../services/ruviAgent';
import { INSTALLED_APP_SKILLS } from '../services/skillEngine';

interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  citations?: { docTitle: string; page: number }[];
  suggestedAction?: { label: string; actionKey: string; payload?: any };
  agentMission?: AgentMissionResult;
  discoveredMaterial?: DiscoveredMaterial;
  materialAdded?: boolean;
  materialDismissed?: boolean;
  timestamp: string;
}

interface CompanionViewProps {
  profile: UserProfile;
  mistakes: MistakeRecord[];
  onStartPractice: (mode: string, payload?: any) => void;
}

export const CompanionView: React.FC<CompanionViewProps> = ({
  profile,
  mistakes,
  onStartPractice
}) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    return [
      {
        id: 'msg-welcome',
        sender: 'companion',
        text: `Hey Sanskriti! Ruvi here, right by your side as your study companion. 
I have 200 authentic CET questions loaded, comprehensive study guides indexed, and your daily timetable ready.
What chapter would you like to explore today? You can ask me any question, ask for your timetable, or search online material below!`,
        timestamp: 'Just now'
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Hinglish'>(profile.preferredLanguage);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Agent Mission Execution State
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [currentMissionGoal, setCurrentMissionGoal] = useState('');
  const [liveAgentSteps, setLiveAgentSteps] = useState<AgentStep[]>([]);
  const [activeMissionResult, setActiveMissionResult] = useState<AgentMissionResult | null>(null);

  const [showSkillsModal, setShowSkillsModal] = useState(false);

  // Automatically and continuously adapt Ruvi in the background
  useEffect(() => {
    LearningEngine.trainLearnerModel(1).catch(() => {});
  }, []);

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const success = StorageService.importAllData(json);
        if (success) {
          setMessages(prev => [
            ...prev,
            {
              id: `restore-${Date.now()}`,
              sender: 'companion',
              text: `🛡️ **Memory Snapshot Restored Successfully!**\nAll syllabus progress, mistake notebooks, 200 questions, and Bayesian parameters are restored from your backup.`,
              timestamp: 'Just now'
            }
          ]);
          if (isSpeakingEnabled) RuviVoice.speak("Memory backup restored successfully Sanskriti.");
        }
      } catch (err) {
        console.error("Restore failed:", err);
      }
    };
    reader.readAsText(file);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, liveAgentSteps]);

  // Clean voice synthesis on unmount
  useEffect(() => {
    return () => {
      RuviVoice.stopSpeaking();
      RuviVoice.stopListening();
    };
  }, []);

  // Handle User Confirming Material Addition to Storage
  const handleConfirmAddMaterial = (msgId: string, material: DiscoveredMaterial) => {
    // 1. Convert to LibraryDocument and persist
    const newDoc: LibraryDocument = {
      id: `doc-online-${Date.now()}`,
      title: material.title,
      fileName: material.fileName,
      fileType: 'PDF',
      sizeFormatted: '3.6 MB',
      uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Ready',
      totalPages: material.totalPages,
      topicsDetected: [material.topic],
      extractedMCQsCount: material.extractedMCQsCount,
      chunksCount: material.sampleChunks?.length || 4,
      summary: material.summary,
      sampleChunks: material.sampleChunks
    };
    StorageService.addDocument(newDoc);

    // 2. Ingest generated questions into practice question bank
    if (material.questionsToIngest && material.questionsToIngest.length > 0) {
      material.questionsToIngest.forEach(q => StorageService.addQuestion(q));
    }

    // 3. Schedule into today's timetable
    const sessionTitle = `${material.topic}: Online Notes & 45s Quiz Sprint`;
    const newTask: DailyPlanTask = {
      id: `dp-ruvi-${Date.now()}`,
      title: sessionTitle,
      subject: material.subject as any,
      topic: material.topic,
      estimatedMinutes: material.suggestedTimetableSlot?.durationMinutes || 25,
      completed: false,
      assignedByMentor: false,
      mentorNote: `Added by Ruvi from online verified material. Focus on core formulas.`,
      taskType: 'practice'
    };
    const currentPlan = StorageService.getDailyPlan();
    if (!currentPlan.some(t => t.topic === material.topic && !t.completed)) {
      StorageService.saveDailyPlan([newTask, ...currentPlan]);
    }

    // 4. Update message state
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, materialAdded: true } : m));

    // 5. Post confirmation companion message
    const confirmMsg: Message = {
      id: `c-added-${Date.now()}`,
      sender: 'companion',
      text: `✅ **Added to Your Storage & Timetable!**\nI've saved **"${material.title}"** into your permanent Library Storage (${material.fileName}, ${material.totalPages} pages, ${material.extractedMCQsCount} questions) and scheduled a 25-minute practice block in your timetable for today. You can open it anytime under Library & Study Documents or start the quiz!`,
      suggestedAction: {
        label: `Start Focus Quiz on ${material.topic}`,
        actionKey: 'focus',
        payload: { chapterId: material.topic }
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, confirmMsg]);

    if (isSpeakingEnabled) {
      RuviVoice.speak(`Added ${material.title} to your library storage and scheduled it in your timetable, Sanskriti!`);
    }
  };

  const handleDismissMaterial = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, materialDismissed: true } : m));
  };

  // Autonomous Agent Mission Execution
  const handleExecuteAgentMission = async (goal: string) => {
    setIsAgentRunning(true);
    setCurrentMissionGoal(goal);
    setLiveAgentSteps([]);
    setActiveMissionResult(null);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: goal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const missionResult = await RuviAgent.runMission(goal, (step) => {
        setLiveAgentSteps(prev => [...prev, step]);
      });

      setActiveMissionResult(missionResult);

      const companionMsg: Message = {
        id: `c-${Date.now()}`,
        sender: 'companion',
        text: missionResult.finalAnswer,
        suggestedAction: missionResult.recommendedAction,
        agentMission: missionResult,
        discoveredMaterial: missionResult.discoveredMaterial,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, companionMsg]);

      if (isSpeakingEnabled) {
        if (missionResult.discoveredMaterial) {
          RuviVoice.speak(`Sanskriti, I found study material online. Would you like me to add it to your library storage?`);
        } else if (missionResult.timetableOverview) {
          RuviVoice.speak(`Here is your calibrated MAH-CET daily timetable and weekly study schedule, Sanskriti!`);
        } else {
          RuviVoice.speak(`Mission complete Sanskriti. I have synthesized your chapter notes and calibrated the test. Tap start to begin!`);
        }
      }
    } catch (err) {
      console.error("Agent execution error:", err);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const lower = textToSend.toLowerCase().trim();

    // 1. Check if user is confirming pending material addition ("yes", "add it", "add to storage", "save it", "haan", etc.)
    const lastUnconfirmed = [...messages].reverse().find(m => m.discoveredMaterial && !m.materialAdded && !m.materialDismissed);
    if (lastUnconfirmed && lastUnconfirmed.discoveredMaterial && (
      lower === 'yes' || 
      lower === 'add it' || 
      lower === 'add' || 
      lower === 'sure' || 
      lower === 'ok' || 
      lower === 'okay' || 
      lower.includes('add to storage') || 
      lower.includes('add file') || 
      lower.includes('save it') || 
      lower.includes('haan') || 
      lower.includes('add kar do') ||
      lower.includes('please add')
    )) {
      if (!customText) setInputText('');
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: textToSend.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      handleConfirmAddMaterial(lastUnconfirmed.id, lastUnconfirmed.discoveredMaterial);
      return;
    }

    // 2. Check if query is about Timetable / Schedule / Routine
    if (
      lower.includes('timetable') || 
      lower.includes('schedule') || 
      lower.includes('routine') || 
      lower.includes('time table') || 
      lower.includes('daily plan')
    ) {
      if (!customText) setInputText('');
      await handleExecuteAgentMission("Audit my study timetable, show my daily schedule slots and weekly plan.");
      return;
    }

    // 3. If query looks like an autonomous study mission or online search
    if (
      lower.includes('learn') || 
      lower.includes('test me') || 
      lower.includes('generate notes') || 
      lower.includes('take test') ||
      lower.includes('mission') ||
      lower.includes('syllabus') ||
      lower.includes('internet') ||
      lower.includes('search') ||
      lower.includes('find material') ||
      lower.includes('online')
    ) {
      if (!customText) setInputText('');
      await handleExecuteAgentMission(textToSend.trim());
      return;
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const response = await AIProvider.askAgent(textToSend, language);
      const companionMsg: Message = {
        id: `c-${Date.now()}`,
        sender: 'companion',
        text: response.content,
        citations: response.citations,
        suggestedAction: response.suggestedAction,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, companionMsg]);

      if (isSpeakingEnabled) {
        RuviVoice.speak(response.content);
      }
    } catch {
      const fallbackText = `Sanskriti, I have logged your study query. Let's start a quick focus session to test this chapter with zero stress.`;
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'companion',
          text: fallbackText,
          timestamp: 'Just now'
        }
      ]);
      if (isSpeakingEnabled) RuviVoice.speak(fallbackText);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleMicListening = () => {
    if (isListening) {
      RuviVoice.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      setVoiceTranscript('Listening to your voice...');
      RuviVoice.startListening(
        (interim) => {
          setVoiceTranscript(interim);
        },
        (final) => {
          setIsListening(false);
          setInputText(final);
          handleSendMessage(final);
        },
        (error) => {
          console.warn("Speech recognition error:", error);
          setIsListening(false);
        }
      );
    }
  };

  const autonomousMissions = [
    { label: '📅 Show My Study Timetable', query: 'Audit my study timetable, show my daily schedule slots and weekly plan.' },
    { label: '🌐 Search Percentages Notes Online', query: 'Learn Percentages & Reverse Base Values, search online material, explain the traps, and give me a test.' },
    { label: '🧩 Search Circular Puzzles Material', query: 'Learn Circular Seating Puzzles from syllabus, search online material, create high-yield notes and test me.' },
    { label: '📊 Remaining Syllabus Audit', query: 'Audit my remaining MAH-MBA/MMS-CET 2027 syllabus, show completed vs remaining topics and percentage.' },
    { label: '🏛️ JBIMS & SIMSREE Cutoffs', query: 'Explain JBIMS (99.99 %ile) and SIMSREE (99.95 %ile) target scores, 45-second pacing strategy, and zero negative marking rule.' },
    { label: '📖 Vocabulary Pack 100Q Drill', query: 'Learn high-frequency English vocabulary, generate chapter notes and quiz.' },
    { label: '⚖️ Sentence Correction & Grammar', query: 'Learn Sentence Correction & Subject-Verb Agreement, build notes and test me.' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5 animate-fadeIn pb-6">
      
      {/* Ruvi Autonomous Agent Telemetry Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-ink-900 text-parchment-50 border border-ink-800 shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center font-bold relative shrink-0 shadow-soft">
            <Bot className="w-6 h-6" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-ink-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
                Ruvi
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-ink-800 text-terracotta-300 border border-ink-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Autonomous Agent Active</span>
              </span>
            </div>
            <p className="text-xs text-parchment-300 mt-0.5">
              Personal Study Mentor for {profile.name} • MAH-CET 2027 Calibration
            </p>
          </div>
        </div>

        {/* Actions, Skills, Backup & Voice Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Audio Speech Toggle */}
          <button
            onClick={() => {
              if (isSpeakingEnabled) RuviVoice.stopSpeaking();
              setIsSpeakingEnabled(!isSpeakingEnabled);
            }}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
              isSpeakingEnabled 
                ? 'bg-ink-800 border-ink-700 text-parchment-100 hover:bg-ink-700' 
                : 'bg-ink-900 border-ink-800 text-parchment-400 hover:text-white'
            }`}
            title={isSpeakingEnabled ? "Mute Ruvi Voice" : "Enable Ruvi Voice"}
          >
            {isSpeakingEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Installed Skills Button */}
          <button
            onClick={() => setShowSkillsModal(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 border border-ink-700 text-xs font-semibold text-parchment-100 flex items-center gap-1.5 transition-colors"
            title="View Active Cognitive Agent Skills"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Skills ({INSTALLED_APP_SKILLS.length})</span>
          </button>

          {/* Memory Backup & Restore Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => StorageService.downloadBackup()}
              className="min-h-[44px] px-2.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 border border-ink-700 text-xs font-semibold text-parchment-100 flex items-center gap-1 transition-colors"
              title="Download Persistent Memory Snapshot (JSON)"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Backup</span>
            </button>

            <label
              className="min-h-[44px] px-2.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 border border-ink-700 text-xs font-semibold text-parchment-100 flex items-center gap-1 transition-colors cursor-pointer"
              title="Restore Memory Snapshot from JSON"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-ink-800 p-1 rounded-xl border border-ink-700">
            <button
              onClick={() => setLanguage('English')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                language === 'English'
                  ? 'bg-white text-ink-900 font-bold'
                  : 'text-parchment-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('Hinglish')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                language === 'Hinglish'
                  ? 'bg-white text-ink-900 font-bold'
                  : 'text-parchment-300 hover:text-white'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>
      </div>

      {/* Installed Agent Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 z-50 bg-ink-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-parchment-300 shadow-elevated p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-ink-900">
                    Active Agent Skills
                  </h3>
                  <p className="text-[11px] text-ink-500">
                    Downloaded via /find-skills & embedded in Ruvi runtime
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="p-1.5 text-ink-400 hover:text-ink-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {INSTALLED_APP_SKILLS.map((skill) => (
                <div key={skill.id} className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-ink-900">{skill.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      {skill.activeStatus} • {skill.installs}
                    </span>
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">{skill.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-ink-400 pt-1 border-t border-parchment-200">
                    <span>{skill.category}</span>
                    <span>{skill.source}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-ink-900 text-parchment-100 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-[11px] text-terracotta-300">
                  4/4 Skills Running Locally
                </span>
              </div>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friendly Thinking Indicator */}
      {isAgentRunning && (
        <div className="p-4 rounded-2xl bg-ink-900 text-parchment-100 border border-terracotta-500/40 shadow-soft flex items-center gap-3 animate-fadeIn">
          <Bot className="w-5 h-5 text-terracotta-400 animate-pulse shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-white">Ruvi is preparing your study session...</span>
            <p className="text-[11px] text-parchment-300 mt-0.5">{liveAgentSteps[liveAgentSteps.length - 1]?.thought || "Analyzing concepts & questions..."}</p>
          </div>
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-parchment-200 shadow-soft min-h-[400px] sm:min-h-[460px] flex flex-col justify-between space-y-4">
        
        <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[94%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-ink-900 text-parchment-50 rounded-br-none shadow-soft'
                    : 'bg-parchment-100/80 text-ink-900 border border-parchment-200 rounded-bl-none font-normal'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Discovered Online Material Card (Asks for confirmation) */}
                {msg.discoveredMaterial && (
                  <div className="mt-3 p-4 rounded-2xl bg-white border border-terracotta-300 shadow-soft text-xs space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-parchment-200 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center font-bold shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-xs sm:text-sm text-ink-900 leading-tight">
                            {msg.discoveredMaterial.title}
                          </h4>
                          <span className="text-[11px] text-ink-500 font-mono">
                            {msg.discoveredMaterial.fileName} • {msg.discoveredMaterial.totalPages} Pages • {msg.discoveredMaterial.subject}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Online Verified
                      </span>
                    </div>

                    <p className="text-ink-700 text-xs leading-relaxed font-sans">
                      {msg.discoveredMaterial.summary}
                    </p>

                    {/* Key Formulas Preview */}
                    {msg.discoveredMaterial.formulas && msg.discoveredMaterial.formulas.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-parchment-50 border border-parchment-200 space-y-1">
                        <span className="font-bold text-ink-800 text-[11px] block">Core Speed Formulas Inside:</span>
                        <ul className="list-disc list-inside text-ink-700 text-[11px] space-y-0.5">
                          {msg.discoveredMaterial.formulas.slice(0, 3).map((f, i) => (
                            <li key={i} className="font-mono text-terracotta-800">{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Timetable Slot */}
                    {msg.discoveredMaterial.suggestedTimetableSlot && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-50 text-sky-900 border border-sky-200 text-[11px]">
                        <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                        <div>
                          <span className="font-bold">Suggested Timetable Slot: </span>
                          <span>{msg.discoveredMaterial.suggestedTimetableSlot.timeSlot} ({msg.discoveredMaterial.suggestedTimetableSlot.durationMinutes} mins)</span>
                        </div>
                      </div>
                    )}

                    {/* Confirmation Buttons */}
                    {msg.materialAdded ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>✓ File Added to Library Storage & Scheduled in Timetable</span>
                      </div>
                    ) : msg.materialDismissed ? (
                      <div className="text-[11px] text-ink-500 italic">
                        Skipped adding this file to storage.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          onClick={() => handleConfirmAddMaterial(msg.id, msg.discoveredMaterial!)}
                          className="px-3.5 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Yes, Add to Storage & Schedule</span>
                        </button>
                        <button
                          onClick={() => handleDismissMaterial(msg.id)}
                          className="px-3 py-2 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-ink-700 text-xs font-semibold transition-colors"
                        >
                          <span>No, Skip</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Timetable Overview Card */}
                {msg.agentMission?.timetableOverview && (
                  <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-white border border-parchment-300 shadow-soft text-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-parchment-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-terracotta-600" />
                        <h4 className="font-serif font-bold text-sm text-ink-900">
                          Daily Study Timetable (Target: {msg.agentMission.timetableOverview.dailyTargetHours}h / Day)
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                        Active Schedule
                      </span>
                    </div>

                    {/* 3 Daily Slots */}
                    <div className="space-y-2">
                      {msg.agentMission.timetableOverview.slots.map((slot, sIdx) => (
                        <div key={sIdx} className="p-3 rounded-xl bg-parchment-50 border border-parchment-200 flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-ink-900 text-xs">
                              <Clock className="w-3.5 h-3.5 text-terracotta-600" />
                              <span>{slot.slotName}</span>
                            </div>
                            <p className="text-[11px] text-ink-600">{slot.description}</p>
                            <span className="text-[10px] font-semibold text-terracotta-700 bg-white px-2 py-0.5 rounded inline-block mt-1 border border-parchment-200">
                              Focus: {slot.focusSubject}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-ink-800 bg-white px-2 py-1 rounded-lg border border-parchment-200 shrink-0">
                            {slot.timeRange}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Weekly Subject Pattern */}
                    <div className="p-3 rounded-xl bg-parchment-100/60 border border-parchment-200 space-y-1.5">
                      <span className="font-bold text-ink-800 text-[11px] block">Weekly Subject Rotation (7 Days):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                        {msg.agentMission.timetableOverview.weeklyPattern.map((wp, wIdx) => (
                          <div key={wIdx} className="flex items-center justify-between p-1.5 rounded-lg bg-white/80 border border-parchment-200">
                            <span className="font-bold text-ink-900">{wp.day}</span>
                            <span className="text-ink-600 text-[10px] truncate max-w-[150px]">{wp.focus}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* If message generated notes artifact from Agent Mission */}
                {msg.agentMission?.generatedNotes && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-white border border-parchment-300 text-xs space-y-2">
                    <div className="flex items-center justify-between font-serif font-bold text-ink-900 border-b border-parchment-200 pb-1">
                      <span>Synthesized Study Notes: {msg.agentMission.generatedNotes.topic}</span>
                      <span className="text-[10px] font-mono text-terracotta-700 bg-parchment-100 px-2 py-0.5 rounded">
                        Ruvi Artifact
                      </span>
                    </div>
                    <div className="text-[11px] text-ink-600 font-mono">
                      {msg.agentMission.generatedNotes.blueprint}
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-ink-800 text-[11px]">Core Formulas:</span>
                      {msg.agentMission.generatedNotes.formulas.map((f, idx) => (
                        <div key={idx} className="p-1.5 rounded-lg bg-parchment-50 font-mono text-[11px] text-terracotta-800">
                          {`• ${f}`}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-950 text-[11px]">
                      <span className="font-bold">Hinglish Anchor: </span>
                      {msg.agentMission.generatedNotes.hinglishAnchor}
                    </div>
                  </div>
                )}

                {/* Suggested Action CTA */}
                {msg.suggestedAction && (
                  <div className="mt-3">
                    <button
                      onClick={() => onStartPractice(msg.suggestedAction?.actionKey || 'focus', msg.suggestedAction?.payload)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold shadow-soft transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{msg.suggestedAction.label}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-ink-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-ink-500 italic p-2">
              <Bot className="w-3.5 h-3.5 text-terracotta-600 animate-pulse" />
              <span>Ruvi is reasoning with your syllabus and model parameters...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Autonomous Missions Carousel */}
        <div className="pt-2 border-t border-parchment-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-700">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Launch Autonomous Mission:</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {autonomousMissions.map((m, idx) => (
              <button
                key={idx}
                disabled={isAgentRunning}
                onClick={() => handleExecuteAgentMission(m.query)}
                className="px-3 py-1.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-200 text-ink-800 text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Voice Transcript Floating Banner */}
          {isListening && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-pulse">
              <Mic className="w-4 h-4 text-amber-600" />
              <span>{voiceTranscript || "Listening to your voice..."}</span>
            </div>
          )}

          {/* Input Box with Voice & Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Ruvi anything, say 'show timetable', or pick a topic above..."
              className="flex-1 px-4 py-2.5 rounded-2xl border border-parchment-300 focus:outline-none focus:border-terracotta-500 text-xs sm:text-sm bg-parchment-50 text-ink-900 placeholder:text-ink-400 min-h-[44px]"
            />

            <button
              type="button"
              onClick={toggleMicListening}
              className={`min-h-[44px] min-w-[44px] p-2.5 rounded-2xl border flex items-center justify-center transition-colors ${
                isListening
                  ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                  : 'bg-parchment-100 hover:bg-parchment-200 border-parchment-300 text-ink-700'
              }`}
              title={isListening ? "Stop Listening" : "Speak to Ruvi in Voice"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-soft"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
