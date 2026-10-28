import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  FileText, 
  Lightbulb, 
  Languages, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { UserProfile, Question, MistakeRecord } from '../types';
import { AIProvider } from '../services/aiProvider';

interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  citations?: { docTitle: string; page: number }[];
  suggestedAction?: { label: string; actionKey: string };
  timestamp: string;
}

interface StudyCompanionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  mistakes: MistakeRecord[];
  initialPrompt?: string;
  onStartPractice: (type: string) => void;
}

export const StudyCompanionDrawer: React.FC<StudyCompanionDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  mistakes,
  initialPrompt,
  onStartPractice
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'companion',
      text: `Hey ${profile.name}! Ruvi here. I have indexed your syllabus notes and recorded your practice attempts. How can I guide you today?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await AIProvider.askAgent(query, profile.preferredLanguage);

      const compMsg: Message = {
        id: `c-${Date.now()}`,
        sender: 'companion',
        text: response.content,
        citations: response.citations,
        suggestedAction: response.suggestedAction,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, compMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          sender: 'companion',
          text: `I consulted your learning history and uploaded materials. Let's focus on calibrating your highest-leverage concepts one session at a time.`,
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-parchment-50 border-l border-parchment-300 shadow-2xl flex flex-col animate-slideLeft">
      
      {/* Drawer Header */}
      <div className="p-4 bg-ink-900 text-parchment-50 flex items-center justify-between border-b border-ink-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-terracotta-500 flex items-center justify-center font-bold text-white shadow-soft">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-sm tracking-wide text-white">
              {profile.companionName}
            </div>
            <div className="text-[10px] text-parchment-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Grounded in your notes & history</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-parchment-300 hover:text-white hover:bg-ink-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  isUser
                    ? 'bg-ink-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white border border-parchment-200 text-ink-900 rounded-bl-none shadow-soft'
                }`}
              >
                <p className="whitespace-pre-line font-sans">{m.text}</p>

                {/* Grounded Citation */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-parchment-100 flex flex-col gap-1">
                    {m.citations.map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-terracotta-700 bg-terracotta-50 px-2 py-1 rounded">
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span>Source: <strong>{c.docTitle}</strong> (p. {c.page})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested In-App Action */}
                {m.suggestedAction && (
                  <button
                    onClick={() => {
                      onStartPractice(m.suggestedAction!.actionKey);
                      onClose();
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>{m.suggestedAction.label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <span className="text-[10px] text-ink-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white border border-parchment-200 rounded-2xl w-24 text-ink-500 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse"></span>
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse [animation-delay:0.4s]"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-parchment-100 border-t border-parchment-200 flex items-center gap-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendPrompt("Why did my percentage accuracy drop?")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-parchment-300 text-ink-800 whitespace-nowrap hover:border-terracotta-500 transition-colors"
        >
          <Sparkles className="w-3 h-3 text-terracotta-600" />
          <span>Why did percentage accuracy drop?</span>
        </button>
        <button
          onClick={() => handleSendPrompt("Explain circular seating inward/outward rule in Hinglish")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-parchment-300 text-ink-800 whitespace-nowrap hover:border-terracotta-500 transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-ink-600" />
          <span>Circular seating in Hinglish</span>
        </button>
        <button
          onClick={() => handleSendPrompt("What should she study today?")}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-parchment-300 text-ink-800 whitespace-nowrap hover:border-terracotta-500 transition-colors"
        >
          <Calendar className="w-3 h-3 text-sage-600" />
          <span>What should I study today?</span>
        </button>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-parchment-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask your companion anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
          className="flex-1 text-xs bg-parchment-50 border border-parchment-300 rounded-xl px-3.5 py-2.5 text-ink-900 focus:outline-none focus:border-terracotta-500"
        />
        <button
          onClick={() => handleSendPrompt()}
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
