/**
 * Phase 3 — Face-turn animation controller.
 *
 * The controller schedules legal Cube moves and exposes deterministic
 * animation progress. CubeState is committed only when a move completes.
 */
import { parseMove } from '../core/cube.js';

export const DEFAULT_MOVE_DURATION_MS = 220;

export function easeInOutCubic(t) {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function moveAngleRadians(move, progress) {
  const parsed = typeof move === 'string' ? parseMove(move) : move;
  const p = Math.max(0, Math.min(1, progress));
  return (Math.PI / 2) * parsed.quarterTurns * p;
}

export class FaceTurnAnimator {
  constructor({ durationMs = DEFAULT_MOVE_DURATION_MS, easing = easeInOutCubic } = {}) {
    if (!Number.isFinite(durationMs) || durationMs <= 0) throw new Error('durationMs must be positive');
    this.durationMs = durationMs;
    this.easing = easing;
    this.queue = [];
    this.active = null;
    this.completed = [];
  }

  enqueue(...moves) {
    this.queue.push(...moves.map(move => typeof move === 'string' ? parseMove(move) : move));
    return this;
  }

  clearQueue() { this.queue.length = 0; }

  startNext() {
    if (this.active || this.queue.length === 0) return this.active;
    const move = this.queue.shift();
    this.active = { move, elapsedMs: 0, progress: 0, easedProgress: 0 };
    return this.active;
  }

  tick(deltaMs) {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new Error('deltaMs must be non-negative');
    this.startNext();
    if (!this.active) return { active: null, completed: null };

    this.active.elapsedMs = Math.min(this.durationMs, this.active.elapsedMs + deltaMs);
    this.active.progress = this.active.elapsedMs / this.durationMs;
    this.active.easedProgress = this.easing(this.active.progress);

    if (this.active.progress >= 1) {
      const completed = this.active.move;
      this.completed.push(completed);
      this.active = null;
      return { active: null, completed };
    }

    return { active: this.active, completed: null };
  }

  get isAnimating() { return this.active !== null; }
  get queuedCount() { return this.queue.length; }
  get busy() { return this.isAnimating || this.queue.length > 0; }
}

export function getLayerCubieIds(cubeState, move) {
  const actual = typeof move === 'string' ? parseMove(move) : move;
  const axisIndex = { x: 0, y: 1, z: 2 }[actual.axis];
  return [...cubeState.cubies.values()]
    .filter(cubie => cubie.position[axisIndex] === actual.layer)
    .filter(cubie => !['M', 'E', 'S'].includes(actual.face) || cubie.position.filter(v => v !== 0).length === 2)
    .map(cubie => cubie.id);
}
