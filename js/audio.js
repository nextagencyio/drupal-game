// ════════════════════════════════════════════════════════════════════════════
//  AudioManager — Procedural Chiptune Audio Engine
//  All music and SFX generated via Web Audio API (no external files)
// ════════════════════════════════════════════════════════════════════════════

// Note frequencies (Equal temperament, A4 = 440 Hz)
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
  // Sharps / flats
  Cs3: 138.59, Ds3: 155.56, Fs3: 185.00, Gs3: 207.65, As3: 233.08,
  Cs4: 277.18, Ds4: 311.13, Fs4: 369.99, Gs4: 415.30, As4: 466.16,
  Cs5: 554.37, Ds5: 622.25, Fs5: 739.99, Gs5: 830.61, As5: 932.33,
  Eb3: 155.56, Bb3: 233.08,
  Eb4: 311.13, Bb4: 466.16,
  Eb5: 622.25, Bb5: 932.33,
  Ab4: 415.30,
};

const REST = 0; // Silence marker for melodies

export class AudioManager {
  constructor() {
    this.ctx = null;

    // Volume state
    this.masterVolume = 0.3;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;
    this.muted = false;

    // Gain nodes
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    // Music state
    this._musicTheme = null;
    this._musicScheduler = null;
    this._musicNodes = [];    // Active oscillators/gains for cleanup
    this._scheduledUntil = 0; // How far ahead we've scheduled (in audio time)
    this._beatIndex = 0;      // Current beat position in the loop
    this._looping = true;

    // Throttle timers for continuous SFX
    this._wallSlideLastTime = 0;
  }

  // ══════════════════════════════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════════════════════════════
  init() {
    if (this.ctx) {
      // Resume if suspended (autoplay policy)
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master gain -> destination
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // Music gain -> master
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);

    // SFX gain -> master
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    this._applyVolumes();

    // Resume on user interaction if needed
    const resume = () => {
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    };
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
  }

  _applyVolumes() {
    if (!this.masterGain) return;
    const m = this.muted ? 0 : this.masterVolume;
    this.masterGain.gain.setValueAtTime(m, this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
  }

  // ══════════════════════════════════════════════════════════════
  //  VOLUME CONTROLS
  // ══════════════════════════════════════════════════════════════
  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    this._applyVolumes();
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    this._applyVolumes();
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this._applyVolumes();
  }

  toggleMute() {
    this.muted = !this.muted;
    this._applyVolumes();
    return this.muted;
  }

  // ══════════════════════════════════════════════════════════════
  //  LOW-LEVEL TONE HELPERS
  // ══════════════════════════════════════════════════════════════

  /** Play a single tone through the SFX bus. */
  _tone(freq, dur, type = 'square', vol = 0.15, startOffset = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + startOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Play noise (for percussion SFX). */
  _noise(dur, vol = 0.08, startOffset = 0, highpass = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + startOffset;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    if (highpass > 0) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(highpass, t);
      noise.connect(filter).connect(gain).connect(this.sfxGain);
    } else {
      noise.connect(gain).connect(this.sfxGain);
    }

    noise.start(t);
    noise.stop(t + dur + 0.02);
  }

