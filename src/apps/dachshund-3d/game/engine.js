import * as THREE from 'three';
import { createStage, fitCamera } from './three/scene';
import { createBoard, cellToWorld } from './three/board';
import { Dachshund } from './three/dachshund';
import { FoodField } from './three/foodModels';
import { Particles } from './three/particles';
import { ObstacleField } from './three/obstacles3d';
import { createDecor, createStarfield } from './three/decor';
import { getTheme } from './three/themes';
import { DIRS } from './logic/gameLogic';
import { createSession, hudSnapshot, startNextRound, tickSession, turn } from './logic/session';

// Motor del juego: une la simulación por casillas (pasos lógicos a intervalo fijo)
// con el renderizado a la frecuencia de requestAnimationFrame, interpolando entre pasos.
//
// Fases: attract (menú) · tutorial · ready (cuenta atrás) · running · paused
//        roundComplete (modo infinito) · levelComplete · dying · gameOver

const READY_SECONDS = 3;
const ROUND_READY_SECONDS = 2;
const ROUND_CELEBRATION = 1.8;
const DYING_SECONDS = 1.1;

// Dirección de pantalla → dirección lógica cuando la vista está girada (pantallas verticales)
const PORTRAIT_MAP = { up: 'left', right: 'up', down: 'right', left: 'down' };
const PORTRAIT_INV = { left: 'up', up: 'right', right: 'down', down: 'left' };

const PRIZE_COLORS = { bone: 0x8fdcff, cookie: 0xffa040 };
const CONFETTI = [0x55d6ff, 0xffd84a, 0xff6bd6, 0x7dff9a, 0xffffff];

export class GameEngine {
  constructor(container, onEvent = () => {}) {
    this.container = container;
    this.onEvent = onEvent;
    this.disposed = false;

    const { renderer, scene, camera, applyTheme } = createStage(container);
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.applyLights = applyTheme;

    this.world = new THREE.Group();
    this.scene.add(this.world);
    this.starfield = createStarfield();
    this.scene.add(this.starfield.points);

    this.dog = new Dachshund({ maxUnits: 300 });
    this.world.add(this.dog.group);
    this.food = new FoodField(this.world);
    this.obstacles = new ObstacleField(this.world);

    this.board = null;
    this.decor = null;
    this.boardKey = '';
    this.themeKey = '';
    this.particles = null;

    this.phase = 'attract';
    this.pausedFrom = null;
    this.session = null;
    this.best = 0;
    this.acc = 0;
    this.ticks = 0;
    this.time = 0;
    this.phaseTime = 0;
    this.lastCount = null;
    this.joy = 0;
    this.victory = 0;
    this.defeat = 0;
    this.shake = 0;
    this.confettiTimer = 0;
    this.orientation = 'landscape';
    this.cameraBase = null;
    this.points = [];
    for (let i = 0; i < 320; i++) this.points.push({ x: 0, z: 0 });

    this.setBoard(20, 14, 'park');
    this.enterAttract();

    // Tamaño del contenedor
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    // Pausa automática al cambiar de pestaña o perder el foco
    this.onHidden = () => {
      if (document.hidden) this.autoPause();
    };
    this.onBlur = () => this.autoPause();
    document.addEventListener('visibilitychange', this.onHidden);
    window.addEventListener('blur', this.onBlur);

    this.last = performance.now();
    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
  }

  emit(e) {
    if (!this.disposed) this.onEvent(e);
  }

  // ---------- Escenario ----------

  setBoard(cols, rows, themeKey) {
    const theme = getTheme(themeKey);
    const key = `${cols}x${rows}:${themeKey}`;
    if (key !== this.boardKey) {
      this.board?.dispose();
      this.board = createBoard(cols, rows, theme);
      this.world.add(this.board.group);
      this.boardKey = key;
      if (!this.particles) this.particles = new Particles(this.world, 240, this.board.glowTexture);
      else this.particles.material.map = this.board.glowTexture;
      this.particles.material.needsUpdate = true;
    }
    if (themeKey !== this.themeKey || !this.decor || this.decorDims !== `${cols}x${rows}`) {
      this.decor?.dispose();
      this.decor = createDecor(theme, cols, rows);
      this.decorDims = `${cols}x${rows}`;
      this.world.add(this.decor.group);
      this.applyTheme(theme);
      this.themeKey = themeKey;
    }
    this.cols = cols;
    this.rows = rows;
    this.updateCamera();
  }

  applyTheme(theme) {
    this.applyLights(theme);
    this.starfield.setColor(theme.stars);
    this.obstacles.setStyle(theme);
  }

