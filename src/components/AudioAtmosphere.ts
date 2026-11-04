'use client';

class ProceduralSoundscape {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isRunning = false;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Drone Oscillator (Deep forest resonant hum)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(400, this.ctx.currentTime);

    this.droneOsc.connect(this.filterNode);
    this.filterNode.connect(this.masterGain);
    this.droneOsc.start();

    // Subtle noise for wind / crackle
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    whiteNoise.start();

    this.noiseNode = whiteNoise;
  }

  public setPlaying(play: boolean) {
    if (!this.ctx) {
      if (play) this.init();
      else return;
    }

    if (this.ctx?.state === 'suspended' && play) {
      this.ctx.resume();
    }

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      if (play) {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(0.18, now + 1.2);
        this.isRunning = true;
      } else {
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(0, now + 0.8);
        this.isRunning = false;
      }
    }
  }

  public updateMoodByChapter(chapterIndex: number) {
    if (!this.ctx || !this.filterNode || !this.droneOsc) return;
    const now = this.ctx.currentTime;

    switch (chapterIndex) {
      case 0: // Scene 1: The Gateway (Ethereal peaceful)
        this.droneOsc.frequency.linearRampToValueAtTime(55, now + 1.5);
        this.filterNode.frequency.linearRampToValueAtTime(380, now + 1.5);
        break;
      case 1: // Scene 2: The Canopy (Airy, lush harmonic)
        this.droneOsc.frequency.linearRampToValueAtTime(65.4, now + 1.5); // C2
        this.filterNode.frequency.linearRampToValueAtTime(550, now + 1.5);
        break;
      case 2: // Scene 3: The Inferno (Intense rumbling low-frequency)
        this.droneOsc.frequency.linearRampToValueAtTime(43.65, now + 1.0); // F1
        this.filterNode.frequency.linearRampToValueAtTime(800, now + 1.0);
        break;
      case 3: // Scene 4: The Resistance (Urgent pulsing tension)
        this.droneOsc.frequency.linearRampToValueAtTime(48.99, now + 1.0); // G1
        this.filterNode.frequency.linearRampToValueAtTime(650, now + 1.0);
        break;
      case 4: // Scene 5: The Ashes (Sub-zero cold hollow wind)
        this.droneOsc.frequency.linearRampToValueAtTime(36.7, now + 2.0); // D1
        this.filterNode.frequency.linearRampToValueAtTime(220, now + 2.0);
        break;
      case 5: // Scene 6: The Rebirth (Warm harmonic resurgence)
        this.droneOsc.frequency.linearRampToValueAtTime(73.42, now + 1.5); // D2
        this.filterNode.frequency.linearRampToValueAtTime(620, now + 1.5);
        break;
    }
  }

  public destroy() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const soundscape = typeof window !== 'undefined' ? new ProceduralSoundscape() : null;

