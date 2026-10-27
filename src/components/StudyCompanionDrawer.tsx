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
  ArrowRight
} from 'lucide-react';
import { UserProfile, Question, MistakeRecord } from '../types';

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
      text: `Hello ${profile.name}. I am your Study Companion. I have indexed your uploaded notes and recorded your last 14 practice attempts. How can I guide you today?`,
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

  const handleSendPrompt = (textToSend?: string) => {
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

    // Dynamic Socratic response logic grounded in data
    setTimeout(() => {
      let reply = "";
      let citations: { docTitle: string; page: number }[] | undefined = undefined;
      let action: { label: string; actionKey: string } | undefined = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('percentage') || lower.includes('base value') || lower.includes('why did my percentage accuracy drop')) {
        reply = profile.preferredLanguage === 'Hinglish'
          ? `${profile.name}, dekho: Jab book ka price 100 se 25% badh gaya, to wo 125 ho gaya. Ab agar wapas 100 lana hai, to ₹25 kam karna padega. Par ab reduction 125 pe calculate hogi, 100 pe nahi! 
Formula: [x / (100 + x)] * 100 = 25/125 = 20%. 
Tumne pichle test me 25% select kiya tha kyunki dimaag intuitively symmetry expect karta hai. Kya tum ab ek parallel question try karna chahogi?`
          : `${profile.name}, let's dissect the base shift mathematically:
When the price increased by 25%, a ₹100 item became ₹125.
To return to ₹100, we must deduct ₹25. But your new base denominator is ₹125, NOT ₹100!
Required reduction = (25 / 125) × 100 = 20%.
In your last 3 attempts, you chose 25% because intuition assumes symmetry. In CET, base shift is an intentional trap.`;
        
        citations = [{ docTitle: "MAH-CET-Speed-Math-Formulas.pdf", page: 42 }];
        action = { label: "Attempt 5 Calibrated Base-Shift Questions", actionKey: "ai_adaptive" };
      } else if (lower.includes('circular') || lower.includes('puzzle') || lower.includes('seating')) {
        reply = profile.preferredLanguage === 'Hinglish'
          ? `Circular seating me sabse pehle us vyakti ko fix karo jiska facing direction pakka pata ho (jaise W facing centre). 
Center face karne wale ke liye: Right = Anti-Clockwise, Left = Clockwise.
Outward face karne wale ke liye: Right = Clockwise, Left = Anti-Clockwise.
Agar ambiguity ho, to turant Case A aur Case B parallel bana lo, kabhi single diagram me guess mat karo.`
          : `In circular arrangement with mixed facing:
1. Always pin the entity with known orientation first (e.g., Executive W facing inward).
2. For Inward facing: Right is Counter-Clockwise; Left is Clockwise.
3. For Outward facing: Right is Clockwise; Left is Counter-Clockwise.
4. Immediately fork ambiguous directions into Case A and Case B diagrams rather than guessing.`;
        
        citations = [{ docTitle: "Logical-Puzzles-Advanced-Handbook.docx", page: 18 }];
        action = { label: "Launch Circular Puzzle Drill", actionKey: "topic" };
      } else if (lower.includes('today') || lower.includes('study today') || lower.includes('priority')) {
        reply = `Based on your recorded learning history:
1. Top Priority: Percentages & Base Inversion (Accuracy fell to 42% across 2 sessions).
2. Secondary: Circular Seating Arrangements with dual inward/outward facing.
3. Speed maintenance: Abstract Reasoning 15-question sprint (Target: 35s per question).`;
        action = { label: "Launch Today's AI Adaptive Session", actionKey: "ai_adaptive" };
      } else {
        reply = `I have consulted your uploaded materials. For MAH-CET 2027, every concept should be linked directly to question speed and elimination accuracy. 
Remember: there is no negative marking in MAH-CET, so our goal is 100% attempt rate with high cognitive calibration.`;
      }

      const compMsg: Message = {
        id: `c-${Date.now()}`,
        sender: 'companion',
        text: reply,
        citations,
        suggestedAction: action,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, compMsg]);
      setIsTyping(false);
    }, 700);
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
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-parchment-100 border-t border-parchment-200 flex items-center gap-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendPrompt("Why did my percentage accuracy drop?")}
          className="px-2.5 py-1 rounded-lg bg-white border border-parchment-300 text-ink-800 whitespace-nowrap hover:border-terracotta-500 transition-colors"
        >
          💡 Why did percentage accuracy drop?
        </button>
        <button
          onClick={() => handleSendPrompt("Explain circular seating inward/outward rule in Hinglish")}
          className="px-2.5 py-1 rounded-lg bg-white border border-parchment-300 text-ink-800 whitespace-nowrap hover:border-terracotta-500 transition-colors"
        >
          🔄 Circular seating in Hinglish
        </button>
        <button
          onClick={() => handleSendPrompt("What should she study today?")}
          className="px-2.5 py-1 rounded-lg bg-white border border-parchment-300 text-ink-800 whitespace-nowrap hover:border-terracotta-500 transition-colors"
        >
          📅 What should I study today?
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