  resize() {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(w, h, false);
    this.aspect = w / h;
    this.updateCamera();
  }

  updateCamera() {
    if (!this.aspect || !this.cols) return;
    if (this.phase === 'attract') {
      this.camera.aspect = this.aspect;
      this.camera.fov = this.aspect < 1 ? 55 : 42;
      this.camera.updateProjectionMatrix();
      this.cameraBase = null;
      return;
    }
    // Histéresis para no alternar la orientación con cambios mínimos de tamaño
    const wantPortrait = this.cols > this.rows && this.aspect < (this.orientation === 'portrait' ? 0.95 : 0.8);
    this.orientation = wantPortrait ? 'portrait' : 'landscape';
    const narrow = this.aspect < 1;
    this.cameraBase = fitCamera(this.camera, {
      cols: this.cols,
      rows: this.rows,
      aspect: this.aspect,
      orientation: this.orientation,
      margin: narrow ? { x: 0.94, top: 0.68, bottom: -0.5 } : { x: 0.9, top: 0.76, bottom: -0.92 },
    });
  }

  // ---------- Modos ----------

  enterAttract() {
    this.phase = 'attract';
    this.session = null;
    this.food.clear();
    this.obstacles.clear();
    this.particles?.clear();
    this.setBoard(20, 14, 'park');
    this.joy = this.victory = this.defeat = 0;
    this.dog.resetHeading();
    // Premios decorativos en el menú
    this.food.add({ id: -1, type: 'bone' }, { x: 3.4, z: 0 });
    this.food.add({ id: -2, type: 'cookie' }, { x: 8.2, z: -3.5 });
    this.updateCamera();
    this.emit({ type: 'phase', phase: 'attract' });
  }

  /** def: { mode: 'level', levelId } | { mode: 'endless' }; opts: { best, tutorial } */
  startGame(def, { best = 0, tutorial = false } = {}) {
    this.session = createSession(def);
    this.best = best;
    this.particles?.clear();
    this.syncBoard(true);
    this.joy = this.victory = this.defeat = 0;
    this.shake = 0;
    if (tutorial) this.setPhase('tutorial');
    else this.beginReady(READY_SECONDS);
    this.emitHud();
  }

  beginAfterTutorial() {
    if (this.phase === 'tutorial') this.beginReady(READY_SECONDS);
  }

  restart(opts = {}) {
    if (!this.session) return;
    const def = this.session.mode === 'level' ? { mode: 'level', levelId: this.session.levelId } : { mode: 'endless' };
    this.startGame(def, { best: opts.best ?? this.best });
  }

  syncBoard(animateObstacles) {
    const s = this.session;
    this.phase = 'syncing';
    this.setBoard(s.cols, s.rows, s.theme);
    this.food.clear();
    for (const f of s.foods) this.food.add(f, cellToWorld(f.x, f.y, s.cols, s.rows));
    this.obstacles.setCells(s.obstacles, { cols: s.cols, rows: s.rows }, animateObstacles);
    this.acc = 0;
    this.ticks = 0;
    this.dog.resetHeading();
  }

  setPhase(phase) {
    this.phase = phase;
    this.emit({ type: 'phase', phase });
  }

  beginReady(seconds) {
    this.phaseTime = seconds;
    this.lastCount = null;
    this.acc = 0;
    this.setPhase('ready');
  }

  emitHud() {
    if (this.session) this.emit({ type: 'hud', hud: hudSnapshot(this.session, this.best) });
  }

  // ---------- Controles ----------

  /** dir en coordenadas de pantalla (arriba = hacia la parte superior de la pantalla). */
  turn(screenDir) {
    if (!this.session || (this.phase !== 'running' && this.phase !== 'ready')) return false;
    const dir = this.orientation === 'portrait' ? PORTRAIT_MAP[screenDir] : screenDir;
    return turn(this.session, dir);
  }

  /** Dirección de pantalla correspondiente a la dirección lógica (para el tutorial y el D-pad). */
  screenDirOf(dir) {
    return this.orientation === 'portrait' ? PORTRAIT_INV[dir] : dir;
  }

  pause() {
    if (this.phase === 'running' || this.phase === 'ready' || this.phase === 'roundComplete') {
      this.pausedFrom = this.phase;
      this.setPhase('paused');
      return true;
    }
    return false;
  }

