import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import { GameAudio } from '../game/audio';
import { loadSave, writeSave, resetSave } from '../game/storage';
import {
  applyAbandon,
  applyAudioSettings,
  applyEndlessResult,
  applyLevelResult,
  markTutorialSeen,
  recordGameStarted,
} from '../game/progress';
import { getLevel } from '../game/logic/levels';
import GameMenu from './game/GameMenu';
import LevelSelect from './game/LevelSelect';
import ControlsScreen from './game/ControlsScreen';
import StatsScreen from './game/StatsScreen';
import SoundSettings from './game/SoundSettings';
import GameHUD from './game/GameHUD';
import PauseMenu from './game/PauseMenu';
import GameOver from './game/GameOver';
import LevelComplete from './game/LevelComplete';
import TouchPad from './game/TouchPad';
import { Banner, ConfirmDialog, Countdown, Tutorial } from './game/Overlays';
import '../styles/dachshund-game.css';

const KEY_DIRS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};
const ACTIVE_PHASES = ['ready', 'running', 'roundComplete', 'tutorial', 'paused'];

/**
 * Dachshund 3D. Componente autónomo: se puede montar en cualquier página o ruta.
 * Props opcionales:
 *   onExit     si se pasa, el menú muestra un botón para salir (p. ej. volver al portafolio)
 *   exitLabel  texto de ese botón
 */
