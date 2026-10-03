/**
 * Phase 1 — Logical Rubik 3×3×3 engine.
 *
 * The logical cube contains 26 visible cubies. The (0,0,0) position is
 * intentionally absent. CubeState is authoritative; rendering is not.
 */

export const FACES = Object.freeze(['U', 'D', 'R', 'L', 'F', 'B']);
export const COLORS = Object.freeze({ U: 'white', D: 'yellow', R: 'red', L: 'orange', F: 'green', B: 'blue' });

const NORMALS = Object.freeze({
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1]
});

const NORMAL_TO_FACE = new Map(Object.entries(NORMALS).map(([face, v]) => [v.join(','), face]));
const POSITIONS = [];
for (const x of [-1, 0, 1]) {
  for (const y of [-1, 0, 1]) {
    for (const z of [-1, 0, 1]) {
      if (x !== 0 || y !== 0 || z !== 0) POSITIONS.push([x, y, z]);
    }
  }
}

export const CUBIE_IDS = Object.freeze(POSITIONS.map(([x, y, z]) => `cubie_${x}_${y}_${z}`));

const MOVE_DEFS = Object.freeze({
  R: { axis: 'x', layer: 1, quarterTurns: -1 },
  L: { axis: 'x', layer: -1, quarterTurns: 1 },
  U: { axis: 'y', layer: 1, quarterTurns: 1 },
  D: { axis: 'y', layer: -1, quarterTurns: -1 },
  F: { axis: 'z', layer: 1, quarterTurns: -1 },
  B: { axis: 'z', layer: -1, quarterTurns: 1 }
});

function cloneVector(v) { return [...v]; }

function rotateVector([x, y, z], axis, quarterTurns) {
  let turns = ((quarterTurns % 4) + 4) % 4;
  let v = [x, y, z];
  while (turns--) {
    if (axis === 'x') v = [v[0], -v[2], v[1]];
    else if (axis === 'y') v = [v[2], v[1], -v[0]];
    else if (axis === 'z') v = [-v[1], v[0], v[2]];
    else throw new Error(`Unknown rotation axis: ${axis}`);
  }
  return v;
}

function rotateFace(face, axis, quarterTurns) {
  const normal = NORMALS[face];
  const rotated = rotateVector(normal, axis, quarterTurns);
  const result = NORMAL_TO_FACE.get(rotated.join(','));
  if (!result) throw new Error(`Invalid rotated face vector: ${rotated.join(',')}`);
  return result;
}

function cloneCubie(cubie) {
  return {
    id: cubie.id,
    position: cloneVector(cubie.position),
    stickers: Object.fromEntries(Object.entries(cubie.stickers))
  };
}

function makeCubie([x, y, z]) {
  const id = `cubie_${x}_${y}_${z}`;
  const stickers = {};
  if (y === 1) stickers.U = COLORS.U;
  if (y === -1) stickers.D = COLORS.D;
  if (x === 1) stickers.R = COLORS.R;
  if (x === -1) stickers.L = COLORS.L;
  if (z === 1) stickers.F = COLORS.F;
  if (z === -1) stickers.B = COLORS.B;
  return { id, position: [x, y, z], stickers };
}

function assertIntegerPosition(position) {
  if (!position.every(Number.isInteger) || position.some(v => v < -1 || v > 1) || position.every(v => v === 0)) {
    throw new Error(`Invalid cubie position: ${position.join(',')}`);
  }
}

