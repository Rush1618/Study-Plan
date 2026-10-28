// Ruvi - Personal AI Companion & Study Mentor for Sanskriti
// Speech-to-Text & Text-to-Speech Engine

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error?: string;
}

class RuviVoiceService {
  private recognition: any = null;
  private isListeningActive: boolean = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initRecognition();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.selectBestVoice();
      };
      this.selectBestVoice();
    }
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN'; // Optimized for Indian English & Hinglish terms
    }
  }

  private selectBestVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural, warm female/neutral English & Indian voices
    const naturalVoice = voices.find(v => 
      v.name.includes('Natural') || 
      v.name.includes('Google UK English Female') || 
      v.name.includes('Heera') || 
      v.name.includes('Samantha') ||
      (v.lang.startsWith('en') && v.localService)
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    this.preferredVoice = naturalVoice || null;
  }

  public isSupported(): { speechToText: boolean; textToSpeech: boolean } {
    return {
      speechToText: typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
      textToSpeech: typeof window !== 'undefined' && 'speechSynthesis' in window
    };
  }

  public startListening(
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (err: string) => void
  ) {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      onError("Speech recognition is not supported in this browser. You can type directly to Ruvi.");
      return;
    }

    try {
      this.isListeningActive = true;
      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }
        if (interim) onInterim(interim);
        if (final) {
          this.isListeningActive = false;
          onFinal(final);
        }
      };

      this.recognition.onerror = (e: any) => {
        this.isListeningActive = false;
        onError(e.error === 'no-speech' ? "Didn't hear you clearly. Tap mic to speak again." : `Microphone: ${e.error}`);
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;
      };

      this.recognition.start();
    } catch (e: any) {
      this.isListeningActive = false;
      onError("Mic initialization failed. Please allow microphone access.");
    }
  }

  public stopListening() {
    if (this.recognition && this.isListeningActive) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListeningActive = false;
    }
  }

  public speak(
    text: string, 
    onEnd?: () => void,
    onError?: () => void
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      // Clean markdown characters before vocalization
      const cleanText = text
        .replace(/[*#_`]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/₹/g, 'Rupees ')
        .slice(0, 380); // Keep voice briefing concise and pleasant

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }
      utterance.rate = 0.95; // Warm, steady, caring cadence
      utterance.pitch = 1.05;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onError) onError();
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const RuviVoice = new RuviVoiceService();
export const JarvisVoice = RuviVoice;
