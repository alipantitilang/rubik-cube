import { CubeState, parseMove } from '../core/cube.js';
import { FaceTurnAnimator } from './face-turn-animator.js';

/** Coordinates queued animation and interactive drag turns with authoritative CubeState commits. */
export class CubeTurnRuntime {
  constructor({ cubeState = new CubeState(), animator = new FaceTurnAnimator(), adapter = null, renderer = null } = {}) {
    this.cubeState = cubeState;
    this.animator = animator;
    this.adapter = adapter;
    this.renderer = renderer;
    this.interactive = null;
  }

  enqueue(...moves) {
    if (this.interactive) throw new Error('Cannot enqueue a move during an interactive turn.');
    this.animator.enqueue(...moves);
    return this;
  }

  /** Begin a direct pointer-driven face turn. CubeState is not changed yet. */
  beginInteractive(move) {
    if (this.busy || this.interactive) return false;
    const parsed = typeof move === 'string' ? parseMove(move) : move;
    if (!this.adapter) throw new Error('Interactive turns require a render adapter.');
    this.adapter.begin(this.cubeState, parsed);
    this.interactive = { move: parsed, progress: 0, settling: null };
    return true;
  }

  /** Update the visible face turn directly from pointer displacement. */
  updateInteractive(progress) {
    if (!this.interactive) return false;
    if (!Number.isFinite(progress)) throw new TypeError('Interactive progress must be finite.');
    const clamped = Math.max(0, Math.min(1, progress));
    this.interactive.progress = clamped;
    this.adapter?.update(clamped);
    return true;
  }

  /** Snap an interactive drag to a quarter-turn or back to its starting state. */
  endInteractive({ commit, durationMs = 120 } = {}) {
    if (!this.interactive) return false;
    const target = commit ? 1 : 0;
    this.interactive.settling = {
      from: this.interactive.progress,
      to: target,
      elapsedMs: 0,
      durationMs: Math.max(0, Number(durationMs) || 0)
    };
    if (this.interactive.settling.durationMs === 0) {
      this._finishInteractive(target === 1);
    }
    return true;
  }

  cancel() {
    if (this.interactive) {
      this.interactive = null;
      this.adapter?.finish();
    }
    if (this.adapter) this.adapter.finish();
    this.animator.clearQueue();
    this.animator.active = null;
    if (this.renderer) this.renderer.renderCube(this.cubeState);
    return { cancelled: true, cubeState: this.cubeState };
  }

  tick(deltaMs) {
    if (!Number.isFinite(deltaMs) || deltaMs < 0) throw new Error('deltaMs must be non-negative');

    if (this.interactive) {
      const settling = this.interactive.settling;
      if (settling) {
        settling.elapsedMs = Math.min(settling.durationMs, settling.elapsedMs + deltaMs);
        const t = settling.durationMs === 0 ? 1 : settling.elapsedMs / settling.durationMs;
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const progress = settling.from + (settling.to - settling.from) * eased;
        this.interactive.progress = progress;
        this.adapter?.update(progress);
        if (t >= 1) this._finishInteractive(settling.to === 1);
      }
      return { active: this.interactive, completed: null, cubeState: this.cubeState };
    }

    const before = this.animator.active;
    const result = this.animator.tick(deltaMs);

    if (!before && this.animator.active && this.adapter) {
      this.adapter.begin(this.cubeState, this.animator.active.move);
    }

    if (this.animator.active && this.adapter) {
      this.adapter.update(this.animator.active.easedProgress);
    }

    if (result.completed) {
      if (this.adapter) this.adapter.finish();
      this.cubeState = this.cubeState.applyMove(result.completed);
      if (this.renderer) this.renderer.renderCube(this.cubeState);
    }

    return { ...result, cubeState: this.cubeState };
  }

  _finishInteractive(commit) {
    const active = this.interactive;
    if (!active) return;
    if (commit) {
      this.adapter?.update(1);
      this.adapter?.finish();
      this.cubeState = this.cubeState.applyMove(active.move);
      this.renderer?.renderCube(this.cubeState);
    } else {
      this.adapter?.update(0);
      this.adapter?.finish();
      this.renderer?.renderCube(this.cubeState);
    }
    this.interactive = null;
  }

  get isAnimating() { return this.interactive !== null || this.animator.isAnimating; }
  get busy() { return this.interactive !== null || this.animator.busy; }
}