  resume() {
    if (this.phase !== 'paused') return false;
    const back = this.pausedFrom ?? 'running';
    this.pausedFrom = null;
    // Se descartan los giros pendientes y el tiempo acumulado: no hay movimientos en cola al reanudar
    if (this.session) this.session.snake.queue.length = 0;
    this.acc = 0;
    if (back === 'running') this.beginReady(1);
    else this.setPhase(back);
    return true;
  }

  autoPause() {
    if (this.pause()) this.emit({ type: 'autoPause' });
  }

  // ---------- Bucle ----------

  frame(now) {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    const paused = this.phase === 'paused';
    const adt = paused ? 0 : dt;
    this.time += adt;

    this.updateLogic(adt);
    this.updateVisuals(adt);
    this.renderer.render(this.scene, this.camera);
  }

  updateLogic(dt) {
    const s = this.session;
    switch (this.phase) {
      case 'ready': {
        this.phaseTime -= dt;
        const n = Math.ceil(this.phaseTime);
        if (n !== this.lastCount && n > 0) {
          this.lastCount = n;
          this.emit({ type: 'countdown', value: n });
        }
        if (this.phaseTime <= 0) {
          this.emit({ type: 'countdown', value: 0 });
          this.setPhase('running');
        }
        break;
      }
      case 'running': {
        this.acc += dt * 1000;
        s.elapsedMs += dt * 1000;
        s.roundElapsedMs += dt * 1000;
        let guard = 0;
        while (this.acc >= s.tickMs && guard++ < 8) {
          this.acc -= s.tickMs;
          this.ticks++;
          this.handleEvents(tickSession(s));
          if (s.status !== 'running') {
            this.acc = 0;
            break;
          }
        }
        break;
      }
      case 'roundComplete':
        this.phaseTime -= dt;
        if (this.phaseTime <= 0) {
          startNextRound(s);
          this.syncBoard(true);
          this.victory = 0;
          this.emitHud();
          this.emit({ type: 'roundStart', round: s.round });
          this.beginReady(ROUND_READY_SECONDS);
        }
        break;
      case 'dying':
        this.phaseTime -= dt;
        if (this.phaseTime <= 0) {
          this.setPhase('gameOver');
          this.emit({ type: 'gameOver', result: this.result() });
        }
        break;
      default:
        break;
    }
  }

  result() {
    const s = this.session;
    return {
      mode: s.mode,
      levelId: s.levelId,
      score: s.score,
      round: s.round,
      prizes: s.totalCollected,
      progress: s.progress,
      target: s.target,
      maxLength: s.maxLength,
      timeMs: Math.round(s.elapsedMs),
      cause: s.deathCause,
    };
  }

  handleEvents(events) {
    const s = this.session;
    let hud = false;
    for (const e of events) {
      if (e.type === 'eat') {
        const w = cellToWorld(e.prize.x, e.prize.y, s.cols, s.rows);
        this.food.collect(e.prize.id);
        this.particles.burst(w.x, 0.55, w.z, PRIZE_COLORS[e.prize.type], 26);
        this.joy = 1;
        hud = true;
        this.emit({ type: 'eat', prize: e.prize, points: e.points });
      } else if (e.type === 'spawn') {
        this.food.add(e.prize, cellToWorld(e.prize.x, e.prize.y, s.cols, s.rows));
      } else if (e.type === 'obstacles') {
        this.obstacles.addCells(e.cells);
        for (const c of e.cells) {
          const w = cellToWorld(c.x, c.y, s.cols, s.rows);
          this.particles.burst(w.x, 0.4, w.z, getTheme(s.theme).obstacleEmissive, 12, 1.6);
        }
        this.emit({ type: 'obstacles', count: e.cells.length });
      } else if (e.type === 'death') {
        const head = s.snake.segments[0];
        const w = cellToWorld(head.x, head.y, s.cols, s.rows);
        this.particles.burst(w.x, 0.8, w.z, 0xff4060, 30, 2.4);
        this.shake = 0.35;
        this.phaseTime = DYING_SECONDS;
        this.setPhase('dying');
        this.emit({ type: 'death', cause: e.cause });
      } else if (e.type === 'objective') {
        if (s.mode === 'endless') {
          this.phaseTime = ROUND_CELEBRATION;
          this.setPhase('roundComplete');
          this.emit({ type: 'roundComplete', round: s.round, score: s.score, roundTimeMs: Math.round(s.roundElapsedMs) });
        } else {
          this.setPhase('levelComplete');
          this.emit({ type: 'levelComplete', result: this.result() });
        }
      }
    }
    if (hud) this.emitHud();
  }

  // ---------- Visuales ----------

