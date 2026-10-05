import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import {
  DEFAULT_CAMERA_VIEW,
  createCameraViewState,
  distanceToZoomPercent,
  getCameraPosition,
  orbit,
  resetCameraView,
  setDistance,
  zoomPercentToDistance
} from './camera-view-state.js';

export class CameraController {
  constructor({ camera, domElement, state = {}, onChange = null } = {}) {
    if (!camera || !domElement) throw new Error('CameraController requires camera and domElement.');
    this.camera = camera;
    this.domElement = domElement;
    this.state = createCameraViewState(state);
    this.onChange = onChange;
    this.enabled = true;
    this.pointerOrbitEnabled = true;
    this._drag = null;
    this._touches = new Map();
    this._pinchDistance = null;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onContextMenu = e => e.preventDefault();

    domElement.style.touchAction = 'none';
    domElement.addEventListener('pointerdown', this._onPointerDown);
    domElement.addEventListener('pointermove', this._onPointerMove);
    domElement.addEventListener('pointerup', this._onPointerUp);
    domElement.addEventListener('pointercancel', this._onPointerUp);
    domElement.addEventListener('wheel', this._onWheel, { passive: false });
    domElement.addEventListener('contextmenu', this._onContextMenu);
    this.apply();
  }

  apply() {
    const p = getCameraPosition(this.state);
    this.camera.position.set(p.x, p.y, p.z);
    this.camera.lookAt(new THREE.Vector3(...this.state.target));
    this.camera.updateProjectionMatrix();
    this.onChange?.(this.state);
  }

  rotateByDegrees(yaw, pitch = 0) {
    orbit(this.state, THREE.MathUtils.degToRad(yaw), THREE.MathUtils.degToRad(pitch));
    this.apply();
  }

  setZoomPercent(percent) {
    setDistance(this.state, zoomPercentToDistance(this.state, percent));
    this.apply();
  }

  zoomByPercent(deltaPercent) {
    this.setZoomPercent(this.getZoomPercent() + Number(deltaPercent || 0));
  }

  getZoomPercent() {
    return distanceToZoomPercent(this.state);
  }

  reset() {
    resetCameraView(this.state, DEFAULT_CAMERA_VIEW);
    this.apply();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) this._drag = null;
  }

  setPointerOrbitEnabled(enabled) {
    this.pointerOrbitEnabled = Boolean(enabled);
    if (!this.pointerOrbitEnabled) this._drag = null;
  }

  dispose() {
    const el = this.domElement;
    el.removeEventListener('pointerdown', this._onPointerDown);
    el.removeEventListener('pointermove', this._onPointerMove);
    el.removeEventListener('pointerup', this._onPointerUp);
    el.removeEventListener('pointercancel', this._onPointerUp);
    el.removeEventListener('wheel', this._onWheel);
    el.removeEventListener('contextmenu', this._onContextMenu);
  }

  _onPointerDown(event) {
    if (!this.enabled || !this.pointerOrbitEnabled || event.button !== 0) return;

    if (event.pointerType === 'touch') {
      this._touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this._touches.size >= 2) {
        const points = [...this._touches.values()];
        this._pinchDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        this._drag = null;
        return;
      }
    }

    this._drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    this.domElement.setPointerCapture?.(event.pointerId);
  }

  _onPointerMove(event) {
    if (!this.enabled || !this.pointerOrbitEnabled) return;

    if (event.pointerType === 'touch' && this._touches.has(event.pointerId)) {
      this._touches.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (this._touches.size >= 2) {
        const points = [...this._touches.values()];
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        if (this._pinchDistance && distance > 0) {
          const scale = this._pinchDistance / distance;
          setDistance(this.state, this.state.distance * scale);
          this.apply();
        }
        this._pinchDistance = distance;
        return;
      }
    }

    if (!this._drag || this._drag.id !== event.pointerId) return;
    const dx = event.clientX - this._drag.x;
    const dy = event.clientY - this._drag.y;
    this._drag.x = event.clientX;
    this._drag.y = event.clientY;
    const sensitivity = 0.006;
    orbit(this.state, -dx * sensitivity, -dy * sensitivity);
    this.apply();
  }

  _onPointerUp(event) {
    if (event.pointerType === 'touch') {
      this._touches.delete(event.pointerId);
      if (this._touches.size < 2) this._pinchDistance = null;
    }
    if (this._drag?.id === event.pointerId) this._drag = null;
  }

  _onWheel(event) {
    if (!this.enabled) return;
    event.preventDefault();
    const factor = Math.exp(event.deltaY * 0.0012);
    setDistance(this.state, this.state.distance * factor);
    this.apply();
  }
}
