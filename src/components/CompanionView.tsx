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
  Lightbulb
} from 'lucide-react';
import { UserProfile, MistakeRecord } from '../types';
import { AIProvider } from '../services/aiProvider';
import { StorageService } from '../services/storage';

interface Message {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  citations?: { docTitle: string; page: number }[];
  suggestedAction?: { label: string; actionKey: string };
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
        text: `Hey ${profile.name}. I'm right here with you. I've analyzed your recent practice sessions and your uploaded MAH-CET textbooks. What would you like to explore or clarify today?`,
        timestamp: 'Just now'
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState<'English' | 'Hinglish'>(profile.preferredLanguage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const unresolvedMistakes = mistakes.filter(m => !m.resolved);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

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
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'companion',
          text: `I'm reflecting on your notes. Let's solve one focused question together to master this concept.`,
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    { label: 'Explain 25% base-shift trap', query: 'Explain the 25% base shift formula in Hinglish with simple examples.' },
    { label: 'Circular seating inward/outward', query: 'How do I handle circular seating when some face inward and some face outward?' },
    { label: 'Why did my percentage accuracy drop?', query: 'Why did my accuracy drop on percentage questions recently?' },
    { label: 'Generate 1 practice question', query: 'Give me 1 practice question on base-value reversal.' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
      
      {/* Companion Personal Greeting & Status Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-parchment-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-parchment-100 border border-parchment-300 flex items-center justify-center text-terracotta-600 flex-shrink-0">
            <Bot className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-lg font-bold text-ink-900 leading-tight">
                {profile.companionName || 'Personal Study Companion'}
              </h1>
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-ink-500 mt-0.5">
              Grounded in Sanskriti's uploaded notes & attempt history
            </p>
          </div>
        </div>

        {/* Language Preference Switcher */}
        <div className="flex items-center gap-1 bg-parchment-100 p-1 rounded-xl border border-parchment-200 self-start sm:self-auto">
          <button
            onClick={() => setLanguage('English')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              language === 'English'
                ? 'bg-white text-ink-900 shadow-sm font-semibold'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('Hinglish')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              language === 'Hinglish'
                ? 'bg-white text-ink-900 shadow-sm font-semibold'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Hinglish
          </button>
        </div>
      </div>

      {/* Companion Insight Card: Current Focus */}
      {unresolvedMistakes.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-parchment-100/70 border border-parchment-200 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-terracotta-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-semibold text-ink-900">Current observation: </span>
            <span className="text-ink-700">
              You have {unresolvedMistakes.length} concepts flagged for calibration (mostly base-value shifts in Quant). Ask me to explain the rule, or let me guide you through it.
            </span>
          </div>
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-parchment-200 shadow-soft min-h-[380px] sm:min-h-[460px] flex flex-col justify-between space-y-4">
        
        <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-ink-900 text-parchment-50 rounded-br-none'
                    : 'bg-parchment-100/80 text-ink-900 border border-parchment-200 rounded-bl-none font-normal'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Evidence citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-parchment-300/70 flex flex-wrap gap-2 text-[11px] text-ink-600">
                    {msg.citations.map((c, i) => (
                      <span key={i} className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-parchment-300">
                        <FileText className="w-3 h-3 text-terracotta-600" />
                        <span>{c.docTitle} (p. {c.page})</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Practice Action */}
                {msg.suggestedAction && (
                  <div className="mt-3">
                    <button
                      onClick={() => onStartPractice(msg.suggestedAction?.actionKey || 'quick')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-medium shadow-sm transition-colors"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
              <span>Thinking with your uploaded formulas...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel for Phone */}
        <div className="pt-2 border-t border-parchment-200 space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.query)}
                className="px-2.5 py-1.5 rounded-lg bg-parchment-100 hover:bg-parchment-200 border border-parchment-200 text-ink-800 text-[11px] whitespace-nowrap transition-colors flex-shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Box (Font size 16px to prevent iOS auto-zoom on mobile) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              placeholder={`Ask in ${language}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-parchment-50 border border-parchment-300 rounded-xl px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-terracotta-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-ink-900 hover:bg-terracotta-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default CompanionView;
