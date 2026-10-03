import test from 'node:test';
import assert from 'node:assert/strict';
import { createSolvedCube } from '../src/core/cube.js';
import { CubeTurnRuntime } from '../src/animation/cube-turn-runtime.js';
import { resolveDragTurn } from '../src/interaction/drag-move-resolver.js';

function makeAdapter() {
  return { begin() {}, update() {}, finish() {} };
}

test('a generic layer-turn command can be previewed and committed through CubeTurnRuntime', () => {
  const move = resolveDragTurn({
    physicalStickerFace: 'F',
    cameraRight: [1,0,0],
    cameraUp: [0,1,0],
    cubeQuaternion: [0,0,0,1],
    cubieType: 'corner',
    cubiePosition: [-1, 1, 1],
    dragX: 100,
    dragY: 0
  });
  assert.deepEqual(move, { axis: 'y', layer: 1, quarterTurns: 1 });

  const runtime = new CubeTurnRuntime({ cubeState: createSolvedCube(), adapter: makeAdapter() });
  const before = runtime.cubeState.signature();
  assert.equal(runtime.beginInteractive(move), true);
  runtime.updateInteractive(0.5);
  assert.equal(runtime.cubeState.signature(), before);
  runtime.endInteractive({ commit: true, durationMs: 0 });
  assert.notEqual(runtime.cubeState.signature(), before);
});


test('interactive release settles, commits once, and unlocks for the next turn', () => {
  const runtime = new CubeTurnRuntime({ cubeState: createSolvedCube(), adapter: makeAdapter() });
  const first = { axis: 'y', layer: 1, quarterTurns: 1 };
  const second = { axis: 'x', layer: -1, quarterTurns: 1 };

  assert.equal(runtime.beginInteractive(first), true);
  runtime.updateInteractive(0.8);
  runtime.endInteractive({ commit: true, durationMs: 120 });
  assert.equal(runtime.busy, true);

  runtime.tick(119);
  assert.equal(runtime.busy, true);
  assert.equal(runtime.history.length, 0);

  runtime.tick(1);
  assert.equal(runtime.busy, false);
  assert.equal(runtime.history.length, 1);
  assert.equal(runtime.beginInteractive(second), true);
});
