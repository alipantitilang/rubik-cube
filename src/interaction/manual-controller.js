import {
  FACE_BASES,
  GESTURE_CONFIG,
  classifyProjectedGesture,
  gestureToMove,
  projectPointerDeltaToFacePlane
} from './gesture.js';

/**
 * Owns the pointer gesture lifecycle for the 3D viewport.
 *
 * Responsibilities:
 * - pick a visible sticker on pointer-down;
 * - reserve that pointer for a possible face turn;
 * - classify movement after threshold;
 * - enqueue exactly one legal face move;
 * - otherwise orbit the camera when the pointer began on empty scene;
 *
 * CubeState is never mutated here.
 */
export class ManualInteractionController {
  constructor({
    domElement,
    cameraController,
    pickFace,
    enqueueMove,
    isInputLocked = () => false,
    gestureConfig = GESTURE_CONFIG,
    onGesture = null
  } = {}) {
    if (!domElement) throw new Error('ManualInteractionController requires domElement.');
    if (!cameraController) throw new Error('ManualInteractionController requires cameraController.');
    if (typeof pickFace !== 'function') throw new Error('ManualInteractionController requires pickFace().');
    if (typeof enqueueMove !== 'function') throw new Error('ManualInteractionController requires enqueueMove().');

    this.domElement = domElement;
    this.cameraController = cameraController;
    this.pickFace = pickFace;
    this.enqueueMove = enqueueMove;
    this.isInputLocked = isInputLocked;
    this.gestureConfig = gestureConfig;
    this.onGesture = onGesture;

    this.enabled = true;
    this._pointer = null;

    // Phase 4 CameraController no longer owns primary pointer orbit while
    // manual interaction is active. Wheel zoom remains owned by the camera.
    this.cameraController.setPointerOrbitEnabled?.(false);

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerCancel = this._onPointerCancel.bind(this);

    domElement.style.touchAction = 'none';
    domElement.addEventListener('pointerdown', this._onPointerDown);
    domElement.addEventListener('pointermove', this._onPointerMove);
    domElement.addEventListener('pointerup', this._onPointerUp);
    domElement.addEventListener('pointercancel', this._onPointerCancel);
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) this._cancelPointer();
  }

  dispose() {
    this._cancelPointer();
    const el = this.domElement;
    el.removeEventListener('pointerdown', this._onPointerDown);
    el.removeEventListener('pointermove', this._onPointerMove);
    el.removeEventListener('pointerup', this._onPointerUp);
    el.removeEventListener('pointercancel', this._onPointerCancel);
    this.cameraController.setPointerOrbitEnabled?.(true);
  }

  _onPointerDown(event) {
    if (!this.enabled || event.button !== 0 || this.isInputLocked()) return;

    const faceHit = this.pickFace(event.clientX, event.clientY);

    this._pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      face: faceHit?.face ?? null,
      faceNormal: faceHit?.normal ?? null,
      mode: faceHit ? 'face-pending' : 'camera',
      turned: false
    };

    this.domElement.setPointerCapture?.(event.pointerId);
    event.stopPropagation();
  }

  _onPointerMove(event) {
    const pointer = this._pointer;
    if (!this.enabled || !pointer || pointer.id !== event.pointerId) return;

    const dxTotal = event.clientX - pointer.startX;
    const dyTotal = event.clientY - pointer.startY;

    if (pointer.mode === 'face-pending') {
      if (this.isInputLocked()) {
        this._cancelPointer();
        return;
      }

      const deltaOnFace = projectPointerDeltaToFacePlane({
        dx: dxTotal,
        dy: dyTotal,
        cameraRight: this._cameraRight(),
        cameraUp: this._cameraUp(),
        faceNormal: pointer.faceNormal
      });

      const gesture = classifyProjectedGesture({
        deltaOnFace,
        face: pointer.face,
        basis: FACE_BASES,
        config: this.gestureConfig
      });

      if (gesture.type === 'horizontal' || gesture.type === 'vertical') {
        const move = this._gestureMove(pointer.face, gesture);
        if (move) {
          pointer.turned = true;
          pointer.mode = 'face';
          this.enqueueMove(move);
          this.onGesture?.({ type: 'face-turn', face: pointer.face, move, gesture });
        }
      }

      event.stopPropagation();
      return;
    }

    if (pointer.mode === 'camera') {
      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;

      // Same angular sensitivity as Phase 4 CameraController.
      this.cameraController.rotateByDegrees(
        -dx * 0.006 * 180 / Math.PI,
        -dy * 0.006 * 180 / Math.PI
      );
      this.onGesture?.({ type: 'camera-orbit', dx, dy });
      event.stopPropagation();
    }
  }

  _onPointerUp(event) {
    if (this._pointer?.id !== event.pointerId) return;
    this.domElement.releasePointerCapture?.(event.pointerId);
    this._pointer = null;
    event.stopPropagation();
  }

  _onPointerCancel(event) {
    if (this._pointer?.id !== event.pointerId) return;
    this.domElement.releasePointerCapture?.(event.pointerId);
    this._pointer = null;
    event.stopPropagation();
  }

  _cancelPointer() {
    if (this._pointer) {
      this.domElement.releasePointerCapture?.(this._pointer.id);
    }
    this._pointer = null;
  }

  _cameraRight() {
    const e = this.cameraController.camera.matrixWorld.elements;
    return [e[0], e[1], e[2]];
  }

  _cameraUp() {
    const e = this.cameraController.camera.matrixWorld.elements;
    return [e[4], e[5], e[6]];
  }

  _gestureMove(face, gesture) {
    return gestureToMove(face, gesture);
  }
}
