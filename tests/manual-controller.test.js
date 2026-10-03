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
function makeCubeOrientation() {
  return {
    state: { quaternion: [0,0,0,1] },
    rotateByScreenDelta(dx, dy) { this.lastRotation = [dx, dy]; }
  };
}
function makeController({ pickFace = () => null, enqueueMove = () => {}, isInputLocked = () => false } = {}) {
  const el = makeElement();
  const camera = makeCamera();
  const cube = makeCubeOrientation();
  const controller = new ManualInteractionController({
    domElement: el,
    cameraController: camera,
    cubeOrientationController: cube,
    pickFace,
    enqueueMove,
    isInputLocked
  });
  return { el, camera, cube, controller };
}

test('sticker drag resolves against the frozen view geometry and never rotates cube', () => {
  const moves = [];
  const { el, camera, cube, controller } = makeController({
    pickFace: () => ({ face: 'F', normal: [0, 0, 1], cubieId: 'c', cubieType: 'corner', logicalPosition: [-1, 1, 1] }),
    enqueueMove: move => moves.push(move)
  });
  el.emit('pointerdown', makeEvent());
  el.emit('pointermove', makeEvent({ clientX: 140, clientY: 100 }));
  el.emit('pointerup', makeEvent({ clientX: 140, clientY: 100 }));
  assert.deepEqual(moves, [{ axis: 'y', layer: 1, quarterTurns: 1 }]);
  assert.equal(camera.lastOrbit, undefined);
  assert.equal(cube.lastRotation, undefined);
  controller.dispose();
});

test('camera movement during a sticker drag cannot change the frozen view geometry', () => {
  const moves = [];
  const { el, camera, controller } = makeController({
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'corner', logicalPosition: [-1,1,1] }),
    enqueueMove: move => moves.push(move)
  });
  el.emit('pointerdown', makeEvent());
  camera.camera.position.x = 5;
  camera.camera.position.z = 0;
  el.emit('pointermove', makeEvent({ clientX: 140, clientY: 100 }));
  el.emit('pointerup', makeEvent({ clientX: 140, clientY: 100 }));
  assert.deepEqual(moves, [{ axis: 'y', layer: 1, quarterTurns: 1 }]);
  controller.dispose();
});

test('tap on sticker does not enqueue a move', () => {
  const { el, controller } = makeController({
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'center', logicalPosition: [0,0,1] })
  });
  const moves = [];
  // Replace the controller callback with a no-op test path through a second controller.
  controller.dispose();
  const ctx = makeController({
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'center', logicalPosition: [0,0,1] }),
    enqueueMove: move => moves.push(move)
  });
  ctx.el.emit('pointerdown', makeEvent());
  ctx.el.emit('pointerup', makeEvent({ clientX: 104, clientY: 103 }));
  assert.deepEqual(moves, []);
  ctx.controller.dispose();
});

test('empty-scene drag rotates cube instead of camera', () => {
  const { el, camera, cube, controller } = makeController();
  el.emit('pointerdown', makeEvent());
  el.emit('pointermove', makeEvent({ clientX: 120, clientY: 110 }));
  assert.deepEqual(cube.lastRotation, [20, 10]);
  assert.equal(camera.lastOrbit, undefined);
  controller.dispose();
});

test('input lock prevents gesture ownership', () => {
  const moves = [];
  const { el, camera, controller } = makeController({
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'center', logicalPosition: [0,0,1] }),
    enqueueMove: move => moves.push(move),
    isInputLocked: () => true
  });
  el.emit('pointerdown', makeEvent());
  el.emit('pointermove', makeEvent({ clientX: 140, clientY: 100 }));
  assert.deepEqual(moves, []);
  assert.equal(camera.lastOrbit, undefined);
  controller.dispose();
});


test('lost pointer capture cancels an in-progress interactive turn so input cannot remain stuck', () => {
  let ended = null;
  const ctx = makeController({
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'corner', logicalPosition: [-1,1,1] })
  });
  // Recreate with interactive callbacks because makeController's enqueue path is intentionally minimal.
  ctx.controller.dispose();
  const el = makeElement();
  const camera = makeCamera();
  const cube = makeCubeOrientation();
  const controller = new ManualInteractionController({
    domElement: el,
    cameraController: camera,
    cubeOrientationController: cube,
    pickFace: () => ({ face: 'F', normal: [0,0,1], cubieId: 'c', cubieType: 'corner', logicalPosition: [-1,1,1] }),
    beginInteractive: () => true,
    updateInteractive: () => {},
    endInteractive: options => { ended = options; }
  });

  el.emit('pointerdown', makeEvent());
  el.emit('pointermove', makeEvent({ clientX: 140, clientY: 100 }));
  el.emit('lostpointercapture', makeEvent());

  assert.deepEqual(ended, { commit: false, durationMs: 0 });
  controller.dispose();
});