  /** Play a sequence of [freq, dur] pairs through SFX bus. */
  _seq(notes, gap = 0.08) {
    let offset = 0;
    for (const [f, d, type, vol] of notes) {
      this._tone(f, d, type || 'square', vol || 0.15, offset);
      offset += gap;
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  MUSIC SYSTEM — Procedural Chiptune Generation
  // ══════════════════════════════════════════════════════════════

  /** Start a music theme. Stops any currently playing music first. */
  startMusic(theme) {
    if (!this.ctx) return;
    if (this._musicTheme === theme) return; // Already playing this theme
    this.stopMusic();

    this._musicTheme = theme;

    const themeData = THEMES[theme];
    if (!themeData) return;

    this._looping = themeData.loop !== false;
    this._beatIndex = 0;
    this._scheduledUntil = this.ctx.currentTime + 0.1;

    // Schedule ahead in chunks
    this._scheduleMusic(themeData);
    this._musicScheduler = setInterval(() => {
      this._scheduleMusic(themeData);
    }, 200);
  }

  /** Stop all music. */
  stopMusic() {
    this._musicTheme = null;

    if (this._musicScheduler) {
      clearInterval(this._musicScheduler);
      this._musicScheduler = null;
    }

    // Stop all active music nodes
    const now = this.ctx ? this.ctx.currentTime : 0;
    for (const node of this._musicNodes) {
      try {
        if (node.stop) node.stop(now + 0.05);
      } catch (_) { /* already stopped */ }
    }
    this._musicNodes = [];
    this._beatIndex = 0;
  }

  /** Schedule music beats ahead of time (look-ahead scheduling). */
  _scheduleMusic(theme) {
    if (!this.ctx || !this._musicTheme) return;

    const lookAhead = 0.5; // Schedule 500ms ahead
    const now = this.ctx.currentTime;
    const scheduleEnd = now + lookAhead;

    const beatDur = 60 / theme.bpm; // Duration of one beat in seconds
    const totalBeats = theme.totalBeats;

    while (this._scheduledUntil < scheduleEnd) {
      const beatTime = this._scheduledUntil;

      // Schedule each track at this beat
      for (const track of theme.tracks) {
        const noteIndex = this._beatIndex % track.notes.length;
        const noteData = track.notes[noteIndex];

        if (noteData !== null && noteData !== undefined) {
          this._scheduleMusicNote(track, noteData, beatTime, beatDur);
        }
      }

      this._scheduledUntil += beatDur;
      this._beatIndex++;

      // Loop or stop
      if (this._beatIndex >= totalBeats) {
        if (this._looping) {
          this._beatIndex = 0;
        } else {
          // Non-looping theme (victory jingle): stop scheduling
          setTimeout(() => this.stopMusic(), (this._scheduledUntil - now) * 1000 + 200);
          return;
        }
      }
    }

    // Prune old nodes (already stopped)
    this._musicNodes = this._musicNodes.filter(n => {
      try { return n._endTime > now; } catch (_) { return false; }
    });
  }

  /** Schedule a single music note on the music bus. */
  _scheduleMusicNote(track, noteData, time, beatDur) {
    // noteData can be: freq, [freq, durationMultiplier], or an array for chords
    let freq, durMult;

    if (Array.isArray(noteData)) {
      freq = noteData[0];
      durMult = noteData[1] || 1;
    } else {
      freq = noteData;
      durMult = 1;
    }

    if (freq === REST || freq === 0) return;

    const dur = beatDur * durMult * (track.sustain || 0.8);
    const vol = track.volume || 0.12;

    if (track.type === 'noise') {
      // Drum hit
      this._scheduleDrum(noteData, time, vol);
      return;
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = track.wave || 'square';
    osc.frequency.setValueAtTime(freq, time);

    // Duty cycle simulation for square wave variety
    if (track.duty && osc.type === 'square') {
      // Use a slight detune to change the timbre
      osc.detune.setValueAtTime(track.duty, time);
    }

    gain.gain.setValueAtTime(0, time);
    // Quick attack
    gain.gain.linearRampToValueAtTime(vol, time + 0.005);
    // Sustain then release
    const releaseStart = time + dur * 0.7;
    gain.gain.setValueAtTime(vol, releaseStart);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain).connect(this.musicGain);
    osc.start(time);
    osc.stop(time + dur + 0.02);

    osc._endTime = time + dur + 0.02;
    this._musicNodes.push(osc);
  }

  /** Schedule a drum sound on the music bus. */
  _scheduleDrum(type, time, vol) {
    if (type === 'kick') {
      // Kick: sine wave pitch drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
      gain.gain.setValueAtTime(vol * 1.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(gain).connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.2);
      osc._endTime = time + 0.2;
      this._musicNodes.push(osc);

    } else if (type === 'snare') {
      // Snare: noise burst + tone
      const bufLen = Math.floor(this.ctx.sampleRate * 0.1);
      const buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(vol * 0.8, time);
      nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, time);

      noise.connect(filter).connect(nGain).connect(this.musicGain);
      noise.start(time);
      noise.stop(time + 0.12);
      noise._endTime = time + 0.12;
      this._musicNodes.push(noise);

      // Tone body
      const osc = this.ctx.createOscillator();
      const tGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.06);
      tGain.gain.setValueAtTime(vol * 0.6, time);
      tGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      osc.connect(tGain).connect(this.musicGain);
      osc.start(time);
      osc.stop(time + 0.1);
      osc._endTime = time + 0.1;
      this._musicNodes.push(osc);

    } else if (type === 'hihat' || type === 'hat') {
      // Hi-hat: short filtered noise
      const bufLen = Math.floor(this.ctx.sampleRate * 0.05);
      const buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, time);

      noise.connect(filter).connect(gain).connect(this.musicGain);
      noise.start(time);
      noise.stop(time + 0.06);
      noise._endTime = time + 0.06;
      this._musicNodes.push(noise);

    } else if (type === 'openhat') {
      // Open hi-hat: longer noise
      const bufLen = Math.floor(this.ctx.sampleRate * 0.15);
      const buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6000, time);

