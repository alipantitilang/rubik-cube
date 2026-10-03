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

const VERTICAL_FRONT_CORNER_MOVES = Object.freeze({
  F: Object.freeze({ topLeftDown: 'L', topRightDown: "R'", bottomLeftUp: "L'", bottomRightUp: 'R' }),
  R: Object.freeze({ topLeftDown: 'F', topRightDown: "B'", bottomLeftUp: "F'", bottomRightUp: 'B' }),
  B: Object.freeze({ topLeftDown: 'R', topRightDown: "L'", bottomLeftUp: "R'", bottomRightUp: 'L' }),
  L: Object.freeze({ topLeftDown: 'B', topRightDown: "F'", bottomLeftUp: "B'", bottomRightUp: 'F' })
});

const VERTICAL_FRONT_EDGE_MOVES = Object.freeze({
  F: Object.freeze({ topDown: 'M', bottomUp: "M'" }),
  R: Object.freeze({ topDown: "S'", bottomUp: 'S' }),
  B: Object.freeze({ topDown: "M'", bottomUp: 'M' }),
  L: Object.freeze({ topDown: 'S', bottomUp: "S'" })
});

function resolveFrontCorner({ front, x, y, dragX, dragY }) {
  const axis = normalizeDirection(dragX, dragY);
  if (axis === 'horizontal') {
    if (x < 0 && y > 0 && dragX > 0) return "U'";
    if (x > 0 && y > 0 && dragX < 0) return 'U';
    if (x < 0 && y < 0 && dragX > 0) return "D'";
    if (x > 0 && y < 0 && dragX < 0) return 'D';
  } else {
    const moves = VERTICAL_FRONT_CORNER_MOVES[front];
    if (x < 0 && y > 0 && dragY > 0) return moves.topLeftDown;
    if (x > 0 && y > 0 && dragY > 0) return moves.topRightDown;
    if (x < 0 && y < 0 && dragY < 0) return moves.bottomLeftUp;
    if (x > 0 && y < 0 && dragY < 0) return moves.bottomRightUp;
  }
  return null;
}

function resolveFrontEdge({ front, x, y, dragX, dragY }) {
  const axis = normalizeDirection(dragX, dragY);
  if (axis === 'vertical') {
    const moves = VERTICAL_FRONT_EDGE_MOVES[front];
    if (x === 0 && y > 0 && dragY > 0) return moves.topDown;
    if (x === 0 && y < 0 && dragY < 0) return moves.bottomUp;
  }
  if (axis === 'horizontal' && x < 0 && y === 0 && dragX > 0) return 'E';
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

  const front = frame.front;
  const frontNormal = FACE_NORMALS[frame.front];
  const rightNormal = FACE_NORMALS[frame.right];
  const upNormal = FACE_NORMALS[frame.up];
  const x = Math.sign(dot(cubiePosition, rightNormal));
  const y = Math.sign(dot(cubiePosition, upNormal));

  if (selectedVirtualFace === 'front') {
    if (cubieType === 'corner') {
      // Horizontal front-face movement follows the user's visual grab direction
      // for every eligible POV front, not only red/F.
      if (Math.abs(dragX) >= Math.abs(dragY)) {
        if (x < 0 && dragX > 0) return y > 0 ? 'U' : "D'";
        if (x > 0 && dragX < 0) return y > 0 ? "U'" : 'D';
      }
      return resolveFrontCorner({ front: frame.front, x, y, dragX, dragY });
    }
    if (cubieType === 'edge') {
      // The same visual-direction contract applies to the front left/right
      // middle edges in every F/R/B/L POV frame.
      if (Math.abs(dragX) >= Math.abs(dragY)) {
        if (x < 0 && dragX > 0) return "E'";
        if (x > 0 && dragX < 0) return 'E';
      }
      return resolveFrontEdge({ front: frame.front, x, y, dragX, dragY });
    }
    if (cubieType === 'center') {
      if (Math.abs(dragX) >= Math.abs(dragY)) return dragX > 0 ? `${frame.front}'` : frame.front;
      return dragY < 0 ? `${frame.front}'` : frame.front;
    }
  }

  if (selectedVirtualFace === 'right' && cubieType === 'corner' && y !== 0 && dragY !== 0) {
    const z = Math.sign(dot(cubiePosition, frontNormal));
    if (y > 0 && dragY > 0) return z > 0 ? front : `${frame.back}'`;
    if (y < 0 && dragY < 0) return z > 0 ? `${front}'` : frame.back;
    if (y > 0 && dragY < 0) return z > 0 ? `${front}'` : frame.back;
    if (y < 0 && dragY > 0) return z > 0 ? front : `${frame.back}'`;
  }

  if (selectedVirtualFace === 'left' && cubieType === 'corner' && y !== 0 && dragY !== 0) {
    const z = Math.sign(dot(cubiePosition, frontNormal));
    if (y > 0 && dragY > 0) return z > 0 ? `${front}'` : frame.back;
    if (y < 0 && dragY < 0) return z > 0 ? front : `${frame.back}'`;
    if (y > 0 && dragY < 0) return z > 0 ? front : frame.back;
    if (y < 0 && dragY > 0) return z > 0 ? `${front}'` : frame.back;
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
