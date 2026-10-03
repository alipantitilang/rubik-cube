/** Phase 6 — generic legal scramble generation without move notation. */
import { createTurn, TURN_AXES } from './turn.js';

export const DEFAULT_SCRAMBLE_LENGTH = 20;
export const DEFAULT_SCRAMBLE_SEED = 0x6d2b79f5;
export const DEFAULT_AVOID_SAME_AXIS = true;
const LAYERS = Object.freeze([-1, 1]);
const DIRECTIONS = Object.freeze([-1, 1, 2]);
const MAX_GENERATION_ATTEMPTS_PER_MOVE = 1000;

function normalizeLength(length) {
  if (!Number.isInteger(length) || length < 1 || length > 200) throw new RangeError('scramble length must be an integer from 1 to 200');
  return length;
}
function normalizeSeed(seed) {
  if (!Number.isInteger(seed)) throw new TypeError('seed must be an integer');
  return seed >>> 0;
}
export function createSeededRandom(seed = DEFAULT_SCRAMBLE_SEED) {
  let state = normalizeSeed(seed);
  if (state === 0) state = 0x1;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5; state >>>= 0;
    return state / 0x100000000;
  };
}
function randomIndex(random, size) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('random() must return a number in the range [0, 1).');
  return Math.floor(value * size);
}
export function generateScramble({
  length = DEFAULT_SCRAMBLE_LENGTH,
  seed,
  random = seed === undefined ? Math.random : createSeededRandom(seed),
  avoidSameAxis = DEFAULT_AVOID_SAME_AXIS
} = {}) {
  const count = normalizeLength(length);
  if (typeof random !== 'function') throw new TypeError('random must be a function');
  const turns = [];
  let previousAxis = null;
  let attempts = 0;
  while (turns.length < count) {
    attempts += 1;
    if (attempts > count * MAX_GENERATION_ATTEMPTS_PER_MOVE) throw new Error('Unable to generate scramble with the supplied random source and constraints.');
    const axis = TURN_AXES[randomIndex(random, TURN_AXES.length)];
    if (avoidSameAxis && axis === previousAxis) continue;
    const layer = LAYERS[randomIndex(random, LAYERS.length)];
    const quarterTurns = DIRECTIONS[randomIndex(random, DIRECTIONS.length)];
    const candidate = createTurn({ axis, layer, quarterTurns });
    const previous = turns[turns.length - 1];
    const isImmediateInverse = previous
      && previous.axis === candidate.axis
      && previous.layer === candidate.layer
      && previous.quarterTurns !== 2
      && candidate.quarterTurns !== 2
      && previous.quarterTurns === -candidate.quarterTurns;
    if (isImmediateInverse) continue;
    turns.push(candidate);
    previousAxis = axis;
  }
  return Object.freeze(turns);
}

export function scrambleSummary(scramble) {
  return `${scramble.length} layer turns`;
}