      noise.connect(filter).connect(gain).connect(this.musicGain);
      noise.start(time);
      noise.stop(time + 0.16);
      noise._endTime = time + 0.16;
      this._musicNodes.push(noise);
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  SOUND EFFECTS
  // ══════════════════════════════════════════════════════════════

  /** Jump — quick ascending chirp with bite */
  jump() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.10);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  /** Coin — bright Mario-style ding with harmonic shimmer */
  coin() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Primary tone
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(NOTE.B5, t);
    osc1.frequency.setValueAtTime(NOTE.E6, t + 0.07);
    g1.gain.setValueAtTime(0.12, t);
    g1.gain.setValueAtTime(0.10, t + 0.07);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc1.connect(g1).connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.30);

    // Harmonic shimmer (octave up, quieter)
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(NOTE.B5 * 2, t);
    osc2.frequency.setValueAtTime(NOTE.E6 * 2, t + 0.07);
    g2.gain.setValueAtTime(0.04, t);
    g2.gain.setValueAtTime(0.03, t + 0.07);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc2.connect(g2).connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 0.27);
  }

  /** Powerup — ascending arpeggio with sparkle */
  powerup() {
    if (!this.ctx) return;
    const notes = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6];
    const gap = 0.08;
    notes.forEach((freq, i) => {
      const offset = i * gap;
      // Main tone
      this._tone(freq, 0.15, 'square', 0.13, offset);
      // Sparkle (triangle an octave up, quiet)
      this._tone(freq * 2, 0.10, 'triangle', 0.04, offset + 0.02);
    });
    // Final shimmer noise
    this._noise(0.15, 0.04, notes.length * gap, 4000);
  }

  /** Hit — crunchy impact with bass thud */
  hit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Bass thud (sine pitch drop)
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(200, t);
    osc1.frequency.exponentialRampToValueAtTime(50, t + 0.15);
    g1.gain.setValueAtTime(0.2, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc1.connect(g1).connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.22);

    // Crunch (short noise burst)
    this._noise(0.08, 0.14, 0, 800);

    // Distorted square bite
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(120, t);
    osc2.frequency.exponentialRampToValueAtTime(60, t + 0.1);
    g2.gain.setValueAtTime(0.10, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc2.connect(g2).connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 0.15);
  }

  /** Shoot — pew-pew laser */
  shoot() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.10);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.14);

    // Second harmonic pew (slightly delayed)
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1200, t + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    g2.gain.setValueAtTime(0.06, t + 0.03);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc2.connect(g2).connect(this.sfxGain);
    osc2.start(t + 0.03);
    osc2.stop(t + 0.16);
  }

  /** Enemy death — satisfying pop/crunch with descending tone */
  enemyDeath() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Pop
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(600, t);
    osc1.frequency.exponentialRampToValueAtTime(150, t + 0.15);
    g1.gain.setValueAtTime(0.14, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc1.connect(g1).connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.20);

    // Crunch noise
    this._noise(0.06, 0.10, 0, 1500);

    // Descending confirmation tone
    this._tone(400, 0.08, 'square', 0.08, 0.05);
    this._tone(280, 0.10, 'square', 0.06, 0.10);
  }

  /** Boss death — epic multi-stage explosion sequence */
  bossDeath() {
    if (!this.ctx) return;

    // Stage 1: Rising alarm
    for (let i = 0; i < 4; i++) {
      this._tone(200 + i * 80, 0.08, 'square', 0.12, i * 0.10);
      this._noise(0.06, 0.08, i * 0.10, 1000);
    }

    // Stage 2: Rapid explosions
    for (let i = 0; i < 6; i++) {
      const offset = 0.4 + i * 0.07;
      this._noise(0.08, 0.12, offset, 500 + Math.random() * 2000);
      this._tone(100 + Math.random() * 200, 0.06, 'sawtooth', 0.10, offset);
    }

    // Stage 3: Final big boom + victory stinger
    this._noise(0.25, 0.15, 0.85, 200);
    this._tone(80, 0.3, 'sine', 0.18, 0.85); // Deep boom

    // Victory stinger
    const stinger = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6];
    stinger.forEach((freq, i) => {
      this._tone(freq, 0.18, 'square', 0.10, 1.15 + i * 0.12);
    });
  }

  /** Victory — triumphant ascending fanfare */
  victory() {
    if (!this.ctx) return;
    // C major fanfare
    const fanfare = [
      [NOTE.C5, 0.12], [NOTE.E5, 0.12], [NOTE.G5, 0.12],
      [NOTE.C6, 0.25], [REST, 0.05],
      [NOTE.A5, 0.12], [NOTE.C6, 0.35],
    ];
    let offset = 0;
    for (const [freq, dur] of fanfare) {
      if (freq !== REST) {
        this._tone(freq, dur + 0.05, 'square', 0.12, offset);
        this._tone(freq * 0.5, dur + 0.05, 'triangle', 0.06, offset); // Bass support
      }
      offset += dur + 0.04;
    }
  }

  /** Game over — sad descending tones */
  gameOver() {
    if (!this.ctx) return;
    const notes = [
      [NOTE.E5, 0.22], [NOTE.D5, 0.22], [NOTE.C5, 0.22],
      [NOTE.B4, 0.22], [NOTE.A4, 0.45],
    ];
    let offset = 0;
    for (const [freq, dur] of notes) {
      this._tone(freq, dur + 0.05, 'square', 0.10, offset);
      this._tone(freq * 0.5, dur + 0.05, 'triangle', 0.05, offset);
      offset += dur + 0.06;
    }
  }

  /** Checkpoint — quick positive confirmation */
  checkpoint() {
    if (!this.ctx) return;
    this._tone(NOTE.G5, 0.08, 'square', 0.12, 0);
    this._tone(NOTE.C6, 0.12, 'square', 0.12, 0.08);
    this._tone(NOTE.E6, 0.16, 'triangle', 0.08, 0.16);
  }

  /** Combo — ascending pitch based on combo count */
  combo(count = 1) {
    if (!this.ctx) return;
    const baseFreq = 500 + Math.min(count, 10) * 80;
    this._tone(baseFreq, 0.06, 'square', 0.10, 0);
    this._tone(baseFreq * 1.25, 0.08, 'square', 0.08, 0.04);
    if (count >= 5) {
      // Extra sparkle for high combos
      this._tone(baseFreq * 2, 0.06, 'triangle', 0.05, 0.06);
    }
  }

  /** Pause — quick blip */
  pause() {
    if (!this.ctx) return;
    this._tone(NOTE.C5, 0.04, 'square', 0.08, 0);
    this._tone(NOTE.G4, 0.06, 'square', 0.08, 0.05);
  }

  /** Boss slam — heavy impact with screen-shake feel */
  bossSlam() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Massive bass impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.3);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.38);

    // Crumble noise
    this._noise(0.18, 0.15, 0, 300);

    // Rumble (low sawtooth)
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(50, t);
    osc2.frequency.setValueAtTime(35, t + 0.1);
    g2.gain.setValueAtTime(0.08, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc2.connect(g2).connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 0.28);
  }

  /** Wall slide — subtle scraping sound (throttled to prevent spam) */
  wallSlide() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Throttle: only play every 80ms
    if (t - this._wallSlideLastTime < 0.08) return;
    this._wallSlideLastTime = t;

    // Filtered noise scrape
    const bufLen = Math.floor(this.ctx.sampleRate * 0.06);
    const buffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3000, t);
    bp.Q.setValueAtTime(5, t);

    noise.connect(bp).connect(gain).connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.07);
  }

  // ══════════════════════════════════════════════════════════════
  //  CLEANUP
  // ══════════════════════════════════════════════════════════════
  destroy() {
    this.stopMusic();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
  }
}


