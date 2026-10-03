/**
 * Stable identity for all 54 visible color stickers and their 54 physical slots.
 *
 * These IDs are not move notation. They identify a sticker and a slot only.
 * A sticker keeps its code forever; its current position is one of p01..p54.
 */

export const STICKER_FACES = Object.freeze([
  { face: 'F', color: 'red', prefix: 'r', offset: 0 },
  { face: 'B', color: 'orange', prefix: 'o', offset: 9 },
  { face: 'U', color: 'yellow', prefix: 'y', offset: 18 },
  { face: 'D', color: 'white', prefix: 'w', offset: 27 },
  { face: 'R', color: 'green', prefix: 'g', offset: 36 },
  { face: 'L', color: 'blue', prefix: 'b', offset: 45 }
]);

export const FACE_STICKER_LAYOUT = Object.freeze({
  F: { normal: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] },
  B: { normal: [0, 0, -1], right: [-1, 0, 0], up: [0, 1, 0] },
  U: { normal: [0, 1, 0], right: [1, 0, 0], up: [0, 0, -1] },
  D: { normal: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1] },
  R: { normal: [1, 0, 0], right: [0, 0, -1], up: [0, 1, 0] },
  L: { normal: [-1, 0, 0], right: [0, 0, 1], up: [0, 1, 0] }
});

const FACE_BY_NAME = Object.freeze(Object.fromEntries(STICKER_FACES.map(item => [item.face, item])));
const FACE_BY_COLOR = Object.freeze(Object.fromEntries(STICKER_FACES.map(item => [item.color, item])));
const CORNER_GRID = new Map([[1, 'c1'], [3, 'c2'], [9, 'c3'], [7, 'c4']]);
const EDGE_GRID = new Map([[2, 'e1'], [6, 'e2'], [8, 'e3'], [4, 'e4']]);

function assertFace(face) {
  if (!FACE_BY_NAME[face]) throw new Error(`Unknown sticker face: ${face}`);
}

function slotIndexFromGrid(row, col) {
  if (![0, 1, 2].includes(row) || ![0, 1, 2].includes(col)) {
    throw new Error(`Invalid sticker grid: row=${row}, col=${col}`);
  }
  return row * 3 + col + 1;
}

function gridFromPosition(face, position) {
  assertFace(face);
  const basis = FACE_STICKER_LAYOUT[face];
  const colCoord = position[0] * basis.right[0] + position[1] * basis.right[1] + position[2] * basis.right[2];
  const upCoord = position[0] * basis.up[0] + position[1] * basis.up[1] + position[2] * basis.up[2];
  const row = 1 - upCoord;
  const col = colCoord + 1;
  return { row, col };
}

export function stickerSlotIndex(face, position) {
  const { row, col } = gridFromPosition(face, position);
  return slotIndexFromGrid(row, col);
}

export function stickerPositionId(face, position) {
  assertFace(face);
  const slot = stickerSlotIndex(face, position);
  return `p${String(FACE_BY_NAME[face].offset + slot).padStart(2, '0')}`;
}

export function stickerRoleFromSlot(slot) {
  if (CORNER_GRID.has(slot)) return CORNER_GRID.get(slot);
  if (EDGE_GRID.has(slot)) return EDGE_GRID.get(slot);
  if (slot === 5) return 'c';
  throw new Error(`Invalid sticker slot: ${slot}`);
}

export function stickerCode(face, slot) {
  assertFace(face);
  const role = stickerRoleFromSlot(slot);
  return `${FACE_BY_NAME[face].prefix}${role}`;
}

export function stickerCodeFromPosition(face, position) {
  return stickerCode(face, stickerSlotIndex(face, position));
}

export function stickerDefinition(code) {
  const item = SOLVED_STICKERS.find(sticker => sticker.code === code);
  if (!item) throw new Error(`Unknown sticker code: ${code}`);
  return item;
}

export function colorFace(color) {
  const item = FACE_BY_COLOR[color];
  if (!item) throw new Error(`Unknown sticker color: ${color}`);
  return item.face;
}

export function createSolvedStickerRegistry() {
  const result = [];
  for (const item of STICKER_FACES) {
    for (let slot = 1; slot <= 9; slot++) {
      const code = stickerCode(item.face, slot);
      result.push(Object.freeze({
        code,
        color: item.color,
        face: item.face,
        slot,
        position: `p${String(item.offset + slot).padStart(2, '0')}`,
        role: stickerRoleFromSlot(slot)
      }));
    }
  }
  return Object.freeze(result);
}

export const SOLVED_STICKERS = createSolvedStickerRegistry();
export const STICKER_CODES = Object.freeze(SOLVED_STICKERS.map(item => item.code));
export const STICKER_POSITION_IDS = Object.freeze(SOLVED_STICKERS.map(item => item.position));

export function initialPositionForSticker(code) {
  const item = SOLVED_STICKERS.find(sticker => sticker.code === code);
  if (!item) throw new Error(`Unknown sticker code: ${code}`);
  return item.position;
}

export function solvedCodeForPosition(positionId) {
  const item = SOLVED_STICKERS.find(sticker => sticker.position === positionId);
  if (!item) throw new Error(`Unknown sticker position: ${positionId}`);
  return item.code;
}
