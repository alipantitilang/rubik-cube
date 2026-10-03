import { CubeState } from '../core/cube.js';
import { FaceTurnAnimator } from './face-turn-animator.js';

/** Coordinates animation progress with authoritative CubeState commits. */
export class CubeTurnRuntime {
  constructor({ cubeState = new CubeState(), animator = new FaceTurnAnimator(), adapter = null, renderer = null } = {}) {
    this.cubeState = cubeState;
    this.animator = animator;
    this.adapter = adapter;
    this.renderer = renderer;
  }

  enqueue(...moves) {
    this.animator.enqueue(...moves);
    return this;
  }

  tick(deltaMs) {
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

  get isAnimating() { return this.animator.isAnimating; }
  get busy() { return this.animator.busy; }
}
