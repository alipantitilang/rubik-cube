/** Generic layer-turn animation controller. */
import { createTurn } from '../core/turn.js';

export const DEFAULT_MOVE_DURATION_MS = 220;
export function easeInOutCubic(t) {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
export function moveAngleRadians(turn, progress) {
  const parsed = createTurn(turn);
  const p = Math.max(0, Math.min(1, progress));
  return (Math.PI / 2) * parsed.quarterTurns * p;
}

export class TurnAnimator {
  constructor({ durationMs = DEFAULT_MOVE_DURATION_MS, easing = easeInOutCubic } = {}) {
    if (!Number.isFinite(durationMs) || durationMs <= 0) throw new Error('durationMs must be positive');
    this.durationMs = durationMs;
    this.easing = easing;
    this.queue = [];
    this.active = null;
    this.completed = [];
  }
  enqueue(...turns) { this.queue.push(...turns.map(createTurn)); return this; }
  clearQueue() { this.queue.length = 0; }
  startNext() {
    if (this.active || this.queue.length === 0) return this.active;
    const turn = this.queue.shift();
    this.active = { turn, move: turn, elapsedMs: 0, progress: 0, easedProgress: 0 };
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
      const completed = this.active.turn;
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

export function getLayerCubieIds(cubeState, turn) {
  const actual = createTurn(turn);
  const axisIndex = { x: 0, y: 1, z: 2 }[actual.axis];
  return [...cubeState.cubies.values()]
    .filter(cubie => cubie.position[axisIndex] === actual.layer)
    .map(cubie => cubie.id);
}
