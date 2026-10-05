/**
 * Logical Rubik 3×3×3 engine.
 *
 * The authoritative movement model is a generic layer turn:
 * { axis, layer, quarterTurns }.
 *
 * Sticker identities and physical position IDs are independent from movement.
 * No face-move notation is required by the engine.
 */

import {
  stickerCodeFromPosition,
  stickerPositionId,
  SOLVED_STICKERS,
  initialPositionForSticker
} from './sticker-map.js';
import { createTurn } from './turn.js';

export const FACES = Object.freeze(['U', 'D', 'R', 'L', 'F', 'B']);
export const COLORS = Object.freeze({ U: 'yellow', D: 'white', R: 'green', L: 'blue', F: 'red', B: 'orange' });
const NORMALS = Object.freeze({
  U: [0, 1, 0], D: [0, -1, 0], R: [1, 0, 0], L: [-1, 0, 0], F: [0, 0, 1], B: [0, 0, -1]
});
const NORMAL_TO_FACE = new Map(Object.entries(NORMALS).map(([face, v]) => [v.join(','), face]));
const POSITIONS = [];
for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) {
  if (x !== 0 || y !== 0 || z !== 0) POSITIONS.push([x, y, z]);
}
export const CUBIE_IDS = Object.freeze(POSITIONS.map(([x, y, z]) => `cubie_${x}_${y}_${z}`));


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
  const rotated = rotateVector(NORMALS[face], axis, quarterTurns);
  const result = NORMAL_TO_FACE.get(rotated.join(','));
  if (!result) throw new Error(`Invalid rotated face vector: ${rotated.join(',')}`);
  return result;
}

function cloneCubie(cubie) {
  return {
    id: cubie.id,
    position: cloneVector(cubie.position),
    stickers: Object.fromEntries(Object.entries(cubie.stickers)),
    stickerIds: Object.fromEntries(Object.entries(cubie.stickerIds))
  };
}

function makeCubie([x, y, z]) {
  const id = `cubie_${x}_${y}_${z}`;
  const stickers = {};
  const stickerIds = {};
  const add = (face, color) => {
    stickers[face] = color;
    stickerIds[face] = stickerCodeFromPosition(face, [x, y, z]);
  };
  if (y === 1) add('U', COLORS.U);
  if (y === -1) add('D', COLORS.D);
  if (x === 1) add('R', COLORS.R);
  if (x === -1) add('L', COLORS.L);
  if (z === 1) add('F', COLORS.F);
  if (z === -1) add('B', COLORS.B);
  return { id, position: [x, y, z], stickers, stickerIds };
}

function assertIntegerPosition(position) {
  if (!position.every(Number.isInteger) || position.some(v => v < -1 || v > 1) || position.every(v => v === 0)) {
    throw new Error(`Invalid cubie position: ${position.join(',')}`);
  }
}

function normalizeTurn(turn) {
  return createTurn(turn);
}