export default function DachshundGame({ onExit, exitLabel = 'Volver al portafolio' }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const engineRef = useRef(null);
  const audioRef = useRef(null);

  const [save, setSave] = useState(() => loadSave());
  const [screen, setScreen] = useState('menu'); // menu | levels | controls | stats | sound | game
  const [phase, setPhase] = useState('attract');
  const [hud, setHud] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [banner, setBanner] = useState(null);
  const [result, setResult] = useState(null);
  const [confirm, setConfirm] = useState(null); // 'restart' | 'menu'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [touch, setTouch] = useState(false);
  const [campaignScore, setCampaignScore] = useState(0);

  // Referencias con el estado más reciente para los listeners globales
  const live = useRef({});
  live.current = { save, screen, phase, confirm, result, hud, campaignScore };
  const roundsRef = useRef([]);
  const gameDefRef = useRef(null);
  const bannerTimer = useRef(null);

  const persist = useCallback((next) => {
    setSave(next);
    writeSave(next);
  }, []);

  // El audio nunca debe romper el juego: cualquier fallo se ignora y se sigue sin sonido
  const sound = useCallback((fn) => {
    try {
      if (audioRef.current) fn(audioRef.current);
    } catch (err) {
      console.warn('[Dachshund 3D] audio desactivado:', err);
    }
  }, []);
  const sfx = useCallback((name) => sound((a) => a.sfx(name)), [sound]);

  const showBanner = useCallback((b, ms = 1800) => {
    clearTimeout(bannerTimer.current);
    setBanner({ ...b, id: Date.now() });
    bannerTimer.current = setTimeout(() => setBanner(null), ms);
  }, []);

  // ---------- Eventos del motor ----------
  const handleEvent = useRef(null);
  handleEvent.current = (e) => {
    const { save: sv } = live.current;
    switch (e.type) {
      case 'phase':
        setPhase(e.phase);
        if (e.phase !== 'ready') setCountdown(null);
        break;
      case 'hud':
        setHud(e.hud);
        break;
      case 'countdown':
        setCountdown(e.value);
        sfx(e.value === 0 ? 'go' : 'count');
        if (e.value === 0) setTimeout(() => setCountdown((v) => (v === 0 ? null : v)), 600);
        break;
      case 'eat':
        sfx(e.prize.type);
        break;
      case 'obstacles':
        sfx('warn');
        showBanner({ title: '¡Nuevos obstáculos!', kind: 'warn' }, 1400);
        break;
      case 'death':
        sfx('lose');
        break;
      case 'roundComplete':
        sfx('round');
        roundsRef.current.push({ round: e.round, timeMs: e.roundTimeMs, score: e.score });
        showBanner({ title: 'ROUND COMPLETED', sub: `Ronda ${e.round} superada · ${e.score} pts`, kind: 'round' }, 1900);
        break;
      case 'roundStart':
        sound((a) => a.playMusic(engineRef.current?.session?.theme));
        showBanner({ title: `RONDA ${e.round}`, sub: 'Más velocidad, nuevos obstáculos', kind: 'info' }, 1700);
        break;
      case 'levelComplete': {
        sfx('win');
        const r = applyLevelResult(sv, { ...e.result, completed: true });
        persist(r.save);
        const total = live.current.campaignScore + e.result.score;
        setCampaignScore(total);
        setResult({ kind: 'levelComplete', data: e.result, isNewRecord: r.isNewRecord, best: r.save.stats.levelBest[e.result.levelId] });
        break;
      }
      case 'gameOver': {
        const d = e.result;
        const r = d.mode === 'endless'
          ? applyEndlessResult(sv, d)
          : applyLevelResult(sv, { ...d, completed: false });
        persist(r.save);
        setResult({ kind: 'gameOver', data: d, previousBest: r.previousBest, isNewRecord: r.isNewRecord, rounds: [...roundsRef.current] });
        break;
      }
      case 'autoPause':
        sound((a) => a.stopMusic());
        break;
      default:
        break;
    }
  };

  // ---------- Montaje: motor 3D y audio (una sola vez; compatible con Strict Mode) ----------
  useEffect(() => {
    let engine;
    try {
      engine = new GameEngine(stageRef.current, (e) => handleEvent.current(e));
      engineRef.current = engine;
      // Solo en desarrollo: acceso desde la consola para depurar
      if (import.meta.env.DEV) window.__dachshundEngine = engine;
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('No se pudo iniciar WebGL en este navegador.');
    }
    try {
      audioRef.current = new GameAudio(live.current.save.audio);
    } catch {
      audioRef.current = null;
    }
    return () => {
      engine?.dispose();
      engineRef.current = null;
      try {
        audioRef.current?.dispose();
      } catch {
        /* sin audio */
      }
      audioRef.current = null;
      clearTimeout(bannerTimer.current);
    };
  }, []);

  // Detecta pantallas táctiles para mostrar la cruceta
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setTouch(mq.matches || window.innerWidth < 760);
    update();
    mq.addEventListener?.('change', update);
    window.addEventListener('resize', update);
    return () => {
      mq.removeEventListener?.('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Pestaña oculta: suspende el audio
  useEffect(() => {
    const onVis = () => sound((a) => a.suspend(document.hidden));
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [sound]);

  // Primer gesto del usuario: desbloquea el audio y arranca la música
  const unlockAudio = useCallback(() => {
    sound((a) => {
      a.unlock();
      const { screen: sc, phase: ph } = live.current;
      if (sc !== 'game') a.playMusic('park');
      else if (ph !== 'paused') a.playMusic(engineRef.current?.session?.theme);
    });
  }, [sound]);

  // ---------- Acciones ----------
  const goMenu = useCallback(() => {
    const eng = engineRef.current;
    const { phase: ph } = live.current;
    if (eng?.session && ACTIVE_PHASES.includes(ph)) {
      // Partida abandonada: se guardan los premios recogidos
      persist(applyAbandon(live.current.save, { prizes: eng.session.totalCollected, maxLength: eng.session.maxLength }));
    }
    eng?.enterAttract();
    setScreen('menu');
    setResult(null);
    setHud(null);
    setConfirm(null);
    setCountdown(null);
    setBanner(null);
    sound((a) => a.playMusic('park'));
  }, [persist, sound]);

  const startGame = useCallback(
    (def, { keepCampaign = false } = {}) => {
      const eng = engineRef.current;
      if (!eng) return;
      unlockAudio();
      let sv = recordGameStarted(live.current.save);
      const tutorial = def.mode === 'level' && def.levelId === 1 && !sv.progress.tutorialSeen;
      persist(sv);
      const best = def.mode === 'level' ? sv.stats.levelBest[def.levelId] : sv.stats.endlessBest;
      gameDefRef.current = def;
      roundsRef.current = [];
      if (!keepCampaign) setCampaignScore(0);
      setResult(null);
      setConfirm(null);
      setBanner(null);
      setCountdown(null);
      setScreen('game');
      eng.startGame(def, { best, tutorial });
      sound((a) => a.playMusic(eng.session?.theme));
      sfx('select');
    },
    [persist, sfx, sound, unlockAudio],
  );

  const restart = useCallback(() => {
    if (gameDefRef.current) startGame(gameDefRef.current, { keepCampaign: true });
  }, [startGame]);

  const pause = useCallback(() => {
    if (engineRef.current?.pause()) {
      sfx('pause');
      sound((a) => a.stopMusic());
    }
  }, [sfx, sound]);

  const resume = useCallback(() => {
    setConfirm(null);
    if (engineRef.current?.resume()) {
      sfx('resume');
      sound((a) => a.playMusic(engineRef.current?.session?.theme));
    }
  }, [sfx, sound]);

  const askConfirm = useCallback(
    (kind) => {
      const ph = live.current.phase;
      if (ph === 'gameOver' || ph === 'levelComplete') {
        if (kind === 'restart') restart();
        else goMenu();
        return;
      }
      pause();
      setConfirm(kind);
    },
    [goMenu, pause, restart],
  );

  const dismissTutorial = useCallback(() => {
    persist(markTutorialSeen(live.current.save));
    engineRef.current?.beginAfterTutorial();
    sfx('select');
  }, [persist, sfx]);

  const changeAudio = useCallback(
    (patch) => {
      const next = applyAudioSettings(live.current.save, patch);
      persist(next);
      sound((a) => {
        a.unlock();
        a.setSettings(next.audio);
      });
    },
    [persist, sound],
  );

  const toggleMute = useCallback(() => changeAudio({ muted: !live.current.save.audio.muted }), [changeAudio]);

  const turn = useCallback((dir) => engineRef.current?.turn(dir), []);

  const nav = useCallback((to) => {
    sfx(to === 'menu' ? 'back' : 'select');
    setScreen(to);
  }, [sfx]);

  const resetProgress = useCallback(() => {
    const fresh = resetSave();
    setSave(fresh);
    sound((a) => a.setSettings(fresh.audio));
  }, [sound]);

  // ---------- Teclado ----------
  useEffect(() => {
    const moveFocus = (delta) => {
      const root = rootRef.current;
      if (!root) return;
      const scope = root.querySelector('.dg-modal') ?? root.querySelector('.dg-layer');
      if (!scope) return;
      const items = [...scope.querySelectorAll('[data-nav]:not(:disabled)')];
      if (!items.length) return;
      const i = items.indexOf(document.activeElement);
      const next = items[(i + delta + items.length) % items.length] ?? items[0];
      next.focus({ preventScroll: true });
      sfx('move');
    };

    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const { screen: sc, phase: ph, confirm: cf } = live.current;
      const key = e.key;
      unlockAudio();

      if (key === 'm' || key === 'M') {
        if (document.activeElement?.type !== 'range') toggleMute();
        return;
      }

      if (cf) {
        if (key === 'Escape') {
          e.preventDefault();
          setConfirm(null);
        } else if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
          e.preventDefault();
          moveFocus(key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1);
        }
        return;
      }

      if (sc === 'game') {
        const playing = ph === 'running' || ph === 'ready';
        if (playing && KEY_DIRS[key]) {
          e.preventDefault();
          turn(KEY_DIRS[key]);
          return;
        }
        if (key === 'Escape' || key === 'p' || key === 'P') {
          e.preventDefault();
          if (ph === 'paused') resume();
          else if (playing || ph === 'roundComplete') pause();
          else if (ph === 'tutorial') dismissTutorial();
          return;
        }
        if (key === 'r' || key === 'R') {
          if (['running', 'ready', 'paused', 'roundComplete', 'gameOver', 'levelComplete'].includes(ph)) {
            e.preventDefault();
            askConfirm('restart');
          }
          return;
        }
        if (key === 'Enter' && ph === 'tutorial' && document.activeElement?.tagName !== 'BUTTON') {
          e.preventDefault();
          dismissTutorial();
          return;
        }
        if (!playing && (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight')) {
          e.preventDefault();
          moveFocus(key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1);
        }
        return;
      }

      // Menús
      if (key === 'ArrowDown' || key === 'ArrowUp' || ((key === 'ArrowLeft' || key === 'ArrowRight') && sc === 'levels')) {
        if (document.activeElement?.type === 'range' && (key === 'ArrowLeft' || key === 'ArrowRight')) return;
        e.preventDefault();
        moveFocus(key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1);
      } else if ((key === 'Escape' || key === 'Backspace') && sc !== 'menu') {
        e.preventDefault();
        nav('menu');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [askConfirm, dismissTutorial, nav, pause, resume, toggleMute, turn, unlockAudio, sfx]);

  // Enfoca la primera opción al cambiar de pantalla o de capa
  const layerKey = `${loading}:${screen}:${screen === 'game' ? phase : ''}:${confirm ?? ''}:${result?.kind ?? ''}`;
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scope = root.querySelector('.dg-modal') ?? root.querySelector('.dg-layer');
    const first = scope?.querySelector('[data-nav]:not(:disabled)');
    if (first) first.focus({ preventScroll: true });
    else if (screen === 'game') root.focus({ preventScroll: true });
  }, [layerKey, screen]);

  // Deslizar el dedo sobre el tablero
  const swipe = useRef(null);
  const onPointerDown = (e) => {
    unlockAudio();
    if (screen === 'game' && e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
  };

  // ---------- Render ----------
  const inGame = screen === 'game';
  const playing = inGame && (phase === 'running' || phase === 'ready');
  const lvl = gameDefRef.current?.mode === 'level' ? gameDefRef.current.levelId : null;

  let layer = null;
  if (!inGame) {
    if (screen === 'menu')
      layer = (
        <GameMenu
          save={save}
          loading={loading}
          onPlay={() => startGame({ mode: 'level', levelId: save.progress.unlockedLevel })}
          onLevels={() => nav('levels')}
          onEndless={() => startGame({ mode: 'endless' })}
          onStats={() => nav('stats')}
          onControls={() => nav('controls')}
          onSound={() => nav('sound')}
          onExit={onExit ? () => { sfx('back'); onExit(); } : null}
          exitLabel={exitLabel}
        />
      );
    else if (screen === 'levels') layer = <LevelSelect save={save} onSelect={(id) => startGame({ mode: 'level', levelId: id })} onBack={() => nav('menu')} />;
    else if (screen === 'controls') layer = <ControlsScreen onBack={() => nav('menu')} />;
    else if (screen === 'stats') layer = <StatsScreen save={save} onReset={resetProgress} onBack={() => nav('menu')} />;
    else if (screen === 'sound') layer = <SoundSettings audio={save.audio} onChange={changeAudio} onBack={() => nav('menu')} />;
  } else if (phase === 'tutorial') {
    layer = <Tutorial onStart={dismissTutorial} touch={touch} />;
  } else if (phase === 'paused' && !confirm) {
    layer = (
      <PauseMenu
        audio={save.audio}
        onAudioChange={changeAudio}
        onResume={resume}
        onRestart={() => setConfirm('restart')}
        onMenu={() => setConfirm('menu')}
      />
    );
  } else if (result?.kind === 'gameOver') {
    layer = <GameOver result={result} onRetry={restart} onMenu={goMenu} />;
  } else if (result?.kind === 'levelComplete') {
    layer = (
      <LevelComplete
        result={result}
        campaignScore={campaignScore}
        onNext={() => startGame({ mode: 'level', levelId: Math.min(3, lvl + 1) }, { keepCampaign: true })}
        onRepeat={restart}
        onMenu={goMenu}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={`dachshund-game${inGame ? ' is-playing' : ' is-menu'}${playing ? ' is-active' : ''}`}
      tabIndex={-1}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div ref={stageRef} className="dg-stage" aria-hidden="true" />
      <div className="dg-vignette" aria-hidden="true" />

      {error && (
        <div className="dg-layer">
          <section className="dg-panel dg-panel--narrow">
            <h2 className="dg-panel__title">Dachshund 3D</h2>
            <p className="dg-text">{error}</p>
          </section>
        </div>
      )}

      {inGame && (
        <GameHUD
          hud={hud}
          paused={phase === 'paused'}
          onPause={() => (phase === 'paused' ? resume() : pause())}
          onMenu={() => askConfirm('menu')}
        />
      )}

      {inGame && phase === 'ready' && lvl === 1 && !hud?.progress && hud && (
        <p className="dg-hint">{touch ? 'Usa la cruceta para girar' : 'Gira con las flechas o WASD'}</p>
      )}

      <Countdown value={inGame && (phase === 'ready' || phase === 'running') ? countdown : null} />
      <Banner banner={inGame ? banner : null} />

      {layer && <div className={`dg-layer${inGame ? ' dg-layer--dim' : ''}`} key={screen + phase}>{layer}</div>}

      {confirm && (
        <ConfirmDialog
          title={confirm === 'restart' ? '¿Reiniciar la partida?' : '¿Volver al menú?'}
          text={confirm === 'restart' ? 'Empezarás desde el principio con la puntuación a cero.' : 'Perderás el progreso de esta partida.'}
          confirmLabel={confirm === 'restart' ? 'Reiniciar' : 'Salir al menú'}
          onConfirm={confirm === 'restart' ? restart : goMenu}
          onCancel={() => setConfirm(null)}
        />
      )}

      {inGame && touch && playing && <TouchPad onDir={turn} />}

      <button
        type="button"
        className="dg-mute"
        onClick={toggleMute}
        aria-label={save.audio.muted ? 'Activar sonido' : 'Silenciar'}
        title="Sonido (M)"
      >
        {save.audio.muted ? '🔇' : '🔊'}
      </button>

      {inGame && lvl && <span className="dg-sr">{getLevel(lvl).name}</span>}
    </div>
  );
}
