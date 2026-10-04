import test from 'node:test';
import assert from 'node:assert/strict';
import { MoveHistory, SolveTimer, createSessionRecord } from '../src/core/move-history.js';

test('MoveHistory records generic committed turns and counts half-turn as one move', () => {
  const history = new MoveHistory();
  history.record({ axis: 'x', layer: 1, quarterTurns: 1 }, 100);
  history.record({ axis: 'z', layer: 0, quarterTurns: 2 }, 200);
  assert.equal(history.length, 2);
  assert.deepEqual(history.getAll()[1].turn, { axis: 'z', layer: 0, quarterTurns: 2 });
  assert.equal(history.last(1)[0].index, 2);
});

test('MoveHistory clear starts a fresh session history', () => {
  const history = new MoveHistory();
  history.record({ axis: 'y', layer: -1, quarterTurns: -1 }, 10);
  history.clear();
  assert.equal(history.length, 0);
  assert.deepEqual(history.getAll(), []);
});

test('SolveTimer starts, reports elapsed time, and stops', () => {
  let now = 1000;
  const timer = new SolveTimer(() => now);
  timer.start();
  now = 2345;
  assert.equal(timer.elapsedMs, 1345);
  timer.pause();
  now = 5000;
  assert.equal(timer.elapsedMs, 1345);
  assert.equal(timer.paused, true);
  timer.resume();
  now = 6345;
  assert.equal(timer.elapsedMs, 2690);
  timer.stop();
  now = 9999;
  assert.equal(timer.elapsedMs, 2690);
  assert.equal(timer.running, false);
});

test('SolveTimer reset clears the session clock', () => {
  const timer = new SolveTimer(() => 5000);
  timer.start();
  timer.stop(7000);
  timer.reset();
  assert.equal(timer.elapsedMs, 0);
  assert.equal(timer.startedAt, null);
  assert.equal(timer.stoppedAt, null);
});

test('session record preserves result and move count', () => {
  const moves = [{ index: 1, turn: { axis: 'x', layer: 1, quarterTurns: 1 }, timestamp: 10 }];
  const record = createSessionRecord({
    startedAt: 10,
    completedAt: 2010,
    scramble: [{ axis: 'y', layer: -1, quarterTurns: 1 }],
    moves,
    moveCount: 1,
    solved: true,
    elapsedMs: 2000
  });
  assert.equal(record.solved, true);
  assert.equal(record.moveCount, 1);
  assert.equal(record.elapsedMs, 2000);
  assert.equal(record.moves.length, 1);
});

import { CubeTurnRuntime } from '../src/animation/cube-turn-runtime.js';
import { TurnAnimator } from '../src/animation/turn-animator.js';
import { ShuffleController, SHUFFLE_STATES } from '../src/animation/shuffle-controller.js';
import { createSolvedCube } from '../src/core/cube.js';

test('runtime commit callback fires for both queued and interactive commits', () => {
  const committed = [];
  const runtime = new CubeTurnRuntime({
    cubeState: createSolvedCube(),
    animator: new TurnAnimator({ durationMs: 1 }),
    onTurnCommitted: (turn, meta) => committed.push({ turn, source: meta.source })
  });
  const turn = { axis: 'y', layer: 1, quarterTurns: 1 };
  runtime.enqueue(turn);
  runtime.tick(1);
  assert.equal(committed.length, 1);
  assert.equal(committed[0].source, 'queued');

  const runtime2 = new CubeTurnRuntime({
    cubeState: createSolvedCube(),
    adapter: { begin() {}, update() {}, finish() {} },
    onTurnCommitted: (move, meta) => committed.push({ turn: move, source: meta.source })
  });
  assert.equal(runtime2.beginInteractive(turn), true);
  runtime2.updateInteractive(1);
  runtime2.endInteractive({ commit: true, durationMs: 0 });
  assert.equal(committed.at(-1).source, 'interactive');
});

test('scramble lifecycle can separate scramble commits from player commits', () => {
  const committed = [];
  const runtime = new CubeTurnRuntime({
    cubeState: createSolvedCube(),
    animator: new TurnAnimator({ durationMs: 1 }),
    onTurnCommitted: (turn) => committed.push(turn)
  });
  const controller = new ShuffleController({
    runtime,
    length: 2,
    durationMs: 1
  });
  controller.play({ seed: 42 });
  let guard = 0;
  while (controller.state === SHUFFLE_STATES.SCRAMBLING && guard++ < 100) {
    controller.handleTick(runtime.tick(2));
  }
  assert.equal(controller.state, SHUFFLE_STATES.PREVIEW);
  assert.equal(committed.length, 2);
  controller.start();
  assert.equal(controller.state, SHUFFLE_STATES.PLAYING);
  assert.equal(runtime.cubeState.isSolved(), false);
});
