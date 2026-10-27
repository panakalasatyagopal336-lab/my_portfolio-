/**
 * Super Gopal Audio Synthesizer
 * Built 100% with Web Audio API - zero external sound files required!
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.3;
    this.bgmPlaying = false;
    this.currentTrack = 'menu';
    this.bgmTimer = null;
    this.bgmTempo = 135; // BPM
    this.stepIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.playBGM(this.currentTrack);
    }
    return this.isMuted;
  }

  // Generic Tone Synthesizer
  playTone(freq, type, duration, startVol = 0.2, endVol = 0.001, rampToFreq = null) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (rampToFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, rampToFreq), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(startVol * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endVol * this.volume, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // --- Sound Effects ---

  playJump() {
    this.playTone(220, 'square', 0.16, 0.25, 0.01, 580);
  }

  playDoubleJump() {
    this.playTone(380, 'sine', 0.2, 0.3, 0.01, 880);
  }

  playSlide() {
    this.playTone(180, 'triangle', 0.18, 0.2, 0.01, 90);
  }

  playAttack() {
    this.playTone(700, 'sawtooth', 0.12, 0.25, 0.01, 240);
  }

  playEnemyHit() {
    this.playTone(320, 'square', 0.15, 0.3, 0.01, 80);
  }

  playCoin(pitchOffset = 0) {
    const base = 750 + pitchOffset * 40;
    this.playTone(base, 'sine', 0.08, 0.25, 0.01);
    setTimeout(() => {
      this.playTone(base * 1.33, 'sine', 0.12, 0.22, 0.01);
    }, 70);
  }

  playGem() {
    const notes = [659.25, 830.61, 987.77, 1318.51];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.14, 0.25, 0.01), i * 50);
    });
  }

  playPowerup() {
    const notes = [440, 554, 659, 880];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'square', 0.15, 0.28, 0.01), i * 70);
    });
  }

  playHurt() {
    this.playTone(180, 'sawtooth', 0.25, 0.35, 0.01, 60);
  }

  playBossHit() {
    this.playTone(140, 'sawtooth', 0.3, 0.4, 0.01, 50);
  }

  playGameOver() {
    const notes = [400, 370, 340, 300, 240];
    notes.forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.3, 0.35, 0.01, f * 0.8), i * 140);
    });
  }

  playStageClear() {
    const fanfare = [
      { f: 523, d: 0.12 },
      { f: 659, d: 0.12 },
      { f: 783, d: 0.12 },
      { f: 1046, d: 0.35 }
    ];
    fanfare.forEach((n, i) => {
      setTimeout(() => this.playTone(n.f, 'triangle', n.d, 0.35, 0.01), i * 110);
    });
  }

  playButtonClick() {
    this.playTone(800, 'sine', 0.06, 0.15, 0.01);
  }

  // --- Chiptune Background Music System ---

  playBGM(track = 'world1') {
    this.currentTrack = track;
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.stopBGM();
    this.bgmPlaying = true;
    this.stepIndex = 0;

    // Track melody presets (pentatonic / heroic scales)
    let melody = [];
    let bassline = [];

    if (track === 'menu') {
      this.bgmTempo = 120;
      melody = [440, 0, 523, 587, 659, 0, 587, 523, 440, 0, 392, 440, 523, 0, 440, 0];
      bassline = [220, 0, 220, 0, 261, 0, 261, 0, 196, 0, 196, 0, 220, 0, 220, 0];
    } else if (track === 'world1') { // Upbeat Emerald Valley
      this.bgmTempo = 138;
      melody = [523, 587, 659, 783, 659, 587, 523, 0, 659, 783, 880, 1046, 880, 783, 659, 0];
      bassline = [261, 261, 329, 329, 392, 392, 349, 349, 261, 261, 329, 329, 392, 392, 261, 261];
    } else if (track === 'world2') { // High-energy Cyber City
      this.bgmTempo = 148;
      melody = [587, 0, 587, 740, 880, 0, 740, 587, 659, 0, 659, 783, 880, 0, 987, 880];
      bassline = [146, 146, 220, 220, 146, 146, 220, 220, 164, 164, 246, 246, 164, 164, 246, 246];
    } else if (track === 'world3' || track === 'boss') { // Dark dramatic Citadel
      this.bgmTempo = 152;
      melody = [440, 440, 466, 440, 523, 440, 466, 392, 440, 440, 466, 523, 587, 523, 466, 440];
      bassline = [110, 110, 110, 110, 116, 116, 116, 116, 130, 130, 130, 130, 116, 116, 110, 110];
    } else { // Endless Rush
      this.bgmTempo = 156;
      melody = [659, 0, 783, 880, 1046, 880, 783, 659, 587, 0, 659, 783, 880, 783, 659, 587];
      bassline = [164, 164, 196, 196, 220, 220, 196, 196, 146, 146, 164, 164, 196, 196, 164, 164];
    }

    const stepInterval = (60 / this.bgmTempo / 4) * 1000;

    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !this.bgmPlaying) return;
      
      const step = this.stepIndex % 16;
      const mNote = melody[step];
      const bNote = bassline[step];

      // Play melody voice (warm square or triangle)
      if (mNote > 0) {
        this.playTone(mNote, 'triangle', 0.12, 0.12, 0.005);
      }

      // Play bass voice
      if (bNote > 0 && step % 2 === 0) {
        this.playTone(bNote, 'sawtooth', 0.18, 0.10, 0.005);
      }

      // Play subtle hi-hat/snare click on off-beats
      if (step % 4 === 2) {
        this.playTone(1200, 'square', 0.03, 0.04, 0.001);
      } else if (step % 8 === 4) {
        this.playTone(180, 'triangle', 0.07, 0.08, 0.01, 40);
      }

      this.stepIndex++;
    }, stepInterval);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// Global instance
window.audioMgr = new AudioManager();
