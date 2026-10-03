import test from 'node:test';
import assert from 'node:assert/strict';
import { createSolvedCube } from '../src/core/cube.js';
import { TurnAnimator, easeInOutCubic, getLayerCubieIds, moveAngleRadians } from '../src/animation/turn-animator.js';
import { CubeTurnRuntime } from '../src/animation/cube-turn-runtime.js';

test('easing starts at 0, ends at 1, and remains bounded', () => {
  assert.equal(easeInOutCubic(0), 0); assert.equal(easeInOutCubic(1), 1); assert.ok(easeInOutCubic(0.25) > 0 && easeInOutCubic(0.25) < 0.5);
});

test('generic turn angle supports both directions and half turns', () => {
  assert.equal(moveAngleRadians({ axis: 'x', layer: 1, quarterTurns: 1 }, 1), Math.PI / 2);
  assert.equal(moveAngleRadians({ axis: 'x', layer: 1, quarterTurns: -1 }, 1), -Math.PI / 2);
  assert.equal(moveAngleRadians({ axis: 'x', layer: 1, quarterTurns: 2 }, 1), Math.PI);
});

test('each outer layer turn selects exactly 9 cubies', () => {
  const cube = createSolvedCube();
  for (const axis of ['x', 'y', 'z']) for (const layer of [-1, 1]) assert.equal(getLayerCubieIds(cube, { axis, layer, quarterTurns: 1 }).length, 9);
});

test('animator queues generic turns and completes exactly once', () => {
  const animator = new TurnAnimator({ durationMs: 100 });
  animator.enqueue({ axis: 'x', layer: 1, quarterTurns: 1 }, { axis: 'y', layer: -1, quarterTurns: -1 });
  assert.equal(animator.queuedCount, 2);
  assert.equal(animator.tick(50).active.progress, 0.5);
  assert.deepEqual(animator.tick(50).completed, { axis: 'x', layer: 1, quarterTurns: 1 });
  assert.deepEqual(animator.tick(100).completed, { axis: 'y', layer: -1, quarterTurns: -1 });
  assert.equal(animator.busy, false);
});

test('runtime does not mutate CubeState before animation completion', () => {
  const cube = createSolvedCube();
  const runtime = new CubeTurnRuntime({ cubeState: cube, animator: new TurnAnimator({ durationMs: 100 }) });
  const solvedSignature = cube.signature();
  runtime.enqueue({ axis: 'x', layer: 1, quarterTurns: 1 });
  runtime.tick(99); assert.equal(runtime.cubeState.signature(), solvedSignature);
  runtime.tick(1); assert.equal(runtime.cubeState.isSolved(), false);
  assert.equal(runtime.cubeState.getCubie('cubie_1_1_1').position.join(','), '1,-1,1');
  assert.equal(runtime.history.length, 1);
});

test('runtime commits a generic turn and its inverse back to solved', () => {
  const runtime = new CubeTurnRuntime({ animator: new TurnAnimator({ durationMs: 10 }) });
  runtime.enqueue({ axis: 'x', layer: 1, quarterTurns: 1 }, { axis: 'x', layer: 1, quarterTurns: -1 });
  runtime.tick(10); runtime.tick(10);
  assert.equal(runtime.cubeState.isSolved(), true);
  assert.equal(runtime.history.length, 2);
});

test('runtime cancel discards active and queued turns without mutating logical state', () => {
  const calls = [];
  const cubeState = createSolvedCube();
  const runtime = new CubeTurnRuntime({ cubeState, animator: new TurnAnimator({ durationMs: 100 }), adapter: { finish() { calls.push('finish'); }, begin() {}, update() {} }, renderer: { renderCube(state) { calls.push(['render', state.signature()]); } } });
  runtime.enqueue({ axis: 'x', layer: 1, quarterTurns: 1 }, { axis: 'y', layer: 1, quarterTurns: 1 });
  runtime.tick(25);
  const before = cubeState.signature();
  const result = runtime.cancel();
  assert.equal(result.cancelled, true); assert.equal(runtime.busy, false); assert.equal(runtime.cubeState.signature(), before); assert.deepEqual(calls, ['finish', ['render', before]]);
});

test('middle layer turn selects four edges plus four face centers', () => {
  const cube = createSolvedCube();
  for (const axis of ['x', 'y', 'z']) assert.equal(getLayerCubieIds(cube, { axis, layer: 0, quarterTurns: 1 }).length, 8);
});