// ════════════════════════════════════════════════════════════════════════════
//  THEME DEFINITIONS — Procedural Chiptune Song Data
// ════════════════════════════════════════════════════════════════════════════

/**
 * Each theme has:
 *   bpm: tempo
 *   totalBeats: length of one loop (in beats)
 *   loop: true/false
 *   tracks: array of { wave, volume, sustain, notes[] }
 *
 * Notes array: one entry per beat.
 *   - A frequency value plays that note
 *   - REST (0) is silence
 *   - null is silence
 *   - For drums: 'kick', 'snare', 'hihat', 'openhat'
 */

const THEMES = {};

// ─────────────────────────────────────────────────────────────
//  TITLE THEME — Upbeat, catchy 8-bit at 132 BPM
//  Chord progression: C - Am - F - G (each chord = 4 beats, 16 total)
//  Repeated with variation for 32 beats total
// ─────────────────────────────────────────────────────────────

THEMES.title = {
  bpm: 132,
  totalBeats: 64,
  loop: true,
  tracks: [
    // ── Lead melody (square wave) ──
    {
      wave: 'square',
      volume: 0.09,
      sustain: 0.75,
      notes: [
        // Bar 1-2: C major phrase
        NOTE.E5, NOTE.G5, NOTE.C6, NOTE.B5,   NOTE.A5, NOTE.G5, NOTE.E5, NOTE.D5,
        // Bar 3-4: Am phrase
        NOTE.C5, NOTE.E5, NOTE.A5, NOTE.G5,   NOTE.E5, NOTE.D5, NOTE.C5, NOTE.E5,
        // Bar 5-6: F major phrase
        NOTE.F5, NOTE.A5, NOTE.C6, NOTE.A5,   NOTE.G5, NOTE.F5, NOTE.E5, NOTE.F5,
        // Bar 7-8: G major phrase -> resolution
        NOTE.G5, NOTE.B5, NOTE.D6, NOTE.C6,   NOTE.B5, NOTE.A5, NOTE.G5, NOTE.C6,

        // Bar 9-10: Variation — higher energy
        NOTE.C6, NOTE.B5, NOTE.G5, NOTE.E5,   NOTE.G5, NOTE.A5, NOTE.B5, NOTE.C6,
        // Bar 11-12: Am descending run
        NOTE.A5, NOTE.G5, NOTE.E5, NOTE.C5,   NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5,
        // Bar 13-14: F build
        NOTE.F5, NOTE.G5, NOTE.A5, NOTE.C6,   NOTE.A5, NOTE.F5, NOTE.G5, NOTE.A5,
        // Bar 15-16: G resolution with flourish
        NOTE.G5, NOTE.A5, NOTE.B5, NOTE.D6,   NOTE.C6, REST,    NOTE.G5, NOTE.C6,
      ],
    },
    // ── Bass (triangle wave) ──
    {
      wave: 'triangle',
      volume: 0.12,
      sustain: 0.6,
      notes: [
        // C  C  C  C    Am Am Am Am    F  F  F  F    G  G  G  G
        NOTE.C3, REST,   NOTE.C4, REST,   NOTE.C3, REST,   NOTE.C4, REST,
        NOTE.A3, REST,   NOTE.A3, REST,   NOTE.A3, REST,   NOTE.A3, REST,
        NOTE.F3, REST,   NOTE.F3, REST,   NOTE.F3, REST,   NOTE.F3, REST,
        NOTE.G3, REST,   NOTE.G3, REST,   NOTE.G3, REST,   NOTE.G3, NOTE.B3,

        // Repeat with walking bass variation
        NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4,  NOTE.C3, NOTE.E3, NOTE.G3, REST,
        NOTE.A3, NOTE.C4, NOTE.E4, NOTE.A3,  NOTE.A3, NOTE.C4, NOTE.E4, REST,
        NOTE.F3, NOTE.A3, NOTE.C4, NOTE.F3,  NOTE.F3, NOTE.A3, NOTE.C4, REST,
        NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G3,  NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4,
      ],
    },
    // ── Drums (noise) ──
    {
      type: 'noise',
      volume: 0.10,
      notes: (() => {
        const pattern = [];
        // 8 bars of 8 beats = 64 beats
        for (let bar = 0; bar < 8; bar++) {
          // Beat pattern per bar: kick hat snare hat kick hat snare hat
          pattern.push('kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'snare', 'hihat');
        }
        return pattern;
      })(),
    },
    // ── Harmony / chords (square wave, quiet, adds fullness) ──
    {
      wave: 'square',
      volume: 0.04,
      sustain: 0.9,
      duty: 10, // slight detune for texture
      notes: [
        // Sustained chord tones (half notes)
        NOTE.E4, null,   NOTE.G4, null,   NOTE.E4, null,   NOTE.G4, null,
        NOTE.C4, null,   NOTE.E4, null,   NOTE.C4, null,   NOTE.E4, null,
        NOTE.A4, null,   NOTE.C5, null,   NOTE.A4, null,   NOTE.C5, null,
        NOTE.B4, null,   NOTE.D5, null,   NOTE.B4, null,   NOTE.D5, null,

        NOTE.E4, null,   NOTE.G4, null,   NOTE.E4, null,   NOTE.G4, null,
        NOTE.C4, null,   NOTE.E4, null,   NOTE.C4, null,   NOTE.E4, null,
        NOTE.A4, null,   NOTE.C5, null,   NOTE.A4, null,   NOTE.C5, null,
        NOTE.B4, null,   NOTE.D5, null,   NOTE.B4, null,   NOTE.D5, null,
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
//  LEVEL THEME — Medium-tempo adventure music, 128 BPM
//  Key of C major, 16-bar loop = 64 beats
// ─────────────────────────────────────────────────────────────

THEMES.level = {
  bpm: 128,
  totalBeats: 64,
  loop: true,
  tracks: [
    // ── Lead melody (square wave) ──
    {
      wave: 'square',
      volume: 0.08,
      sustain: 0.7,
      notes: [
        // Bars 1-2: Opening phrase
        NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5,   NOTE.E5, REST,   NOTE.D5, NOTE.C5,
        // Bars 3-4: Answering phrase
        NOTE.D5, NOTE.E5, NOTE.F5, NOTE.A5,   NOTE.G5, REST,   NOTE.F5, NOTE.E5,
        // Bars 5-6: Higher energy
        NOTE.G5, NOTE.A5, NOTE.G5, NOTE.E5,   NOTE.F5, NOTE.G5, NOTE.A5, NOTE.C6,
        // Bars 7-8: Resolution
        NOTE.B5, NOTE.A5, NOTE.G5, NOTE.E5,   NOTE.D5, NOTE.E5, NOTE.G5, REST,

        // Bars 9-10: Variation (octave bounce)
        NOTE.C5, NOTE.C6, NOTE.G5, NOTE.E5,   NOTE.C5, REST,   NOTE.E5, NOTE.G5,
        // Bars 11-12: Playful
        NOTE.A5, NOTE.G5, NOTE.F5, NOTE.E5,   NOTE.F5, NOTE.G5, NOTE.A5, NOTE.G5,
        // Bars 13-14: Build-up
        NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5,   NOTE.B5, NOTE.C6, NOTE.D6, NOTE.E6,
        // Bars 15-16: Resolve
        NOTE.C6, NOTE.G5, NOTE.E5, NOTE.C5,   NOTE.D5, NOTE.E5, REST,   NOTE.C5,
      ],
    },
    // ── Bass (triangle wave) ──
    {
      wave: 'triangle',
      volume: 0.11,
      sustain: 0.55,
      notes: [
        // Bouncing bass: root-fifth pattern
        NOTE.C3, REST,   NOTE.G3, REST,   NOTE.C3, REST,   NOTE.G3, NOTE.C3,
        NOTE.F3, REST,   NOTE.C4, REST,   NOTE.F3, REST,   NOTE.C4, NOTE.F3,
        NOTE.G3, REST,   NOTE.D4, REST,   NOTE.G3, REST,   NOTE.D4, NOTE.G3,
        NOTE.A3, REST,   NOTE.E4, REST,   NOTE.G3, REST,   NOTE.D4, REST,

        NOTE.C3, NOTE.E3, NOTE.G3, REST,   NOTE.C3, NOTE.E3, NOTE.G3, REST,
        NOTE.F3, NOTE.A3, NOTE.C4, REST,   NOTE.F3, NOTE.A3, NOTE.C4, REST,
        NOTE.G3, NOTE.B3, NOTE.D4, REST,   NOTE.G3, NOTE.B3, NOTE.D4, REST,
        NOTE.C3, NOTE.E3, NOTE.G3, NOTE.C4, NOTE.G3, NOTE.E3, NOTE.C3, REST,
      ],
    },
    // ── Drums ──
    {
      type: 'noise',
      volume: 0.09,
      notes: (() => {
        const p = [];
        for (let bar = 0; bar < 8; bar++) {
          if (bar < 6) {
            // Standard groove
            p.push('kick', 'hihat', 'snare', 'hihat', 'kick', 'kick', 'snare', 'hihat');
          } else {
            // Fill in last two bars
            p.push('kick', 'snare', 'kick', 'snare', 'kick', 'kick', 'snare', 'openhat');
          }
        }
        return p;
      })(),
    },
    // ── Arp / texture (quiet square) ──
    {
      wave: 'square',
      volume: 0.035,
      sustain: 0.5,
      duty: -8,
      notes: [
        // Quick arpeggiated chords
        NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4,  NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4,
        NOTE.F4, NOTE.A4, NOTE.C5, NOTE.A4,  NOTE.F4, NOTE.A4, NOTE.C5, NOTE.A4,
        NOTE.G4, NOTE.B4, NOTE.D5, NOTE.B4,  NOTE.G4, NOTE.B4, NOTE.D5, NOTE.B4,
        NOTE.A4, NOTE.C5, NOTE.E5, NOTE.C5,  NOTE.G4, NOTE.B4, NOTE.D5, NOTE.B4,

        NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5,  NOTE.G4, NOTE.E4, NOTE.C4, NOTE.E4,
        NOTE.F4, NOTE.A4, NOTE.C5, NOTE.F5,  NOTE.C5, NOTE.A4, NOTE.F4, NOTE.A4,
        NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5,  NOTE.D5, NOTE.B4, NOTE.G4, NOTE.B4,
        NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5,  NOTE.E5, NOTE.G5, NOTE.C6, REST,
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
//  BOSS THEME — Intense, fast, A minor, 168 BPM
// ─────────────────────────────────────────────────────────────

THEMES.boss = {
  bpm: 168,
  totalBeats: 64,
  loop: true,
  tracks: [
    // ── Aggressive lead (square) ──
    {
      wave: 'square',
      volume: 0.09,
      sustain: 0.65,
      notes: [
        // Bars 1-2: Menacing Am riff
        NOTE.A4, NOTE.C5, NOTE.E5, NOTE.A5,   NOTE.Gs4, NOTE.A4, NOTE.E5, REST,
        // Bars 3-4: Descending threat
        NOTE.A5, NOTE.G5, NOTE.F5, NOTE.E5,   NOTE.D5, NOTE.C5, NOTE.B4, NOTE.A4,
        // Bars 5-6: Dm tension
        NOTE.D5, NOTE.F5, NOTE.A5, NOTE.D5,   NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5,
        // Bars 7-8: E power (dominant)
        NOTE.E5, NOTE.Gs4, NOTE.B4, NOTE.E5,  NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4,

        // Bars 9-10: Faster riff (repeated notes)
        NOTE.A4, NOTE.A4, NOTE.C5, NOTE.C5,   NOTE.E5, NOTE.E5, NOTE.A5, NOTE.A5,
        // Bars 11-12: Chromatic menace
        NOTE.A5, NOTE.Gs5, NOTE.G5, NOTE.Fs5, NOTE.F5, NOTE.E5, NOTE.Ds5, NOTE.D5,
        // Bars 13-14: Climbing
        NOTE.A4, NOTE.B4, NOTE.C5, NOTE.D5,   NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5,
        // Bars 15-16: Power ending
        NOTE.E5, NOTE.A5, NOTE.E5, NOTE.A5,   NOTE.C6, NOTE.B5, NOTE.A5, REST,
      ],
    },
    // ── Heavy bass (triangle) ──
    {
      wave: 'triangle',
      volume: 0.14,
      sustain: 0.5,
      notes: [
        // Driving eighth-note bass
        NOTE.A3, NOTE.A3, NOTE.A3, NOTE.E3,   NOTE.A3, NOTE.A3, NOTE.E3, NOTE.A3,
        NOTE.A3, NOTE.G3, NOTE.F3, NOTE.E3,   NOTE.D3, NOTE.D3, NOTE.E3, NOTE.E3,
        NOTE.D3, NOTE.D3, NOTE.D3, NOTE.A3,   NOTE.D3, NOTE.D3, NOTE.F3, NOTE.A3,
        NOTE.E3, NOTE.E3, NOTE.E3, NOTE.B3,   NOTE.E3, NOTE.E3, NOTE.Gs3, NOTE.E3,

        NOTE.A3, NOTE.A3, NOTE.C3, NOTE.C3,   NOTE.E3, NOTE.E3, NOTE.A3, NOTE.A3,
        NOTE.A3, NOTE.Gs3, NOTE.G3, NOTE.Fs3, NOTE.F3, NOTE.E3, NOTE.Ds3, NOTE.D3,
        NOTE.A3, REST,    NOTE.A3, REST,       NOTE.A3, REST,    NOTE.A3, NOTE.E3,
        NOTE.E3, NOTE.A3, NOTE.E3, NOTE.A3,   NOTE.E3, NOTE.A3, NOTE.E3, NOTE.A3,
      ],
    },
    // ── Drums (heavier pattern) ──
    {
      type: 'noise',
      volume: 0.12,
      notes: (() => {
        const p = [];
        for (let bar = 0; bar < 8; bar++) {
          if (bar % 4 === 3) {
            // Fill bar
            p.push('kick', 'snare', 'kick', 'snare', 'kick', 'kick', 'snare', 'kick');
          } else {
            // Driving double-kick pattern
            p.push('kick', 'hihat', 'kick', 'snare', 'kick', 'hihat', 'kick', 'snare');
          }
        }
        return p;
      })(),
    },
    // ── Dissonant harmony (sawtooth, quiet) ──
    {
      wave: 'sawtooth',
      volume: 0.025,
      sustain: 0.8,
      notes: [
        NOTE.A4, null,   NOTE.E4, null,   NOTE.A4, null,   NOTE.E4, null,
        NOTE.A4, null,   NOTE.C5, null,   NOTE.D4, null,   NOTE.F4, null,
        NOTE.D4, null,   NOTE.F4, null,   NOTE.D4, null,   NOTE.A4, null,
        NOTE.E4, null,   NOTE.Gs4, null,  NOTE.E4, null,   NOTE.B4, null,

        NOTE.A4, null,   NOTE.C5, null,   NOTE.E5, null,   NOTE.A4, null,
        NOTE.A4, null,   NOTE.Gs4, null,  NOTE.G4, null,   NOTE.F4, null,
        NOTE.A4, null,   NOTE.A4, null,   NOTE.A4, null,   NOTE.A4, null,
        NOTE.E4, null,   NOTE.E4, null,   NOTE.A4, null,   null,    null,
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
//  VICTORY THEME — Celebratory fanfare, does NOT loop
//  Quick 8-bar jingle at 140 BPM
// ─────────────────────────────────────────────────────────────

THEMES.victory = {
  bpm: 140,
  totalBeats: 32,
  loop: false,
  tracks: [
    // ── Fanfare lead (square) ──
    {
      wave: 'square',
      volume: 0.10,
      sustain: 0.8,
      notes: [
        // Triumphant C major fanfare
        NOTE.C5, NOTE.C5, NOTE.G5, REST,
        NOTE.E5, NOTE.G5, NOTE.C6, REST,
        NOTE.A5, NOTE.G5, NOTE.A5, NOTE.C6,
        NOTE.G5, REST,   REST,    REST,

        // Resolve with flourish
        NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6,
        NOTE.D6, NOTE.C6, NOTE.G5, NOTE.C6,
        NOTE.E6, REST,    NOTE.C6, NOTE.E6,
        NOTE.C6, REST,    REST,    REST,
      ],
    },
    // ── Support harmony (triangle) ──
    {
      wave: 'triangle',
      volume: 0.08,
      sustain: 0.7,
      notes: [
        NOTE.C4, NOTE.E4, NOTE.C4, REST,
        NOTE.C4, NOTE.E4, NOTE.G4, REST,
        NOTE.F4, NOTE.A4, NOTE.F4, NOTE.A4,
        NOTE.G4, REST,   REST,    REST,

        NOTE.C4, NOTE.G4, NOTE.E4, NOTE.G4,
        NOTE.F4, NOTE.A4, NOTE.G4, NOTE.E4,
        NOTE.C5, REST,    NOTE.G4, NOTE.C5,
        NOTE.C4, REST,    REST,    REST,
      ],
    },
    // ── Bass ──
    {
      wave: 'triangle',
      volume: 0.10,
      sustain: 0.5,
      notes: [
        NOTE.C3, REST,   NOTE.C3, REST,
        NOTE.C3, REST,   NOTE.E3, REST,
        NOTE.F3, REST,   NOTE.F3, REST,
        NOTE.G3, REST,   REST,    REST,

        NOTE.C3, REST,   NOTE.E3, REST,
        NOTE.F3, REST,   NOTE.G3, REST,
        NOTE.C3, REST,   NOTE.E3, NOTE.G3,
        NOTE.C3, REST,   REST,    REST,
      ],
    },
    // ── Celebration drums ──
    {
      type: 'noise',
      volume: 0.10,
      notes: [
        'kick', 'hihat', 'snare', 'hihat',
        'kick', 'hihat', 'snare', 'openhat',
        'kick', 'hihat', 'snare', 'hihat',
        'kick', 'snare', 'kick', 'snare',

        'kick', 'hihat', 'snare', 'hihat',
        'kick', 'kick', 'snare', 'openhat',
        'kick', 'hihat', 'kick', 'hihat',
        'kick', 'snare', null,    null,
      ],
    },
  ],
};
