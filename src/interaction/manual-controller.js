import { resolveDragTurn } from './drag-move-resolver.js';

export const GESTURE_CONFIG = Object.freeze({
  minDistancePx: 10,
  pixelsPerQuarterTurn: 82,
  commitProgress: 0.5
});

function getDragStickerContext({ physicalStickerFace, cubieType, cubiePosition }) {
  return Object.freeze({
    physicalStickerFace,
    cubieType,
    cubiePosition: [...cubiePosition]
  });
}

/**
 * Phase 5 direct-geometric interaction owner.
 * A pointer that starts on a sticker is interpreted directly from screen-space
 * drag geometry. There is no Front face or virtual POV frame. Empty space rotates the cube.
 */
export class ManualInteractionController {
  constructor({
    domElement,
    cameraController,
    cubeOrientationController,
    pickFace,
    beginInteractive = null,
    updateInteractive = null,
    endInteractive = null,
    enqueueMove = null,
    isInputLocked = () => false,
    gestureConfig = GESTURE_CONFIG,
    onGesture = null
  } = {}) {
    if (!domElement) throw new Error('ManualInteractionController requires domElement.');
    if (!cameraController) throw new Error('ManualInteractionController requires cameraController.');
    if (!cubeOrientationController) throw new Error('ManualInteractionController requires cubeOrientationController.');
    if (typeof pickFace !== 'function') throw new Error('ManualInteractionController requires pickFace().');
    if (!beginInteractive && typeof enqueueMove !== 'function') {
      throw new Error('ManualInteractionController requires beginInteractive() or enqueueMove().');
    }

    this.domElement = domElement;
    this.cameraController = cameraController;
    this.cubeOrientationController = cubeOrientationController;
    this.pickFace = pickFace;
    this.beginInteractive = beginInteractive;
    this.updateInteractive = updateInteractive;
    this.endInteractive = endInteractive;
    this.enqueueMove = enqueueMove;
    this.isInputLocked = isInputLocked;
    this.gestureConfig = gestureConfig;
    this.onGesture = onGesture;
    this.enabled = true;
    this.viewOnly = false;
    this._pointer = null;

    this.cameraController.setPointerOrbitEnabled?.(false);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerCancel = this._onPointerCancel.bind(this);
    this._onLostPointerCapture = this._onLostPointerCapture.bind(this);
    this._onWindowBlur = this._onWindowBlur.bind(this);

    domElement.style.touchAction = 'none';
    domElement.addEventListener('pointerdown', this._onPointerDown);
    domElement.addEventListener('pointermove', this._onPointerMove);
    domElement.addEventListener('pointerup', this._onPointerUp);
    domElement.addEventListener('pointercancel', this._onPointerCancel);
    domElement.addEventListener('lostpointercapture', this._onLostPointerCapture);
    this._window = typeof window !== 'undefined' ? window : null;
    this._window?.addEventListener('blur', this._onWindowBlur);
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) this._cancelPointer(true);
  }

  setViewOnly(enabled) {
    this.viewOnly = Boolean(enabled);
    if (this.viewOnly) this._cancelPointer(true);
  }

  dispose() {
    this._cancelPointer(true);
    const el = this.domElement;
    el.removeEventListener('pointerdown', this._onPointerDown);
    el.removeEventListener('pointermove', this._onPointerMove);
    el.removeEventListener('pointerup', this._onPointerUp);
    el.removeEventListener('pointercancel', this._onPointerCancel);
    el.removeEventListener('lostpointercapture', this._onLostPointerCapture);
    this._window?.removeEventListener('blur', this._onWindowBlur);
    this.cameraController.setPointerOrbitEnabled?.(false);
  }

  _onPointerDown(event) {
    if (!this.enabled || event.button !== 0) return;
    // A second touch belongs to the camera pinch gesture, not cube/layer dragging.
    if (event.pointerType === 'touch' && this._pointer) {
      this._cancelPointer(true);
      return;
    }
    if (this.viewOnly) {
      this._pointer = {
        id: event.pointerId, startX: event.clientX, startY: event.clientY,
        lastX: event.clientX, lastY: event.clientY, mode: 'cube', hit: null,
        gestureView: null, turn: null, axis: null, progress: 0
      };
      this.domElement.setPointerCapture?.(event.pointerId);
      event.stopPropagation();
      return;
    }
    if (this.isInputLocked()) return;
    const hit = this.pickFace(event.clientX, event.clientY);
    const gestureView = hit ? this._getViewContext() : null;

    this._pointer = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      mode: hit ? 'face-pending' : 'cube',
      hit,
      gestureView,
      turn: null,
      axis: null,
      progress: 0
    };
    this.domElement.setPointerCapture?.(event.pointerId);
    event.stopPropagation();
  }

  _onPointerMove(event) {
    const pointer = this._pointer;
    if (!this.enabled || !pointer || pointer.id !== event.pointerId) return;

    const dx = event.clientX - pointer.startX;
    const dy = event.clientY - pointer.startY;

    if (pointer.mode === 'face-pending' || pointer.mode === 'face-drag') {
      if (pointer.mode === 'face-pending') {
        const distance = Math.hypot(dx, dy);
        if (distance < this.gestureConfig.minDistancePx) {
          event.stopPropagation();
          return;
        }

        const view = pointer.gestureView ?? this._getViewContext();
        const turn = resolveDragTurn({
          physicalStickerFace: pointer.hit.face,
          cubiePosition: pointer.hit.logicalPosition,
          dragX: dx,
          dragY: dy,
          cameraRight: view.cameraRight,
          cameraUp: view.cameraUp,
          cubeQuaternion: view.cubeQuaternion
        });
        if (!turn) {
          event.stopPropagation();
          return;
        }

        pointer.axis = Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
        pointer.turn = turn;
        pointer.progress = Math.min(1, Math.abs(pointer.axis === 'horizontal' ? dx : dy) / this.gestureConfig.pixelsPerQuarterTurn);

        if (this.beginInteractive) {
          const started = this.beginInteractive(turn);
          if (!started) {
            this._cancelPointer(false);
            return;
          }
          this.updateInteractive?.(pointer.progress);
        } else {
          this.enqueueMove?.(turn);
        }
        pointer.mode = 'face-drag';
        this._emitFaceGesture(pointer, dx, dy);
        event.stopPropagation();
        return;
      }

      const dominant = pointer.axis === 'horizontal' ? Math.abs(dx) : Math.abs(dy);
      pointer.progress = Math.min(1, dominant / this.gestureConfig.pixelsPerQuarterTurn);
      this.updateInteractive?.(pointer.progress);
      this._emitFaceGesture(pointer, dx, dy);
      event.stopPropagation();
      return;
    }

    if (pointer.mode === 'cube') {
      const stepX = event.clientX - pointer.lastX;
      const stepY = event.clientY - pointer.lastY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      this.cubeOrientationController.rotateByScreenDelta(stepX, stepY);
      this.onGesture?.({ type: 'cube-rotate', dx: stepX, dy: stepY });
      event.stopPropagation();
    }
  }

  _getViewContext() {
    const camera = this.cameraController.camera;
    return {
      cameraPosition: [camera.position.x, camera.position.y, camera.position.z],
      target: this.cameraController.state?.target ?? [0, 0, 0],
      cameraRight: [camera.matrixWorld.elements[0], camera.matrixWorld.elements[1], camera.matrixWorld.elements[2]],
      cameraUp: [camera.matrixWorld.elements[4], camera.matrixWorld.elements[5], camera.matrixWorld.elements[6]],
      cubeQuaternion: [
        this.cubeOrientationController.state.quaternion[0],
        this.cubeOrientationController.state.quaternion[1],
        this.cubeOrientationController.state.quaternion[2],
        this.cubeOrientationController.state.quaternion[3]
      ]
    };
  }

  _onPointerUp(event) {
    if (this._pointer?.id !== event.pointerId) return;
    const pointer = this._pointer;
    if (pointer.mode === 'face-drag') {
      this.endInteractive?.({ commit: pointer.progress >= this.gestureConfig.commitProgress });
    }
    this.domElement.releasePointerCapture?.(event.pointerId);
    this._pointer = null;
    event.stopPropagation();
  }

  _onPointerCancel(event) {
    if (this._pointer?.id !== event.pointerId) return;
    const pointer = this._pointer;
    if (pointer.mode === 'face-drag') this.endInteractive?.({ commit: false });
    this.domElement.releasePointerCapture?.(event.pointerId);
    this._pointer = null;
    event.stopPropagation();
  }

  _cancelPointer(cancelInteractive) {
    if (this._pointer?.mode === 'face-drag' && cancelInteractive) {
      this.endInteractive?.({ commit: false, durationMs: 0 });
    }
    if (this._pointer) this.domElement.releasePointerCapture?.(this._pointer.id);
    this._pointer = null;
  }

  _onLostPointerCapture(event) {
    if (this._pointer?.id !== event.pointerId) return;
    // A browser/OS pointer-capture loss can happen without a pointerup
    // (window switch, device interruption, browser gesture cancellation).
    // Never leave the interactive runtime locked in that state.
    if (this._pointer.mode === 'face-drag') {
      this.endInteractive?.({ commit: false, durationMs: 0 });
    }
    this._pointer = null;
  }

  _onWindowBlur() {
    if (!this._pointer) return;
    if (this._pointer.mode === 'face-drag') {
      this.endInteractive?.({ commit: false, durationMs: 0 });
    }
    this._pointer = null;
  }

  _emitFaceGesture(pointer, dx, dy) {
    const context = getDragStickerContext({
      physicalStickerFace: pointer.hit.face,
      cubieType: pointer.hit.cubieType,
      cubiePosition: pointer.hit.logicalPosition
    });
    this.onGesture?.({
      type: 'face-drag',
      turn: pointer.turn,
      progress: pointer.progress,
      axis: pointer.axis,
      dx,
      dy,
      ...context
    });
  }
}
