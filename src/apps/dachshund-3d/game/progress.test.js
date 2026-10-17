import { describe, it, expect } from 'vitest';
import { defaultSave, loadSave, writeSave, sanitizeSave, STORAGE_KEY } from './storage';
import { applyLevelResult, applyEndlessResult, applyAudioSettings, isLevelUnlocked } from './progress';

const memory = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
};

describe('desbloqueo de niveles', () => {
  it('solo el nivel 1 al principio', () => {
    const s = defaultSave();
    expect([1, 2, 3].map((n) => isLevelUnlocked(s, n))).toEqual([true, false, false]);
  });
  it('perder no desbloquea; completar sí', () => {
    let s = defaultSave();
    s = applyLevelResult(s, { levelId: 1, score: 50, timeMs: 1000, maxLength: 8, prizes: 5, completed: false }).save;
    expect(isLevelUnlocked(s, 2)).toBe(false);
    s = applyLevelResult(s, { levelId: 1, score: 100, timeMs: 1000, maxLength: 13, prizes: 10, completed: true }).save;
    expect(isLevelUnlocked(s, 2)).toBe(true);
    expect(isLevelUnlocked(s, 3)).toBe(false);
    s = applyLevelResult(s, { levelId: 2, score: 300, timeMs: 1000, maxLength: 18, prizes: 15, completed: true }).save;
    expect(isLevelUnlocked(s, 3)).toBe(true);
    expect(s.stats.wins).toBe(2);
    expect(s.stats.totalPrizes).toBe(30);
  });
});

describe('récords', () => {
  it('el récord del modo infinito persiste al recargar', () => {
    const st = memory();
    let s = loadSave(st);
    const r = applyEndlessResult(s, { score: 420, round: 3, prizes: 25, maxLength: 13 });
    expect(r.isNewRecord).toBe(true);
    writeSave(r.save, st);
    s = loadSave(st);
    expect(s.stats.endlessBest).toBe(420);
    expect(s.stats.bestRound).toBe(3);
    const r2 = applyEndlessResult(s, { score: 100, round: 1, prizes: 4, maxLength: 7 });
    expect(r2.isNewRecord).toBe(false);
    expect(r2.previousBest).toBe(420);
    expect(r2.save.stats.endlessBest).toBe(420);
  });

  it('la configuración de audio se guarda', () => {
    const st = memory();
    writeSave(applyAudioSettings(loadSave(st), { musicOn: false, sfx: 0.3 }), st);
    const s = loadSave(st);
    expect(s.audio.musicOn).toBe(false);
    expect(s.audio.sfx).toBe(0.3);
  });

  it('datos dañados se sustituyen por valores predeterminados', () => {
    const st = memory();
    st.setItem(STORAGE_KEY, '{no es json');
    expect(loadSave(st)).toEqual(defaultSave());
    const s = sanitizeSave({ stats: { endlessBest: 'x', gamesPlayed: -4 }, audio: { master: 7 }, progress: { unlockedLevel: 99 } });
    expect(s.stats.endlessBest).toBe(0);
    expect(s.stats.gamesPlayed).toBe(0);
    expect(s.audio.master).toBe(1);
    expect(s.progress.unlockedLevel).toBe(3);
  });
});
