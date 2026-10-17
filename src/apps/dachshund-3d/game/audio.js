// Audio generado con Web Audio API: efectos sintetizados y música ambiental procedural.
// No usa archivos externos. El contexto se crea tras la primera interacción del usuario.

const NOTE = (n) => 440 * 2 ** ((n - 69) / 12); // número MIDI → Hz

const SONGS = {
  park: {
    bpm: 92,
    chords: [
      [48, 55, 59, 64], // Cmaj7
      [45, 52, 55, 60], // Am7
      [41, 48, 52, 57], // Fmaj7
      [43, 50, 55, 59], // G
    ],
    arp: [0, 2, 3, 1, 2, 3, 1, 2],
    wave: 'triangle',
    cutoff: 1400,
  },
  garden: {
    bpm: 100,
    chords: [
      [50, 57, 60, 65], // Dm7
      [46, 53, 57, 62], // Bbmaj7
      [43, 50, 53, 58], // Gm7
      [45, 52, 57, 61], // A
    ],
    arp: [0, 3, 2, 3, 1, 3, 2, 3],
    wave: 'triangle',
    cutoff: 1200,
  },
  core: {
    bpm: 112,
    chords: [
      [40, 52, 55, 59], // Em
      [36, 48, 52, 55], // C
      [38, 50, 54, 57], // D
      [35, 47, 50, 54], // Bm
    ],
    arp: [0, 1, 2, 3, 2, 1, 3, 2],
    wave: 'sawtooth',
    cutoff: 1800,
  },
};

export class GameAudio {
  constructor(settings) {
    this.settings = { ...settings };
    this.ctx = null;
    this.song = 'park';
    this.musicWanted = false;
    this.timer = null;
    this.step = 0;
    this.nextTime = 0;
    this.noiseBuffer = null;
  }

