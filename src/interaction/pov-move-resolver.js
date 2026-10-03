import { parseMove } from '../core/cube.js';
import { FACE_NORMALS } from '../render/cube-render-model.js';

const FACE_NAMES = Object.freeze(['U', 'D', 'R', 'L', 'F', 'B']);
export const POV_FRONT_FACES = FACE_NAMES;
const OPPOSITE = Object.freeze({ U: 'D', D: 'U', R: 'L', L: 'R', F: 'B', B: 'F' });
const SLICE_BASE_TURNS = Object.freeze({ M: 1, E: -1, S: -1 });

function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function scale(a, s) { return a.map(v => v * s); }
function normalize(v) { const n = Math.hypot(...v); return n > 1e-9 ? v.map(x => x / n) : [0, 0, 0]; }
function magnitude(v) { return Math.hypot(...v); }
function opposite(face) { return OPPOSITE[face]; }
function faceForNormal(v) {
  let best = 'F'; let score = -Infinity;
  for (const face of FACE_NAMES) {
    const s = dot(v, FACE_NORMALS[face]);
    if (s > score + 1e-9) { best = face; score = s; }
  }
  return best;
}
function bestRemainingFace(v, excluded, normals = FACE_NORMALS) {
  let best = null; let score = -Infinity;
  for (const face of FACE_NAMES) {
    if (excluded.includes(face)) continue;
    const s = dot(v, normals[face]);
    if (s > score + 1e-9) { best = face; score = s; }
  }
  return best;
}

function rotateByQuaternion(v, q) {
  const [qx, qy, qz, qw] = q;
  const [x, y, z] = v;
  const tx = 2 * (qy * z - qz * y);
  const ty = 2 * (qz * x - qx * z);
  const tz = 2 * (qx * y - qy * x);
  return [
    x + qw * tx + (qy * tz - qz * ty),
    y + qw * ty + (qz * tx - qx * tz),
    z + qw * tz + (qx * ty - qy * tx)
  ];
}

/**
 * Build a complete player-relative frame from the camera orientation.
 * All six physical faces may become Front. No color is permanently Up/Down.
 * The camera's screen-right and screen-up choose the remaining orientation.
 */
export function resolvePovFrame({
  cameraPosition,
  target = [0, 0, 0],
  cameraRight = null,
  cameraUp = null,
  cubeQuaternion = null,
  worldFaceNormals = null
}) {
  const worldNormals = worldFaceNormals ?? Object.fromEntries(
    FACE_NAMES.map(face => [face, cubeQuaternion ? rotateByQuaternion(FACE_NORMALS[face], cubeQuaternion) : [...FACE_NORMALS[face]]])
  );
  const outward = normalize(sub(cameraPosition, target));
  const front = FACE_NAMES.reduce((best, face) =>
    dot(worldNormals[face], outward) > dot(worldNormals[best], outward) + 1e-9 ? face : best, FACE_NAMES[0]);
  const back = opposite(front);

  let rightVector = cameraRight ? normalize(cameraRight) : normalize(cross(scale(outward, -1), [0, 1, 0]));
  if (magnitude(rightVector) < 1e-9) rightVector = [1, 0, 0];
  let upVector = cameraUp ? normalize(cameraUp) : normalize(cross(rightVector, scale(outward, -1)));
  if (magnitude(upVector) < 1e-9) upVector = [0, 1, 0];

  let right = bestRemainingFace(rightVector, [front, back], worldNormals);
  let up = bestRemainingFace(upVector, [front, back, right, opposite(right)], worldNormals);

  if (dot(cross(worldNormals[right], worldNormals[up]), worldNormals[front]) < 0) {
    right = opposite(right);
    up = opposite(up);
  }

  return Object.freeze({
    front,
    back,
    right,
    left: opposite(right),
    up,
    down: opposite(up),
    axes: Object.freeze({
      right: [...worldNormals[right]],
      up: [...worldNormals[up]],
      front: [...worldNormals[front]]
    })
  });
}

export function virtualFace(frame, physicalFace) {
  for (const name of ['front', 'back', 'right', 'left', 'up', 'down']) {
    if (frame[name] === physicalFace) return name;
  }
  return null;
}

function normalizeDirection(dragX, dragY) {
  return Math.abs(dragX) >= Math.abs(dragY) ? 'horizontal' : 'vertical';
}

function virtualPosition(cubiePosition, frame) {
  return {
    x: Math.sign(dot(cubiePosition, FACE_NORMALS[frame.right])),
    y: Math.sign(dot(cubiePosition, FACE_NORMALS[frame.up])),
    z: Math.sign(dot(cubiePosition, FACE_NORMALS[frame.front]))
  };
}

