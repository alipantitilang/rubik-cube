import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { createCubeOrientationState, rotateCubeByScreenDelta } from './cube-orientation-state.js';

export class CubeOrientationController {
  constructor({ object, camera = null, state = {}, onChange = null } = {}) {
    if (!object) throw new Error('CubeOrientationController requires object.');
    this.object = object;
    this.camera = camera;
    this.state = createCubeOrientationState(state);
    this.onChange = onChange;
    this.apply();
  }

  apply() {
    const q = this.state.quaternion;
    this.object.quaternion.set(q[0], q[1], q[2], q[3]);
    this.object.updateMatrixWorld(true);
    this.onChange?.(this.state);
  }

  rotateByScreenDelta(dx, dy) {
    const right = new THREE.Vector3(1, 0, 0);
    const up = new THREE.Vector3(0, 1, 0);
    if (this.camera) {
      right.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
      up.setFromMatrixColumn(this.camera.matrixWorld, 1).normalize();
    }
    rotateCubeByScreenDelta(this.state, {
      dx,
      dy,
      cameraRight: [right.x, right.y, right.z],
      cameraUp: [up.x, up.y, up.z]
    });
    this.apply();
  }

  reset() {
    this.state = createCubeOrientationState();
    this.apply();
  }

  dispose() {}
}
