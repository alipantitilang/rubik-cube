import test from 'node:test';
import assert from 'node:assert/strict';
import { ManualInteractionController } from '../src/interaction/manual-controller.js';

function makeElement() {
  const listeners = new Map();
  return {
    style: {},
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type) { listeners.delete(type); },
    setPointerCapture() {},
    releasePointerCapture() {},
    emit(type, event) { listeners.get(type)?.(event); }
  };
}
function makeEvent(overrides = {}) {
  return { button: 0, pointerId: 1, clientX: 100, clientY: 100, stopPropagation() {}, ...overrides };
}
function makeCamera() {
  return {
    state: { target: [0, 0, 0] },
    camera: {
      position: { x: 0, y: 0, z: 5 },
      matrixWorld: { elements: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1] }
    },
    setPointerOrbitEnabled() {},
    rotateByDegrees(yaw, pitch) { this.lastOrbit = [yaw, pitch]; }
  };
}

test('sticker drag resolves against the frozen POV frame and never orbits camera', () => {
  const el = makeElement();
  const camera = makeCamera();
  const moves = [];
  const controller = new ManualInteractionController({
    domElement: el,
    cameraController: camera,
    pickFace: () => ({ face: 'F', normal: [0, 0, 1], cubieId: 'c', cubieType: 'corner', logicalPosition: [-1, 1, 1] }),
    enqueueMove: move => moves.push(move)
  });
  el.emit('pointerdown', makeEvent());
  el.emit('pointermove', makeEvent({ clientX: 140, clientY: 100 }));
  el.emit('pointerup', makeEvent({ clientX: 140, clientY: 100 }));
  assert.deepEqual(moves, ['U']);
  assert.equal(camera.lastOrbit, undefined);
  controller.dispose();
});

test('camera movement during a sticker drag cannot change the frozen POV front', () => {
  const el = makeElement();
  const camera = makeCamera();
  const moves = [];
  const controller = new ManualInteractionController({
    domElement: el, cameraController: camera,
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'corner', logicalPosition: [-1,1,1] }),
    enqueueMove: move => moves.push(move)
  });
  el.emit('pointerdown', makeEvent());
  camera.camera.position.x = 5;
  camera.camera.position.z = 0;
  el.emit('pointermove', makeEvent({ clientX: 140, clientY: 100 }));
  el.emit('pointerup', makeEvent({ clientX: 140, clientY: 100 }));
  assert.deepEqual(moves, ['U']);
  controller.dispose();
});

test('tap on sticker does not enqueue a move', () => {
  const el = makeElement();
  const camera = makeCamera();
  const moves = [];
  const controller = new ManualInteractionController({
    domElement: el, cameraController: camera,
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'center', logicalPosition: [0,0,1] }),
    enqueueMove: move => moves.push(move)
  });
  el.emit('pointerdown', makeEvent());
  el.emit('pointerup', makeEvent({ clientX: 104, clientY: 103 }));
  assert.deepEqual(moves, []);
  controller.dispose();
});

test('empty-scene drag orbits camera', () => {
  const el = makeElement();
  const camera = makeCamera();
  const controller = new ManualInteractionController({
    domElement: el, cameraController: camera, pickFace: () => null, enqueueMove: () => {}
  });
  el.emit('pointerdown', makeEvent());
  el.emit('pointermove', makeEvent({ clientX: 120, clientY: 110 }));
  assert.ok(Array.isArray(camera.lastOrbit));
  controller.dispose();
});

test('input lock prevents gesture ownership', () => {
  const el = makeElement();
  const camera = makeCamera();
  const moves = [];
  const controller = new ManualInteractionController({
    domElement: el, cameraController: camera,
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'center', logicalPosition: [0,0,1] }),
    enqueueMove: move => moves.push(move), isInputLocked: () => true
  });
  el.emit('pointerdown', makeEvent());
  el.emit('pointermove', makeEvent({ clientX: 140, clientY: 100 }));
  assert.deepEqual(moves, []);
  assert.equal(camera.lastOrbit, undefined);
  controller.dispose();
});