// Canonical gesture rules are expressed in a temporary virtual cube whose
// F=red, R=green, U=yellow orientation is the familiar baseline. The result
// is then rotated into the physical notation of the active POV frame.
function resolveCanonicalMove({ selectedVirtualFace, cubieType, x, y, z, dragX, dragY }) {
  const axis = normalizeDirection(dragX, dragY);

  if (selectedVirtualFace === 'front') {
    if (cubieType === 'corner') {
      if (axis === 'horizontal') {
        if (x < 0 && dragX > 0) return y > 0 ? 'U' : "D'";
        if (x > 0 && dragX < 0) return y > 0 ? "U'" : 'D';
      } else {
        if (x < 0 && y > 0 && dragY > 0) return 'L';
        if (x > 0 && y > 0 && dragY > 0) return "R'";
        if (x < 0 && y < 0 && dragY < 0) return "L'";
        if (x > 0 && y < 0 && dragY < 0) return 'R';
      }
    }
    if (cubieType === 'edge') {
      if (axis === 'vertical') {
        if (x === 0 && y > 0 && dragY > 0) return 'M';
        if (x === 0 && y < 0 && dragY < 0) return "M'";
      } else {
        if (x < 0 && dragX > 0) return "E'";
        if (x > 0 && dragX < 0) return 'E';
      }
    }
    if (cubieType === 'center') {
      if (axis === 'horizontal') return dragX > 0 ? "F'" : 'F';
      return dragY < 0 ? "F'" : 'F';
    }
  }

  if (selectedVirtualFace === 'right' && cubieType === 'corner' && y !== 0 && dragY !== 0) {
    if (y > 0 && dragY > 0) return z > 0 ? 'F' : "B'";
    if (y < 0 && dragY < 0) return z > 0 ? "F'" : 'B';
    if (y > 0 && dragY < 0) return z > 0 ? "F'" : 'B';
    if (y < 0 && dragY > 0) return z > 0 ? 'F' : "B'";
  }

  if (selectedVirtualFace === 'left' && cubieType === 'corner' && y !== 0 && dragY !== 0) {
    if (y > 0 && dragY > 0) return z > 0 ? "F'" : 'B';
    if (y < 0 && dragY < 0) return z > 0 ? 'F' : "B'";
    if (y > 0 && dragY < 0) return z > 0 ? 'F' : 'B';
    if (y < 0 && dragY > 0) return z > 0 ? "F'" : "B'";
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

  return null;
}

function physicalMoveFromVirtual(frame, notation) {
  const parsed = parseMove(notation);
  const axisVector = parsed.axis === 'x' ? frame.axes.right : parsed.axis === 'y' ? frame.axes.up : frame.axes.front;
  const desiredAxis = scale(axisVector, Math.sign(parsed.quarterTurns));
  const physicalAxis = Math.abs(desiredAxis[0]) > 0.5 ? 'x' : Math.abs(desiredAxis[1]) > 0.5 ? 'y' : 'z';
  const index = physicalAxis === 'x' ? 0 : physicalAxis === 'y' ? 1 : 2;
  const axisSign = Math.sign(desiredAxis[index]);

  if (['M', 'E', 'S'].includes(parsed.face)) {
    const slice = physicalAxis === 'x' ? 'M' : physicalAxis === 'y' ? 'E' : 'S';
    const baseTurns = SLICE_BASE_TURNS[slice];
    const desiredTurns = parsed.quarterTurns * Math.sign(axisVector[index]);
    if (Math.abs(desiredTurns) === 2) return `${slice}2`;
    return desiredTurns === baseTurns ? slice : `${slice}'`;
  }

  const virtualFaceName = parsed.face === 'U' ? 'up' : parsed.face === 'D' ? 'down' : parsed.face === 'R' ? 'right' : parsed.face === 'L' ? 'left' : parsed.face === 'F' ? 'front' : 'back';
  const face = frame[virtualFaceName];
  const modifier = notation.endsWith('2') ? '2' : notation.endsWith("'") ? "'" : '';
  return `${face}${modifier}`;
}

export function resolvePovMove({ frame, physicalStickerFace, cubieType, cubiePosition, dragX, dragY }) {
  const selectedVirtualFace = virtualFace(frame, physicalStickerFace);
  if (!selectedVirtualFace) return null;
  const p = virtualPosition(cubiePosition, frame);
  const virtualNotation = resolveCanonicalMove({
    selectedVirtualFace,
    cubieType,
    x: p.x,
    y: p.y,
    z: p.z,
    dragX,
    dragY
  });

  if (virtualNotation) return physicalMoveFromVirtual(frame, virtualNotation);

  // A center on any face is a direct face-turn anchor. Its meaning is now
  // fully relative to the active frame, including U/D when they are Front.
  if (cubieType === 'center' && selectedVirtualFace !== 'front') {
    const face = frame[selectedVirtualFace];
    if (normalizeDirection(dragX, dragY) === 'horizontal') return dragX < 0 ? face : `${face}'`;
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
