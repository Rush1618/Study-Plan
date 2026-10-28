// Web Audio Synthesizer for Her Study Sanctuary Focus Room
// 100% zero-dependency local audio synthesis: Rain, 40Hz Gamma Focus, Zen Bowl, and Completion Chimes

class FocusAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private currentTrack: 'rain' | 'gamma' | 'zen' | 'none' = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTrack(track: 'rain' | 'gamma' | 'zen', volume: number = 0.3) {
    this.stopAmbient();
    this.initContext();
    if (!this.ctx) return;

    this.currentTrack = track;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (track === 'rain') {
      this.startRainSynthesis();
    } else if (track === 'gamma') {
      this.startGammaSynthesis();
    } else if (track === 'zen') {
      this.startZenSynthesis();
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as any).stop?.();
        this.ambientSource.disconnect();
      } catch {
        // Safe ignore
      }
      this.ambientSource = null;
    }
    this.currentTrack = 'none';
  }

  private startRainSynthesis() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink noise filter algorithm (Paul Kellet's method)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Soft lowpass filter to mimic distant soothing rain on a library roof
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();
    this.ambientSource = whiteNoise;
  }

  private startGammaSynthesis() {
    if (!this.ctx || !this.gainNode) return;
    // 40Hz focus binaural carrier (200Hz base + 240Hz offset)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(196, this.ctx.currentTime); // G3
    osc2.frequency.setValueAtTime(236, this.ctx.currentTime); // 40Hz delta

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    osc1.connect(subGain);
    osc2.connect(subGain);
    subGain.connect(this.gainNode);

    osc1.start();
    osc2.start();

    this.ambientSource = {
      disconnect: () => {
        try {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
          subGain.disconnect();
        } catch {}
      }
    } as any;
  }

  private startZenSynthesis() {
    if (!this.ctx || !this.gainNode) return;
    // Calm singing bowl harmonic resonance (216Hz & 432Hz)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(216, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(432, this.ctx.currentTime);

    const harmonicGain = this.ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    osc1.connect(harmonicGain);
    osc2.connect(harmonicGain);
    harmonicGain.connect(this.gainNode);

    osc1.start();
    osc2.start();

    this.ambientSource = {
      disconnect: () => {
        try {
          osc1.stop();
          osc2.stop();
          osc1.disconnect();
          osc2.disconnect();
          harmonicGain.disconnect();
        } catch {}
      }
    } as any;
  }

  public playCompletionChime() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(528, now); // Solfeggio 528Hz clarity
    osc2.frequency.setValueAtTime(792, now); // 5th harmonic

    chimeGain.gain.setValueAtTime(0.4, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    osc1.connect(chimeGain);
    osc2.connect(chimeGain);
    chimeGain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.8);
    osc2.stop(now + 2.8);
  }
}

export const FocusAudio = new FocusAudioSynthesizer();
