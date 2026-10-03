import { parseMove } from '../core/cube.js';
import { FACE_NORMALS } from '../render/cube-render-model.js';

const FRAME_BY_FRONT = Object.freeze({
  F: Object.freeze({ front: 'F', back: 'B', right: 'R', left: 'L', up: 'U', down: 'D' }),
  R: Object.freeze({ front: 'R', back: 'L', right: 'B', left: 'F', up: 'U', down: 'D' }),
  B: Object.freeze({ front: 'B', back: 'F', right: 'L', left: 'R', up: 'U', down: 'D' }),
  L: Object.freeze({ front: 'L', back: 'R', right: 'F', left: 'B', up: 'U', down: 'D' })
});

// Only these four physical faces may become the virtual POV front face.
// With the project color scheme they are: F=red, R=green, B=orange, L=blue.
export const POV_FRONT_FACES = Object.freeze(['F', 'R', 'B', 'L']);

function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function normalize(v) {
  const n = Math.hypot(v[0], v[1], v[2]);
  return n ? v.map(x => x / n) : [0, 0, 0];
}
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }

function dominantFrontFace(cameraPosition, target = [0, 0, 0]) {
  const view = normalize(sub(cameraPosition, target));
  // U/D never receive front-face authority. Ignore vertical camera component.
  const horizontal = normalize([view[0], 0, view[2]]);
  if (horizontal[0] === 0 && horizontal[2] === 0) return 'F';

  let best = 'F';
  let bestScore = -Infinity;
  for (const face of POV_FRONT_FACES) {
    const score = dot(horizontal, FACE_NORMALS[face]);
    // Stable priority F > R > B > L resolves an exact diagonal deterministically.
    if (score > bestScore + 1e-9) {
      best = face;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Resolve the fixed Rubik color orientation into the player's POV frame.
 * Only F/R/B/L can become virtual front. U and D are always virtual up/down.
 * The right/left side is defined by the fixed color adjacency, not by camera roll.
 */
export function resolvePovFrame({ cameraPosition, target = [0, 0, 0] }) {
  const front = dominantFrontFace(cameraPosition, target);
  const mapping = FRAME_BY_FRONT[front];
  return Object.freeze({
    ...mapping,
    axes: Object.freeze({
      right: [...FACE_NORMALS[mapping.right]],
      up: [...FACE_NORMALS[mapping.up]],
      front: [...FACE_NORMALS[mapping.front]]
    })
  });
}

export function virtualFace(frame, physicalFace) {
  for (const name of ['front', 'back', 'right', 'left', 'up', 'down']) {
    if (frame[name] === physicalFace) return name;
  }
  return null;
}

function move(face, inverse = false) {
  return parseMove(`${face}${inverse ? "'" : ''}`);
}

function normalizeDirection(dragX, dragY) {
  return Math.abs(dragX) >= Math.abs(dragY) ? 'horizontal' : 'vertical';
}

function resolveFrontCorner({ x, y, dragX, dragY }) {
  const axis = normalizeDirection(dragX, dragY);
  if (axis === 'horizontal') {
    if (x < 0 && y > 0 && dragX > 0) return "U'";
    if (x > 0 && y > 0 && dragX < 0) return 'U';
    if (x < 0 && y < 0 && dragX > 0) return 'D';
    if (x > 0 && y < 0 && dragX < 0) return "D'";
  } else {
    if (x < 0 && y > 0 && dragY > 0) return 'L';
    if (x > 0 && y > 0 && dragY > 0) return "R'";
    if (x < 0 && y < 0 && dragY < 0) return "L'";
    if (x > 0 && y < 0 && dragY < 0) return 'R';
  }
  return null;
}

function resolveFrontEdge({ x, y, dragX, dragY }) {
  const axis = normalizeDirection(dragX, dragY);
  if (axis === 'vertical' && x === 0 && y > 0 && dragY > 0) return 'M';
  if (axis === 'horizontal' && x < 0 && y === 0 && dragX > 0) return 'E';
  if (axis === 'vertical' && x === 0 && y < 0 && dragY < 0) return "M'";
  if (axis === 'horizontal' && x > 0 && y === 0 && dragX < 0) return "E'";
  return null;
}

/**
 * Resolve manual interaction from the user-defined POV table.
 * The selected sticker may be on virtual F, R, or L. U/D are not front-authority faces.
 * Reverse drags resolve to the inverse of the listed move.
 */
export function resolvePovMove({ frame, physicalStickerFace, cubieType, cubiePosition, dragX, dragY }) {
  const selectedVirtualFace = virtualFace(frame, physicalStickerFace);
  if (!selectedVirtualFace) return null;

  const frontNormal = FACE_NORMALS[frame.front];
  const rightNormal = FACE_NORMALS[frame.right];
  const upNormal = FACE_NORMALS[frame.up];
  const x = Math.sign(dot(cubiePosition, rightNormal));
  const y = Math.sign(dot(cubiePosition, upNormal));

  if (selectedVirtualFace === 'front') {
    if (cubieType === 'corner') {
      if (frame.front === 'F' && Math.abs(dragX) >= Math.abs(dragY)) {
        if (x < 0 && dragX > 0) return y > 0 ? 'U' : "D'";
        if (x > 0 && dragX < 0) return y > 0 ? "U'" : 'D';
      }
      return resolveFrontCorner({ x, y, dragX, dragY });
    }
    if (cubieType === 'edge') {
      if (frame.front === 'F' && Math.abs(dragX) >= Math.abs(dragY)) {
        if (x < 0 && dragX > 0) return "E'";
        if (x > 0 && dragX < 0) return 'E';
      }
      return resolveFrontEdge({ x, y, dragX, dragY });
    }
    if (cubieType === 'center') {
      if (Math.abs(dragX) >= Math.abs(dragY)) return dragX > 0 ? `${frame.front}'` : frame.front;
      return dragY < 0 ? `${frame.front}'` : frame.front;
    }
  }

  if (selectedVirtualFace === 'right' && cubieType === 'corner' && y !== 0 && dragY !== 0) {
    const z = Math.sign(dot(cubiePosition, frontNormal));
    if (y > 0 && dragY > 0) return z > 0 ? 'F' : "B'";
    if (y < 0 && dragY < 0) return z > 0 ? "F'" : 'B';
    if (y > 0 && dragY < 0) return z > 0 ? "F'" : 'B';
    if (y < 0 && dragY > 0) return z > 0 ? 'F' : "B'";
  }

  if (selectedVirtualFace === 'left' && cubieType === 'corner' && y !== 0 && dragY !== 0) {
    const z = Math.sign(dot(cubiePosition, frontNormal));
    if (y > 0 && dragY > 0) return z > 0 ? "F'" : 'B';
    if (y < 0 && dragY < 0) return z > 0 ? 'F' : "B'";
    if (y > 0 && dragY < 0) return z > 0 ? 'F' : 'B';
    if (y < 0 && dragY > 0) return z > 0 ? "F'" : 'B';
  }

  if (selectedVirtualFace === 'right' && cubieType === 'edge' && y !== 0 && dragY !== 0) {
    if (y > 0 && dragY > 0) return 'S';
    if (y < 0 && dragY < 0) return "S'";
    if (y > 0 && dragY < 0) return "S'";
    if (y < 0 && dragY > 0) return 'S';
  }

  if (selectedVirtualFace === 'left' && cubieType === 'edge' && y !== 0 && dragY !== 0) {
    if (y > 0 && dragY < 0) return "S'";
    if (y < 0 && dragY > 0) return 'S';
    if (y > 0 && dragY > 0) return 'S';
    if (y < 0 && dragY < 0) return "S'";
  }

  // Yellow/White centers are not POV-front faces, but they remain draggable
  // interaction anchors. Their only unambiguous operation is their own face turn.
  if ((selectedVirtualFace === 'up' || selectedVirtualFace === 'down') && cubieType === 'center') {
    const face = frame[selectedVirtualFace];
    if (Math.abs(dragX) >= Math.abs(dragY)) return dragX < 0 ? face : `${face}'`;
    return dragY > 0 ? face : `${face}'`;
  }

  return null;
}

export function getPovStickerContext({ frame, physicalStickerFace, cubieType, cubiePosition }) {
  return Object.freeze({
    physicalStickerFace,
    virtualStickerFace: virtualFace(frame, physicalStickerFace),
    cubieType,
    cubiePosition: [...cubiePosition]
  });
}
