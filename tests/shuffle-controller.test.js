import test from 'node:test';
import assert from 'node:assert/strict';
import { CubeTurnRuntime } from '../src/animation/cube-turn-runtime.js';
import { FaceTurnAnimator } from '../src/animation/face-turn-animator.js';
import { createSolvedCube } from '../src/core/cube.js';
import { ShuffleController, SHUFFLE_STATES } from '../src/animation/shuffle-controller.js';

function makeController(overrides = {}) {
  const runtime = new CubeTurnRuntime({
    cubeState: createSolvedCube(),
    animator: new FaceTurnAnimator({ durationMs: 10 })
  });
  const interaction = { enabled: true, setEnabled(value) { this.enabled = value; } };
  const controller = new ShuffleController({
    runtime,
    interaction,
    length: 4,
    durationMs: 2,
    random: (() => { let n = 0; return () => ((n++ * 0.61803398875) % 1); })(),
    ...overrides
  });
  return { runtime, interaction, controller };
}

test('play enters scrambling and locks manual interaction', () => {
  const { controller, interaction } = makeController();
  assert.equal(controller.play(), true);
  assert.equal(controller.state, SHUFFLE_STATES.SCRAMBLING);
  assert.equal(interaction.enabled, false);
  assert.equal(controller.scramble.length, 4);
});

test('play is ignored while already scrambling', () => {
  const { controller } = makeController();
  assert.equal(controller.play(), true);
  assert.equal(controller.play(), false);
});

test('completed scramble transitions to playing and unlocks interaction', () => {
  const { runtime, controller, interaction } = makeController();
  controller.play({ seed: 42 });
  let guard = 0;
  while (controller.state === SHUFFLE_STATES.SCRAMBLING && guard++ < 100) {
    const result = runtime.tick(5);
    controller.handleTick(result);
  }
  assert.ok(guard < 100);
  assert.equal(controller.state, SHUFFLE_STATES.PLAYING);
  assert.equal(interaction.enabled, true);
  assert.equal(runtime.cubeState.isSolved(), false);
});

test('reset returns to idle', () => {
  const { controller, interaction } = makeController();
  controller.play();
  controller.reset();
  assert.equal(controller.state, SHUFFLE_STATES.IDLE);
  assert.equal(controller.scramble.length, 0);
  assert.equal(interaction.enabled, true);
});


test('reset safely cancels an active runtime turn and resynchronizes it', () => {
  const calls = [];
  const runtime = new CubeTurnRuntime({
    cubeState: createSolvedCube(),
    animator: new FaceTurnAnimator({ durationMs: 10 }),
    adapter: { begin() {}, update() {}, finish() { calls.push('finish'); } },
    renderer: { renderCube() { calls.push('render'); } }
  });
  const interaction = { enabled: true, setEnabled(value) { this.enabled = value; } };
  const controller = new ShuffleController({
    runtime,
    interaction,
    length: 3,
    durationMs: 2
  });

  controller.play({ seed: 42 });
  runtime.tick(1);
  controller.reset();

  assert.equal(runtime.busy, false);
  assert.equal(controller.state, SHUFFLE_STATES.IDLE);
  assert.equal(interaction.enabled, true);
  assert.deepEqual(calls, ['finish', 'render']);
});