  /** Llamar desde un gesto del usuario (clic, tecla o toque). */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.musicBus = ctx.createGain();
      this.sfxBus = ctx.createGain();
      // compresor suave para que los efectos no saturen
      this.comp = ctx.createDynamicsCompressor();
      this.comp.threshold.value = -14;
      this.comp.ratio.value = 4;
      this.musicBus.connect(this.master);
      this.sfxBus.connect(this.master);
      this.master.connect(this.comp);
      this.comp.connect(ctx.destination);
      const len = ctx.sampleRate * 0.5;
      this.noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.applySettings();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    if (this.musicWanted && !this.timer) this.startScheduler();
  }

  get ready() {
    return !!this.ctx && this.ctx.state !== 'closed';
  }

  setSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.applySettings();
  }

  applySettings() {
    if (!this.ctx) return;
    const s = this.settings;
    const now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted ? 0 : s.master, now, 0.05);
    this.musicBus.gain.setTargetAtTime(s.musicOn ? s.music * 0.55 : 0, now, 0.15);
    this.sfxBus.gain.setTargetAtTime(s.sfxOn ? s.sfx : 0, now, 0.03);
  }

  // ---------- Efectos ----------

  tone(freq, dur, { type = 'triangle', vol = 0.25, slide = null, delay = 0, attack = 0.005, bus = this.sfxBus } = {}) {
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  noise(dur, { freq = 2000, q = 1, vol = 0.2, delay = 0, type = 'bandpass', bus = this.sfxBus } = {}) {
    const ctx = this.ctx;
    const t = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(bus);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  sfx(name) {
    if (!this.ready || this.ctx.state !== 'running') return;
    switch (name) {
      case 'move':
        this.tone(640, 0.05, { type: 'sine', vol: 0.12 });
        break;
      case 'select':
        this.tone(880, 0.07, { vol: 0.18 });
        this.tone(1320, 0.09, { vol: 0.14, delay: 0.04 });
        break;
      case 'back':
        this.tone(520, 0.1, { vol: 0.16, slide: 340 });
        break;
      case 'bone':
        this.tone(660, 0.09, { vol: 0.22, slide: 990 });
        this.tone(1320, 0.12, { vol: 0.14, delay: 0.07, type: 'sine' });
        break;
      case 'cookie':
        this.noise(0.09, { freq: 2600, q: 1.5, vol: 0.28 });
        this.noise(0.07, { freq: 1800, q: 2, vol: 0.2, delay: 0.06 });
        this.tone(520, 0.1, { vol: 0.18, slide: 780, delay: 0.02 });
        this.tone(1040, 0.14, { vol: 0.12, delay: 0.1, type: 'sine' });
        break;
      case 'round':
        [60, 64, 67, 72].forEach((n, i) => this.tone(NOTE(n + 12), 0.18, { vol: 0.16, delay: i * 0.08 }));
        [72, 76, 79].forEach((n) => this.tone(NOTE(n), 0.5, { vol: 0.08, delay: 0.34, type: 'sine' }));
        break;
      case 'win':
        [67, 72, 76, 79, 84].forEach((n, i) => this.tone(NOTE(n), 0.22, { vol: 0.17, delay: i * 0.11 }));
        [72, 76, 79, 84].forEach((n) => this.tone(NOTE(n), 0.9, { vol: 0.07, delay: 0.58, type: 'sine', attack: 0.04 }));
        break;
      case 'lose':
        this.tone(440, 0.6, { type: 'sawtooth', vol: 0.12, slide: 110 });
        this.tone(220, 0.5, { type: 'square', vol: 0.06, slide: 70, delay: 0.05 });
        this.noise(0.25, { freq: 300, type: 'lowpass', vol: 0.3 });
        break;
      case 'pause':
        this.tone(560, 0.12, { vol: 0.16, slide: 400 });
        break;
      case 'resume':
        this.tone(400, 0.12, { vol: 0.16, slide: 640 });
        break;
      case 'count':
        this.tone(660, 0.12, { vol: 0.16, type: 'sine' });
        break;
      case 'go':
        this.tone(990, 0.28, { vol: 0.2, type: 'triangle' });
        break;
      case 'warn':
        this.tone(220, 0.12, { type: 'square', vol: 0.08 });
        this.tone(220, 0.12, { type: 'square', vol: 0.08, delay: 0.16 });
        break;
      default:
        break;
    }
  }

  // ---------- Música ----------

  playMusic(song = 'park') {
    if (SONGS[song] && song !== this.song) {
      this.song = song;
      this.step = 0;
    }
    this.musicWanted = true;
    if (this.ready && !this.timer) this.startScheduler();
  }

  stopMusic() {
    this.musicWanted = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  startScheduler() {
    if (!this.ctx) return;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 50);
  }

  schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const song = SONGS[this.song];
    const sixteenth = 60 / song.bpm / 4;
    while (this.nextTime < ctx.currentTime + 0.25) {
      this.playStep(song, this.step, this.nextTime, sixteenth);
      this.nextTime += sixteenth;
      this.step = (this.step + 1) % (16 * song.chords.length);
    }
  }

  playStep(song, step, t, sixteenth) {
    const ctx = this.ctx;
    const bar = Math.floor(step / 16) % song.chords.length;
    const pos = step % 16;
    const chord = song.chords[bar];
    const bus = this.musicBus;

    if (pos === 0) {
      // Pad: acorde sostenido con filtro paso bajo
      const dur = sixteenth * 16;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = song.cutoff * 0.6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.6);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      f.connect(g);
      g.connect(bus);
      for (const n of chord.slice(1)) {
        for (const det of [-6, 6]) {
          const o = ctx.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = NOTE(n);
          o.detune.value = det;
          o.connect(f);
          o.start(t);
          o.stop(t + dur + 0.05);
        }
      }
    }
    if (pos === 0 || pos === 8) {
      // Bajo
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = NOTE(chord[0] - 12 + (pos === 8 ? 7 : 0));
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + sixteenth * 6);
      o.connect(g);
      g.connect(bus);
      o.start(t);
      o.stop(t + sixteenth * 6 + 0.05);
    }
    if (pos % 2 === 0) {
      // Arpegio suave
      const n = chord[song.arp[(pos / 2) % song.arp.length]] + 12;
      const o = ctx.createOscillator();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = song.wave;
      o.frequency.value = NOTE(n);
      f.type = 'lowpass';
      f.frequency.value = song.cutoff;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + sixteenth * 1.8);
      o.connect(f);
      f.connect(g);
      g.connect(bus);
      o.start(t);
      o.stop(t + sixteenth * 2);
    }
    if (pos % 4 === 2) {
      // Hi-hat muy discreto
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const f = ctx.createBiquadFilter();
      f.type = 'highpass';
      f.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.025, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      src.connect(f);
      f.connect(g);
      g.connect(bus);
      src.start(t);
      src.stop(t + 0.06);
    }
  }

  /** Suspende todo el audio (pestaña oculta) o lo reanuda. */
  suspend(on) {
    if (!this.ctx) return;
    if (on && this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
    if (!on && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  dispose() {
    this.stopMusic();
    if (this.ctx && this.ctx.state !== 'closed') this.ctx.close().catch(() => {});
    this.ctx = null;
  }
}