export class CubeState {
  constructor(cubies = null) {
    this.cubies = new Map();
    const source = cubies ?? POSITIONS.map(makeCubie);
    for (const cubie of source) {
      if (this.cubies.has(cubie.id)) throw new Error(`Duplicate cubie id: ${cubie.id}`);
      assertIntegerPosition(cubie.position);
      if (!cubie.stickerIds) throw new Error(`Cubie ${cubie.id} is missing sticker identities`);
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

  applyTurn(turn) {
    const parsed = normalizeTurn(turn);
    const next = this.clone();
    const axisIndex = { x: 0, y: 1, z: 2 }[parsed.axis];
    for (const cubie of next.cubies.values()) {
      if (cubie.position[axisIndex] !== parsed.layer) continue;
      cubie.position = rotateVector(cubie.position, parsed.axis, parsed.quarterTurns);
      const rotatedStickers = {};
      const rotatedStickerIds = {};
      for (const [face, color] of Object.entries(cubie.stickers)) {
        const nextFace = rotateFace(face, parsed.axis, parsed.quarterTurns);
        rotatedStickers[nextFace] = color;
        rotatedStickerIds[nextFace] = cubie.stickerIds[face];
      }
      cubie.stickers = rotatedStickers;
      cubie.stickerIds = rotatedStickerIds;
    }
    next.assertValid();
    return next;
  }

  applyMove(move) { return this.applyTurn(normalizeTurn(move)); }
  applySequence(sequence) { return sequence.reduce((state, move) => state.applyMove(move), this); }

  getStickerPositions() {
    const result = {};
    for (const cubie of this.cubies.values()) {
      for (const [face, code] of Object.entries(cubie.stickerIds)) {
        result[code] = stickerPositionId(face, cubie.position);
      }
    }
    return Object.freeze(result);
  }

  getStickerRecords() {
    return SOLVED_STICKERS.map(solved => {
      const position = this.getStickerPositions()[solved.code];
      return Object.freeze({ code: solved.code, color: solved.color, position, initialPosition: solved.position });
    });
  }

  isSolved() {
    const positions = this.getStickerPositions();
    return SOLVED_STICKERS.every(sticker => positions[sticker.code] === sticker.position);
  }

  /**
   * UI-facing solved check based on visible sticker colors. This is useful as
   * a manual Finish fallback because identical-color stickers are visually
   * indistinguishable even though sticker identity history remains strict.
   */
  isColorSolved() {
    return this.isColorGroupedSolved();
  }

  /**
   * Finish-time solved check based on sticker color groups rather than
   * permanent sticker identities. Every one of the nine stickers belonging
   * to a color must currently occupy the same visible face, and each face
   * must contain exactly one color group.
   *
   * This intentionally does not assume that a particular color is tied to a
   * permanent world face: centers can move through legal middle-slice turns.
   */
  isColorGroupedSolved() {
    const colorFaces = new Map();
    const faceColors = new Map();
    const countsByColor = new Map();

    for (const cubie of this.cubies.values()) {
      for (const [face, color] of Object.entries(cubie.stickers)) {
        if (!colorFaces.has(color)) colorFaces.set(color, face);
        if (colorFaces.get(color) !== face) return false;

        if (!faceColors.has(face)) faceColors.set(face, color);
        if (faceColors.get(face) !== color) return false;

        countsByColor.set(color, (countsByColor.get(color) ?? 0) + 1);
      }
    }

    if (colorFaces.size !== 6 || faceColors.size !== 6) return false;
    return [...countsByColor.values()].every(count => count === 9);
  }

  signature() {
    return [...this.cubies.values()].sort((a, b) => a.id.localeCompare(b.id)).map(c =>
      `${c.id}@${c.position.join(',')}[${Object.entries(c.stickerIds).sort().map(([f, id]) => `${f}:${id}`).join('|')}]`
    ).join(';');
  }

  assertValid() {
    if (this.cubies.size !== 26) throw new Error(`Cube must contain 26 cubies, got ${this.cubies.size}`);
    const positions = new Set();
    const stickerCodes = new Set();
    for (const cubie of this.cubies.values()) {
      assertIntegerPosition(cubie.position);
      const key = cubie.position.join(',');
      if (positions.has(key)) throw new Error(`Two cubies occupy ${key}`);
      positions.add(key);
      const faces = Object.keys(cubie.stickers);
      if (faces.length !== Object.keys(cubie.stickerIds).length) throw new Error(`Cubie ${cubie.id} has mismatched sticker metadata`);
      for (const face of faces) {
        if (!FACES.includes(face)) throw new Error(`Invalid sticker face: ${face}`);
        const code = cubie.stickerIds[face];
        if (stickerCodes.has(code)) throw new Error(`Duplicate sticker code: ${code}`);
        stickerCodes.add(code);
        if (cubie.stickers[face] === undefined) throw new Error(`Sticker ${code} has no color`);
        if (initialPositionForSticker(code) === undefined) throw new Error(`Unknown sticker code: ${code}`);
      }
      const stickerCount = faces.length;
      const expectedCount = cubie.position.filter(v => v !== 0).length;
      if (stickerCount !== expectedCount) throw new Error(`Cubie ${cubie.id} has invalid sticker count`);
    }
    if (positions.has('0,0,0')) throw new Error('The internal core position must remain empty');
    if (stickerCodes.size !== 54) throw new Error(`Cube must contain 54 stickers, got ${stickerCodes.size}`);
    return true;
  }
}

export class StickerHistory {
  constructor() {
    this.events = [];
    this.bySticker = new Map(SOLVED_STICKERS.map(sticker => [sticker.code, []]));
  }

  record(beforeCube, afterCube, turn) {
    const before = beforeCube.getStickerPositions();
    const after = afterCube.getStickerPositions();
    const changes = SOLVED_STICKERS
      .map(sticker => ({ code: sticker.code, from: before[sticker.code], to: after[sticker.code] }))
      .filter(change => change.from !== change.to)
      .map(change => Object.freeze(change));
    const event = Object.freeze({ index: this.events.length + 1, turn: Object.freeze({ ...createTurn(turn) }), changes: Object.freeze(changes) });
    this.events.push(event);
    for (const change of changes) this.bySticker.get(change.code).push(Object.freeze({ event: event.index, from: change.from, to: change.to }));
    return event;
  }

  get length() { return this.events.length; }
  clear() { this.events.length = 0; for (const list of this.bySticker.values()) list.length = 0; }
  getAll() { return Object.freeze([...this.events]); }
  getStickerHistory(code) {
    if (!this.bySticker.has(code)) throw new Error(`Unknown sticker code: ${code}`);
    return Object.freeze(this.bySticker.get(code).map(change => {
      const event = this.events[change.event - 1];
      return Object.freeze({ event: change.event, turn: event.turn, from: change.from, to: change.to });
    }));
  }
  snapshot(cubeState) { return cubeState.getStickerPositions(); }
}

export function createSolvedCube() { return new CubeState(); }