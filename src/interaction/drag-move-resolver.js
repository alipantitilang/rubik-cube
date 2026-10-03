import { FACE_NORMALS } from '../render/cube-render-model.js';
import { createTurn } from '../core/turn.js';

const AXES = Object.freeze([
  { name: 'x', index: 0, vector: [1, 0, 0] },
  { name: 'y', index: 1, vector: [0, 1, 0] },
  { name: 'z', index: 2, vector: [0, 0, 1] }
]);

function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function sub(a, b) { return a.map((v, i) => v - b[i]); }
function scale(a, s) { return a.map(v => v * s); }
function normalize(v) {
  const n = Math.hypot(...v);
  return n > 1e-9 ? v.map(x => x / n) : [0, 0, 0];
}
function magnitude(v) { return Math.hypot(...v); }
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
function inverseRotateByQuaternion(v, q) {
  return rotateByQuaternion(v, [-q[0], -q[1], -q[2], q[3]]);
}
function worldVectorFromScreenDelta(dx, dy, cameraRight, cameraUp) {
  return normalize([
    cameraRight[0] * dx - cameraUp[0] * dy,
    cameraRight[1] * dx - cameraUp[1] * dy,
    cameraRight[2] * dx - cameraUp[2] * dy
  ]);
}
function canonicalAxis(axisVector) {
  let best = AXES[0];
  let score = -Infinity;
  for (const axis of AXES) {
    const s = Math.abs(dot(axisVector, axis.vector));
    if (s > score + 1e-9) {
      best = axis;
      score = s;
    }
  }
  return { ...best, sign: Math.sign(dot(axisVector, best.vector)) || 1 };
}

/**
 * Resolve a sticker drag directly into a generic layer turn.
 *
 * No Front/Back/Up/Down/Left/Right move notation exists here. The result is
 * simply the local axis, the selected layer, and the quarter-turn direction.
 */
export function resolveDragTurn({
  physicalStickerFace,
  cubiePosition,
  dragX,
  dragY,
  cameraRight = [1, 0, 0],
  cameraUp = [0, 1, 0],
  cubeQuaternion = [0, 0, 0, 1]
}) {
  if (!FACE_NORMALS[physicalStickerFace]) return null;
  if (!Array.isArray(cubiePosition) || cubiePosition.length !== 3) return null;
  if (Math.hypot(dragX, dragY) < 1e-9) return null;

  const stickerNormal = FACE_NORMALS[physicalStickerFace];
  const worldDrag = worldVectorFromScreenDelta(dragX, dragY, cameraRight, cameraUp);
  const localDrag = inverseRotateByQuaternion(worldDrag, cubeQuaternion);
  const tangent = normalize(sub(localDrag, scale(stickerNormal, dot(localDrag, stickerNormal))));
  if (magnitude(tangent) < 1e-6) return null;

  // Positive rotation moves the sticker normal toward the drag tangent.
  // Therefore n × tangent is the geometric rotation axis.
  const layerAxis = canonicalAxis(normalize(cross(stickerNormal, tangent)));
  const layer = Math.sign(cubiePosition[layerAxis.index]);
  const quarterTurns = layerAxis.sign;

  return createTurn({ axis: layerAxis.name, layer, quarterTurns });
}

// Alias kept for callers that used the previous resolver name.
export const resolveDragMove = resolveDragTurn;

export function getDragStickerContext({ physicalStickerFace, cubieType, cubiePosition }) {
  return Object.freeze({
    physicalStickerFace,
    cubieType,
    cubiePosition: [...cubiePosition]
  });
}
