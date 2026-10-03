import test from 'node:test';
import assert from 'node:assert/strict';
import { createSolvedCube } from '../src/core/cube.js';
import { CubeTurnRuntime } from '../src/animation/cube-turn-runtime.js';
import { resolveDragMove } from '../src/interaction/drag-move-resolver.js';

function makeAdapter() {
  return { begin() {}, update() {}, finish() {} };
}

test('a POV drag command can be previewed and committed through CubeTurnRuntime', () => {
  const move = resolveDragMove({
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