  buildGamePath(alpha) {
    const s = this.session;
    const snake = s.snake;
    const cur = snake.segments;
    const prev = snake.prevSegments;
    const n = cur.length;
    const pts = this.points;
    let k = 0;
    const put = (x, y) => {
      const w = cellToWorld(x, y, s.cols, s.rows);
      pts[k].x = w.x;
      pts[k].z = w.z;
      k++;
    };
    const p0 = prev[0] ?? cur[0];
    put(p0.x + (cur[0].x - p0.x) * alpha, p0.y + (cur[0].y - p0.y) * alpha);
    for (let i = 1; i < n && k < pts.length - 1; i++) put(cur[i].x, cur[i].y);
    if (!snake.grewLastStep && prev.length === n) {
      const a = prev[n - 1];
      const b = cur[n - 1];
      put(a.x + (b.x - a.x) * alpha, a.y + (b.y - a.y) * alpha);
    }
    return pts.slice(0, k);
  }

  buildAttractPath(t) {
    // Recorrido ovalado en el centro del tablero
    const pts = [];
    const speed = 1.5;
    const R = 3.2;
    for (let i = 0; i < 9; i++) {
      const u = (t * speed - i * 0.42) / R;
      pts.push({ x: 3.4 + Math.cos(u) * R * 1.1, z: Math.sin(u) * R * 0.7 });
    }
    return pts;
  }

  updateVisuals(dt) {
    const t = this.time;
    const s = this.session;
    const ph = this.phase;

    this.joy = Math.max(0, this.joy - dt / 0.6);
    const wantVictory = ph === 'levelComplete' || ph === 'roundComplete' ? 1 : 0;
    const wantDefeat = ph === 'dying' || ph === 'gameOver' ? 1 : 0;
    this.victory += (wantVictory - this.victory) * Math.min(1, dt * 6);
    this.defeat += (wantDefeat - this.defeat) * Math.min(1, dt * 7);

    if (ph === 'attract' || !s) {
      const pts = this.buildAttractPath(t);
      this.dog.update(pts, { dt, time: t, stride: t * 1.5, moving: 1, joy: 0, victory: 0, defeat: 0 });
      const a = t * 0.12;
      const narrow = this.aspect < 1;
      this.camera.position.set(Math.sin(a) * 2.5 + (narrow ? 3.4 : 1.2), narrow ? 9 : 6.2, Math.cos(a) * 1.5 + (narrow ? 11 : 8.5));
      this.camera.lookAt(narrow ? 3.4 : 1.6, 0.3, narrow ? 1.5 : 0);
    } else {
      const running = ph === 'running';
      const alpha = running ? Math.min(1, this.acc / s.tickMs) : 1;
      const pts = this.buildGamePath(alpha);
      const q = s.snake.queue[0];
      const look = q ? { x: DIRS[q].x, z: DIRS[q].y } : null;
      this.dog.update(pts, {
        dt,
        time: t,
        stride: this.ticks + alpha,
        moving: running ? 1 : 0,
        look,
        joy: this.joy,
        victory: this.victory,
        defeat: this.defeat,
      });

      if (this.victory > 0.5) {
        this.confettiTimer -= dt;
        if (this.confettiTimer <= 0) {
          this.confettiTimer = 0.28;
          const head = s.snake.segments[0];
          const w = cellToWorld(head.x, head.y, s.cols, s.rows);
          this.particles.burst(w.x, 1.2, w.z, CONFETTI[Math.floor(Math.random() * CONFETTI.length)], 14, 2.2, 3);
        }
      }

      if (this.cameraBase) {
        this.shake = Math.max(0, this.shake - dt);
        const k = this.shake * this.shake * 0.9;
        this.camera.position.set(
          this.cameraBase.position.x + (Math.random() - 0.5) * k,
          this.cameraBase.position.y + (Math.random() - 0.5) * k,
          this.cameraBase.position.z + (Math.random() - 0.5) * k,
        );
        this.camera.lookAt(this.cameraBase.target);
      }
    }

    this.food.update(dt, t);
    this.obstacles.update(dt, t);
    this.particles?.update(dt);
    this.board?.update(t);
    this.decor?.update(t);
    this.starfield.update(t);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', this.onHidden);
    window.removeEventListener('blur', this.onBlur);
    this.dog.dispose();
    this.food.dispose();
    this.obstacles.dispose();
    this.particles?.dispose();
    this.board?.dispose();
    this.decor?.dispose();
    this.starfield.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
    this.renderer.domElement.remove();
    this.session = null;
  }
}
