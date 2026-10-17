import { describe, it, expect } from 'vitest';
import { createSnake, queueDirection, stepSnake, growSnake, snakeLength, collisionAt } from './gameLogic';

const world = (cols = 10, rows = 10, obstacles = []) => ({
  cols, rows, obstacleSet: new Set(obstacles.map((o) => o.y * cols + o.x)),
});

describe('movimiento', () => {
  it('avanza una casilla por paso en la dirección actual', () => {
    const s = createSnake({ x: 4, y: 5, dir: 'right', length: 3 });
    stepSnake(s, world());
    expect(s.segments).toEqual([{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
    expect(s.prevSegments[0]).toEqual({ x: 4, y: 5 });
  });

  it('no permite girar 180° ni siquiera con dos pulsaciones rápidas', () => {
    const s = createSnake({ x: 4, y: 5, dir: 'right' });
    expect(queueDirection(s, 'left')).toBe(false);
    expect(queueDirection(s, 'up')).toBe(true);
    // 'down' es contrario a la última encolada ('up') → rechazado
    expect(queueDirection(s, 'down')).toBe(false);
    expect(queueDirection(s, 'left')).toBe(true);
    stepSnake(s, world());
    stepSnake(s, world());
    expect(s.segments[0]).toEqual({ x: 3, y: 4 });
    expect(s.segments[1]).toEqual({ x: 4, y: 4 });
  });

  it('limita la cola de giros a dos', () => {
    const s = createSnake({ x: 4, y: 5, dir: 'right' });
    queueDirection(s, 'up');
    queueDirection(s, 'left');
    expect(queueDirection(s, 'down')).toBe(false);
    expect(s.queue.length).toBe(2);
  });
});

describe('colisiones', () => {
  it('detecta los límites del tablero', () => {
    const s = createSnake({ x: 9, y: 0, dir: 'right' });
    const r = stepSnake(s, world());
    expect(r).toMatchObject({ dead: true, cause: 'wall' });
    expect(s.segments[0]).toEqual({ x: 9, y: 0 });
  });

  it('detecta obstáculos', () => {
    const s = createSnake({ x: 4, y: 4, dir: 'right' });
    expect(stepSnake(s, world(10, 10, [{ x: 5, y: 4 }])).cause).toBe('obstacle');
  });

  it('detecta el propio cuerpo', () => {
    const s = createSnake({ x: 5, y: 5, dir: 'right', length: 5 });
    queueDirection(s, 'down'); stepSnake(s, world());
    queueDirection(s, 'left'); stepSnake(s, world());
    queueDirection(s, 'up');
    expect(stepSnake(s, world()).cause).toBe('self');
  });

  it('permite entrar en la casilla que deja libre la cola', () => {
    const s = createSnake({ x: 5, y: 5, dir: 'right', length: 4 });
    queueDirection(s, 'down'); stepSnake(s, world());
    queueDirection(s, 'left'); stepSnake(s, world());
    queueDirection(s, 'up');
    // cuadrado 2x2 con longitud 4: la cabeza persigue a la cola
    expect(stepSnake(s, world()).dead).toBe(false);
  });

  it('la cola cuenta como obstáculo si el perro está creciendo', () => {
    const s = createSnake({ x: 5, y: 5, dir: 'right', length: 4 });
    queueDirection(s, 'down'); stepSnake(s, world());
    queueDirection(s, 'left'); stepSnake(s, world());
    growSnake(s, 1);
    expect(collisionAt(s, world(), 5, 5)).toBe('self');
  });
});

describe('crecimiento', () => {
  it('crece una casilla por premio y mantiene la longitud real', () => {
    const s = createSnake({ x: 2, y: 2, dir: 'right', length: 3 });
    growSnake(s, 1);
    expect(snakeLength(s)).toBe(4);
    stepSnake(s, world());
    expect(s.segments.length).toBe(4);
    expect(s.grewLastStep).toBe(true);
    stepSnake(s, world());
    expect(s.segments.length).toBe(4);
    expect(s.grewLastStep).toBe(false);
  });
});
