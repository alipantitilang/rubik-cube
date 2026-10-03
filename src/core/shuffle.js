/**
 * Phase 6 — Legal Rubik scramble generation.
 *
 * A scramble is always a sequence of legal face turns. The generator never
 * edits sticker colors or cubie positions directly.
 */
import { FACES, parseMove } from './cube.js';

export const DEFAULT_SCRAMBLE_LENGTH = 20;
export const DEFAULT_SCRAMBLE_SEED = 0x6d2b79f5;

const MODIFIERS = Object.freeze(['', "'", '2']);
const AXIS_BY_FACE = Object.freeze({ U: 'y', D: 'y', R: 'x', L: 'x', F: 'z', B: 'z' });
const MAX_GENERATION_ATTEMPTS_PER_MOVE = 1000;

function normalizeLength(length) {
  if (!Number.isInteger(length) || length < 1 || length > 200) {
    throw new RangeError('scramble length must be an integer from 1 to 200');
  }
  return length;
}

function normalizeSeed(seed) {
  if (!Number.isInteger(seed)) throw new TypeError('seed must be an integer');
  return seed >>> 0;
}

/** Deterministic uint32 PRNG. */
export function createSeededRandom(seed = DEFAULT_SCRAMBLE_SEED) {
  let state = normalizeSeed(seed);
  if (state === 0) state = 0x1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };
}

function randomIndex(random, size) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('random() must return a number in the range [0, 1).');
  }
  return Math.floor(value * size);
}

export function generateScramble({
  length = DEFAULT_SCRAMBLE_LENGTH,
  seed,
  random = seed === undefined ? Math.random : createSeededRandom(seed),
  avoidSameAxis = false
} = {}) {
  const count = normalizeLength(length);
  if (typeof random !== 'function') throw new TypeError('random must be a function');

  const moves = [];
  let previousFace = null;
  let previousAxis = null;

  let attempts = 0;
  while (moves.length < count) {
    attempts += 1;
    if (attempts > count * MAX_GENERATION_ATTEMPTS_PER_MOVE) {
      throw new Error('Unable to generate scramble with the supplied random source and constraints.');
    }

    const face = FACES[randomIndex(random, FACES.length)];
    const axis = AXIS_BY_FACE[face];
    if (face === previousFace) continue;
    if (avoidSameAxis && axis === previousAxis) continue;

    const notation = `${face}${MODIFIERS[randomIndex(random, MODIFIERS.length)]}`;
    moves.push(parseMove(notation));
    previousFace = face;
    previousAxis = axis;
  }

  return Object.freeze(moves);
}

export function scrambleNotation(scramble) {
  return scramble.map(move => (typeof move === 'string' ? move : move.notation)).join(' ');
}
