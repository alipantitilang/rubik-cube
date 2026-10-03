/**
 * Pure gesture helpers for direct Rubik face manipulation.
 *
 * A gesture is classified from pointer displacement only. Rendering and
 * CubeState mutations stay outside this module.
 */

export const FACES = Object.freeze(['U', 'D', 'R', 'L', 'F', 'B']);

export const GESTURE_CONFIG = Object.freeze({
  minDistancePx: 12,
  dominanceRatio: 1.15,
  maxTapDistancePx: 8
});

export const FACE_BASES = Object.freeze({
  // Tangent basis as viewed from outside the corresponding face.
  U: Object.freeze({ right: [1, 0, 0], up: [0, 0, -1] }),
  D: Object.freeze({ right: [1, 0, 0], up: [0, 0, 1] }),
  R: Object.freeze({ right: [0, 0, -1], up: [0, 1, 0] }),
  L: Object.freeze({ right: [0, 0, 1], up: [0, 1, 0] }),
  F: Object.freeze({ right: [1, 0, 0], up: [0, 1, 0] }),
  B: Object.freeze({ right: [-1, 0, 0], up: [0, 1, 0] })
});

export function classifySwipe(dx, dy, config = GESTURE_CONFIG) {
  const distance = Math.hypot(dx, dy);

  if (distance <= config.maxTapDistancePx) {
    return Object.freeze({ type: 'tap', distance, dx, dy });
  }

  if (distance < config.minDistancePx) {
    return Object.freeze({ type: 'undetermined', distance, dx, dy });
  }

  const ax = Math.abs(dx);
  const ay = Math.abs(dy);

  if (ax >= ay * config.dominanceRatio) {
    return Object.freeze({
      type: 'horizontal',
      direction: dx >= 0 ? 'positive' : 'negative',
      distance, dx, dy
    });
  }

  if (ay >= ax * config.dominanceRatio) {
    return Object.freeze({
      type: 'vertical',
      direction: dy >= 0 ? 'negative' : 'positive',
      distance, dx, dy
    });
  }

  return Object.freeze({ type: 'ambiguous', distance, dx, dy });
}

export function normalizeFace(face) {
  const value = String(face ?? '').toUpperCase();
  if (!FACES.includes(value)) throw new Error(`Unknown face: ${face}`);
  return value;
}

export function gestureToMove(face, gesture, basis = FACE_BASES) {
  const normalizedFace = normalizeFace(face);
  if (!gesture || !['horizontal', 'vertical'].includes(gesture.type)) return null;

  const faceBasis = basis[normalizedFace];
  if (!faceBasis) throw new Error(`Missing basis for face ${normalizedFace}`);

  // Projected screen direction is normalized into the face tangent basis.
  // Convention:
  //   drag toward face-up     => base move
  //   drag toward face-right  => inverse move
  // Reversing either direction reverses the move.
  const isRight = gesture.type === 'horizontal';
  const positive = gesture.direction === 'positive';
  const base = isRight ? -1 : 1;
  const sign = positive ? base : -base;

  return `${normalizedFace}${sign > 0 ? '' : "'"}`;
}

export function vectorDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function vectorLength(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

export function normalizeVector(v) {
  const length = vectorLength(v);
  if (!length) return [0, 0, 0];
  return v.map(value => value / length);
}

export function subtractVector(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * Converts a screen-space pointer delta into the selected face plane.
 *
 * cameraRight/cameraUp are world-space unit vectors. The resulting vector is
 * projected onto the face plane so camera orientation does not change which
 * face was picked.
 */
export function projectPointerDeltaToFacePlane({
  dx,
  dy,
  cameraRight,
  cameraUp,
  faceNormal
}) {
  const screenDelta = [
    cameraRight[0] * dx + cameraUp[0] * -dy,
    cameraRight[1] * dx + cameraUp[1] * -dy,
    cameraRight[2] * dx + cameraUp[2] * -dy
  ];

  const normal = normalizeVector(faceNormal);
  const normalComponent = vectorDot(screenDelta, normal);
  return subtractVector(
    screenDelta,
    normal.map(value => value * normalComponent)
  );
}

export function classifyProjectedGesture({
  deltaOnFace,
  face,
  basis = FACE_BASES,
  config = GESTURE_CONFIG
}) {
  const normalizedFace = normalizeFace(face);
  const faceBasis = basis[normalizedFace];
  const x = vectorDot(deltaOnFace, faceBasis.right);
  const y = vectorDot(deltaOnFace, faceBasis.up);
  return classifySwipe(x, -y, config);
}