export function parseMove(notation) {
  if (typeof notation !== 'string') throw new TypeError('Move notation must be a string');
  const value = notation.trim();
  const match = /^([UDRLFB])([2']?)$/.exec(value);
  if (!match) throw new Error(`Invalid move notation: ${notation}`);
  const face = match[1];
  const modifier = match[2];
  const base = MOVE_DEFS[face];
  const quarterTurns = modifier === '2' ? 2 : modifier === "'" ? -base.quarterTurns : base.quarterTurns;
  return Object.freeze({
    notation: value,
    face,
    axis: base.axis,
    layer: base.layer,
    quarterTurns
  });
}

export function invertMove(move) {
  const parsed = typeof move === 'string' ? parseMove(move) : move;
  const base = MOVE_DEFS[parsed.face].quarterTurns;
  const inverseTurns = ((-parsed.quarterTurns % 4) + 4) % 4;
  const baseTurns = ((base % 4) + 4) % 4;
  const modifier = inverseTurns === 2 ? '2' : inverseTurns === baseTurns ? '' : "'";
  return parseMove(`${parsed.face}${modifier}`);
}

export function invertSequence(sequence) {
  return [...sequence].reverse().map(invertMove);
}

export class CubeState {
  constructor(cubies = null) {
    this.cubies = new Map();
    const source = cubies ?? POSITIONS.map(makeCubie);
    for (const cubie of source) {
      if (this.cubies.has(cubie.id)) throw new Error(`Duplicate cubie id: ${cubie.id}`);
      assertIntegerPosition(cubie.position);
      this.cubies.set(cubie.id, cloneCubie(cubie));
    }
    this.assertValid();
  }

  clone() { return new CubeState([...this.cubies.values()]); }

  getCubie(id) {
    const cubie = this.cubies.get(id);
    if (!cubie) throw new Error(`Unknown cubie: ${id}`);
    return cubie;
  }

  getCubieAt(position) {
    const key = position.join(',');
    for (const cubie of this.cubies.values()) if (cubie.position.join(',') === key) return cubie;
    return null;
  }

  applyMove(move) {
    const parsed = typeof move === 'string' ? parseMove(move) : move;
    const next = this.clone();
    const axisIndex = { x: 0, y: 1, z: 2 }[parsed.axis];
    for (const cubie of next.cubies.values()) {
      if (cubie.position[axisIndex] !== parsed.layer) continue;
      cubie.position = rotateVector(cubie.position, parsed.axis, parsed.quarterTurns);
      const rotatedStickers = {};
      for (const [face, color] of Object.entries(cubie.stickers)) {
        rotatedStickers[rotateFace(face, parsed.axis, parsed.quarterTurns)] = color;
      }
      cubie.stickers = rotatedStickers;
    }
    next.assertValid();
    return next;
  }

  applySequence(sequence) {
    return sequence.reduce((state, move) => state.applyMove(move), this);
  }

  isSolved() {
    for (const cubie of this.cubies.values()) {
      const expectedPosition = cubie.id.replace('cubie_', '').split('_').map(Number);
      if (cubie.position.some((v, i) => v !== expectedPosition[i])) return false;
      for (const [face, color] of Object.entries(cubie.stickers)) {
        if (color !== COLORS[face]) return false;
      }
    }
    return true;
  }

  signature() {
    return [...this.cubies.values()]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(c => `${c.id}@${c.position.join(',')}[${Object.entries(c.stickers).sort().map(([f, col]) => `${f}:${col}`).join('|')}]`)
      .join(';');
  }

  assertValid() {
    if (this.cubies.size !== 26) throw new Error(`Cube must contain 26 cubies, got ${this.cubies.size}`);
    const positions = new Set();
    for (const cubie of this.cubies.values()) {
      assertIntegerPosition(cubie.position);
      const key = cubie.position.join(',');
      if (positions.has(key)) throw new Error(`Two cubies occupy ${key}`);
      positions.add(key);
      for (const face of Object.keys(cubie.stickers)) {
        if (!FACES.includes(face)) throw new Error(`Invalid sticker face: ${face}`);
      }
      const stickerCount = Object.keys(cubie.stickers).length;
      const expectedCount = cubie.position.filter(v => v !== 0).length;
      if (stickerCount !== expectedCount) throw new Error(`Cubie ${cubie.id} has invalid sticker count`);
    }
    if (positions.has('0,0,0')) throw new Error('The internal core position must remain empty');
    return true;
  }
}

export class MoveHistory {
  constructor() { this.moves = []; }
  push(move) { this.moves.push(typeof move === 'string' ? parseMove(move) : move); }
  undo() { return this.moves.pop() ?? null; }
  clear() { this.moves.length = 0; }
  get length() { return this.moves.length; }
  toNotation() { return this.moves.map(m => m.notation).join(' '); }
}

export class MoveQueue {
  constructor() { this.items = []; }
  enqueue(...moves) { this.items.push(...moves.map(m => typeof m === 'string' ? parseMove(m) : m)); }
  dequeue() { return this.items.shift() ?? null; }
  clear() { this.items.length = 0; }
  get length() { return this.items.length; }
  get empty() { return this.items.length === 0; }
}

export function createSolvedCube() { return new CubeState(); }
export function getMoveDefinitions() { return Object.freeze(Object.fromEntries(Object.entries(MOVE_DEFS).map(([k, v]) => [k, Object.freeze({...v})]))); }
