import test from 'node:test';
import assert from 'node:assert/strict';
import { createSolvedCube } from '../src/core/cube.js';
import { CubeTurnRuntime } from '../src/animation/cube-turn-runtime.js';
import { resolvePovMove } from '../src/interaction/pov-move-resolver.js';

const frame = {
  front: 'F', back: 'B', right: 'R', left: 'L', up: 'U', down: 'D',
  axes: { right: [1,0,0], up: [0,1,0], front: [0,0,1] }
};

function makeAdapter() {
  return { begin() {}, update() {}, finish() {} };
}

test('a POV drag command can be previewed and committed through CubeTurnRuntime', () => {
  const move = resolvePovMove({
    frame,
    physicalStickerFace: 'F',
    cubieType: 'corner',
    cubiePosition: [-1, 1, 1],
    dragX: 100,
    dragY: 0
  });
  assert.equal(move, 'U');

  const runtime = new CubeTurnRuntime({ cubeState: createSolvedCube(), adapter: makeAdapter() });
  const before = runtime.cubeState.signature();
  assert.equal(runtime.beginInteractive(move), true);
  runtime.updateInteractive(0.5);
  assert.equal(runtime.cubeState.signature(), before);
  runtime.endInteractive({ commit: true, durationMs: 0 });
  assert.notEqual(runtime.cubeState.signature(), before);
});
