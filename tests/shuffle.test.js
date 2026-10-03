import test from 'node:test';
import assert from 'node:assert/strict';
import { createSolvedCube } from '../src/core/cube.js';
import { createSeededRandom, generateScramble, scrambleSummary } from '../src/core/shuffle.js';

test('generates the requested number of generic outer-layer turns', () => {
  const scramble = generateScramble({ length: 25, seed: 12345 });
  assert.equal(scramble.length, 25);
  for (const turn of scramble) {
    assert.ok(['x', 'y', 'z'].includes(turn.axis));
    assert.ok([-1, 1].includes(turn.layer));
    assert.ok([-1, 1, 2].includes(turn.quarterTurns));
  }
});

test('does not repeat the same axis consecutively when requested', () => {
  const scramble = generateScramble({ length: 100, seed: 77, avoidSameAxis: true });
  for (let i = 1; i < scramble.length; i++) assert.notEqual(scramble[i].axis, scramble[i - 1].axis);
});

test('seeded generation is deterministic', () => {
  const a = generateScramble({ length: 30, seed: 20261003 });
  const b = generateScramble({ length: 30, seed: 20261003 });
  assert.deepEqual(a, b);
});

test('different seeds normally produce different turn sequences', () => {
  const a = generateScramble({ length: 20, seed: 1 });
  const b = generateScramble({ length: 20, seed: 2 });
  assert.notDeepEqual(a, b);
});

test('scramble keeps the cube mathematically reachable', () => {
  const scramble = generateScramble({ length: 40, seed: 4242 });
  const cube = createSolvedCube().applySequence(scramble);
  assert.equal(cube.cubies.size, 26); assert.equal(cube.isSolved(), false); assert.doesNotThrow(() => cube.assertValid());
});

test('inverse generic turn sequence returns to solved state', () => {
  const scramble = generateScramble({ length: 35, seed: 555 });
  let cube = createSolvedCube().applySequence(scramble);
  const inverse = [...scramble].reverse().map(turn => ({ ...turn, quarterTurns: turn.quarterTurns === 2 ? 2 : -turn.quarterTurns }));
  cube = cube.applySequence(inverse);
  assert.equal(cube.isSolved(), true);
});

test('seed zero is deterministic and valid', () => {
  assert.deepEqual(generateScramble({ length: 20, seed: 0 }), generateScramble({ length: 20, seed: 0 }));
});

test('summary contains no move notation', () => {
  assert.equal(scrambleSummary([{ axis: 'x', layer: 1, quarterTurns: 1 }]), '1 layer turns');
});

test('seeded random helper is deterministic', () => {
  const a = createSeededRandom(123); const b = createSeededRandom(123);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
});

test('invalid random output is rejected', () => {
  assert.throws(() => generateScramble({ length: 2, random: () => 1 }), /random\(\) must return/);
});

test('pathological random source fails instead of looping forever', () => {
  assert.throws(() => generateScramble({ length: 2, random: () => 0, avoidSameAxis: true }), /Unable to generate scramble/);
});
