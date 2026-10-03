/**
 * Phase 3 — Adapter that applies temporary face-turn transforms to a
 * RubikRenderer. It never mutates CubeState while a turn is in progress.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { parseMove, } from '../core/cube.js';
import { getLayerCubieIds, moveAngleRadians } from '../animation/face-turn-animator.js';

const AXIS = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1)
};

export class FaceTurnRenderAdapter {
  constructor(renderer) {
    this.renderer = renderer;
    this.turnGroup = new THREE.Group();
    this.turnGroup.name = 'active-face-turn';
    this.renderer.cubeGroup.add(this.turnGroup);
    this.activeIds = [];
    this.activeMove = null;
    this.axis = null;
    this.layerCenter = 0;
  }

  begin(cubeState, move) {
    if (this.activeMove) throw new Error('A face turn is already active');
    const parsed = typeof move === 'string' ? parseMove(move) : move;
    this.activeMove = parsed;
    this.activeIds = getLayerCubieIds(cubeState, parsed);
    this.axis = AXIS[parsed.axis];
    this.layerCenter = parsed.layer * this.renderer.spacing;
    this.turnGroup.position.set(
      this.axis.x * this.layerCenter,
      this.axis.y * this.layerCenter,
      this.axis.z * this.layerCenter
    );
    this._lastAngle = 0;

    for (const id of this.activeIds) {
      const cubie = this.renderer.objects.get(id);
      if (!cubie) throw new Error(`Renderer is missing cubie ${id}`);
      this.turnGroup.attach(cubie);
    }
    return parsed;
  }

  update(progress) {
    if (!this.activeMove) return;
    this.turnGroup.rotateOnAxis(this.axis, moveAngleRadians(this.activeMove, progress) - this._lastAngle);
    this._lastAngle = moveAngleRadians(this.activeMove, progress);
  }

  finish() {
    if (!this.activeMove) return;
    for (const id of this.activeIds) {
      const cubie = this.renderer.objects.get(id);
      this.renderer.cubeGroup.attach(cubie);
    }
    this.turnGroup.position.set(0, 0, 0);
    this.turnGroup.rotation.set(0, 0, 0);
    this._lastAngle = 0;
    this.activeIds = [];
    this.activeMove = null;
  }
}
