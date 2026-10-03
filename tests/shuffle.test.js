import test from 'node:test';
import assert from 'node:assert/strict';
import { createSolvedCube, invertMove } from '../src/core/cube.js';
import { createSeededRandom, generateScramble, scrambleNotation } from '../src/core/shuffle.js';

const FACES = new Set(['U', 'D', 'R', 'L', 'F', 'B']);
const AXIS = { U: 'y', D: 'y', R: 'x', L: 'x', F: 'z', B: 'z' };

test('generates the requested number of legal moves', () => {
  const scramble = generateScramble({ length: 25, seed: 12345 });
  assert.equal(scramble.length, 25);
  for (const move of scramble) {
    assert.ok(FACES.has(move.face));
    assert.ok(['', "'", '2'].includes(move.notation.slice(1)));
  }
});

test('does not repeat the same face consecutively', () => {
  const scramble = generateScramble({ length: 100, seed: 77 });
  for (let i = 1; i < scramble.length; i++) assert.notEqual(scramble[i].face, scramble[i - 1].face);
});

test('optional axis avoidance works', () => {
  const scramble = generateScramble({ length: 80, seed: 991, avoidSameAxis: true });
  for (let i = 1; i < scramble.length; i++) {
    assert.notEqual(AXIS[scramble[i].face], AXIS[scramble[i - 1].face]);
  }
});

test('seeded generation is deterministic', () => {
  const a = scrambleNotation(generateScramble({ length: 30, seed: 20261003 }));
  const b = scrambleNotation(generateScramble({ length: 30, seed: 20261003 }));
  assert.equal(a, b);
});

test('different seeds normally produce different scrambles', () => {
  const a = scrambleNotation(generateScramble({ length: 20, seed: 1 }));
  const b = scrambleNotation(generateScramble({ length: 20, seed: 2 }));
  assert.notEqual(a, b);
});

test('scramble keeps the cube mathematically reachable', () => {
  const scramble = generateScramble({ length: 40, seed: 4242 });
  const cube = createSolvedCube().applySequence(scramble);
  assert.equal(cube.cubies.size, 26);
  assert.equal(cube.isSolved(), false);
  assert.doesNotThrow(() => cube.assertValid());
});

test('inverse of generated scramble returns to solved state', () => {
  const scramble = generateScramble({ length: 35, seed: 555 });
  let cube = createSolvedCube().applySequence(scramble);
  const inverse = [...scramble].reverse().map(invertMove);
  cube = cube.applySequence(inverse);
  assert.equal(cube.isSolved(), true);
});


test('seed zero is deterministic and valid', () => {
  const a = scrambleNotation(generateScramble({ length: 20, seed: 0 }));
  const b = scrambleNotation(generateScramble({ length: 20, seed: 0 }));
  assert.equal(a, b);
});

test('invalid random output is rejected', () => {
  assert.throws(
    () => generateScramble({ length: 2, random: () => 1 }),
    /random\(\) must return/
  );
});

test('pathological random source fails instead of looping forever', () => {
  assert.throws(
    () => generateScramble({ length: 2, random: () => 0 }),
    /Unable to generate scramble/
  );
});
