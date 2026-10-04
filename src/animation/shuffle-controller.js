/**
 * Phase 6 — Coordinates legal scramble playback with CubeTurnRuntime.
 *
 * This controller owns the shuffle/play lifecycle but does not mutate
 * CubeState itself. CubeTurnRuntime remains the only move commit path.
 */
import { DEFAULT_SCRAMBLE_LENGTH, generateScramble, scrambleSummary } from '../core/shuffle.js';

export const SHUFFLE_STATES = Object.freeze({
  IDLE: 'idle',
  SCRAMBLING: 'scrambling',
  PREVIEW: 'preview',
  PLAYING: 'playing',
  PAUSED: 'paused'
});

export const DEFAULT_SHUFFLE_DURATION_MS = 90;

export class ShuffleController {
  constructor({
    runtime,
    interaction = null,
    length = DEFAULT_SCRAMBLE_LENGTH,
    durationMs = DEFAULT_SHUFFLE_DURATION_MS,
    avoidSameAxis = true,
    random = Math.random,
    onStateChange = null,
    onProgress = null
  } = {}) {
    if (!runtime) throw new Error('ShuffleController requires runtime.');
    if (!Number.isInteger(length) || length < 1) throw new RangeError('length must be a positive integer');
    if (!Number.isFinite(durationMs) || durationMs <= 0) throw new RangeError('durationMs must be positive');
    if (typeof random !== 'function') throw new TypeError('random must be a function');

    this.runtime = runtime;
    this.interaction = interaction;
    this.length = length;
    this.durationMs = durationMs;
    this.avoidSameAxis = Boolean(avoidSameAxis);
    this.random = random;
    this.state = SHUFFLE_STATES.IDLE;
    this.scramble = Object.freeze([]);
    this.completedMoves = 0;
    this.onStateChange = onStateChange;
    this.onProgress = onProgress;
  }

  get busy() { return this.state === SHUFFLE_STATES.SCRAMBLING || this.runtime.busy; }
  get canPlay() { return this.state === SHUFFLE_STATES.IDLE && !this.runtime.busy; }
  get canStart() { return this.state === SHUFFLE_STATES.PREVIEW && !this.runtime.busy; }
  get canPause() { return this.state === SHUFFLE_STATES.PLAYING && !this.runtime.busy; }
  get canResume() { return this.state === SHUFFLE_STATES.PAUSED && !this.runtime.busy; }
  get scrambleText() { return scrambleSummary(this.scramble); }

  play({ length = this.length, seed } = {}) {
    if (!this.canPlay) return false;

    this.scramble = generateScramble({
      length,
      seed,
      random: seed === undefined ? this.random : undefined,
      avoidSameAxis: this.avoidSameAxis
    });
    this.completedMoves = 0;
    this._setState(SHUFFLE_STATES.SCRAMBLING);
    this.interaction?.setEnabled?.(false);

    const animator = this.runtime.animator;
    this._previousDuration = animator.durationMs;
    animator.durationMs = this.durationMs;
    this.onProgress?.({ completed: 0, total: this.scramble.length, scramble: this.scramble });
    try {
      this.runtime.enqueue(...this.scramble);
    } catch (error) {
      this.runtime.animator.durationMs = this._previousDuration;
      this._setState(SHUFFLE_STATES.IDLE);
      this.interaction?.setEnabled?.(false);
      throw error;
    }
    return true;
  }

  handleTick(result) {
    if (this.state !== SHUFFLE_STATES.SCRAMBLING) return;

    if (result.completed) {
      this.completedMoves += 1;
      this.onProgress?.({
        completed: this.completedMoves,
        total: this.scramble.length,
        scramble: this.scramble,
        move: result.completed
      });
    }

    if (this.completedMoves >= this.scramble.length && !this.runtime.busy) {
      this.runtime.animator.durationMs = this._previousDuration;
      this._setState(SHUFFLE_STATES.PREVIEW);
      // Preview must remain pointer-active so the user can rotate the Rubik.
      // Layer moves are blocked by ManualInteractionController.viewOnly.
      this.interaction?.setEnabled?.(true);
      this.onProgress?.({ completed: this.scramble.length, total: this.scramble.length, scramble: this.scramble });
    }
  }

  start() {
    if (!this.canStart) return false;
    this._setState(SHUFFLE_STATES.PLAYING);
    this.interaction?.setEnabled?.(true);
    return true;
  }

  pause() {
    if (!this.canPause) return false;
    this._setState(SHUFFLE_STATES.PAUSED);
    // Keep pointer input enabled while paused; viewOnly blocks layer turns
    // but still permits empty-space cube rotation and zoom.
    this.interaction?.setEnabled?.(true);
    return true;
  }

  resume() {
    if (!this.canResume) return false;
    this._setState(SHUFFLE_STATES.PLAYING);
    this.interaction?.setEnabled?.(true);
    return true;
  }

  reset() {
    if (this.runtime.busy) this.runtime.cancel();
    if (this._previousDuration !== undefined) this.runtime.animator.durationMs = this._previousDuration;
    this.scramble = Object.freeze([]);
    this.completedMoves = 0;
    this._setState(SHUFFLE_STATES.IDLE);
    this.interaction?.setEnabled?.(true);
  }

  _setState(next) {
    if (this.state === next) return;
    this.state = next;
    this.onStateChange?.(next);
  }
}
