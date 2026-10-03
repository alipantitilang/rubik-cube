/** Pure quaternion state for the Rubik object orientation. */
export const IDENTITY_QUATERNION = Object.freeze([0, 0, 0, 1]);

export function createCubeOrientationState(options = {}) {
  const q = Array.isArray(options.quaternion) && options.quaternion.length === 4
    ? options.quaternion.map(Number)
    : [...IDENTITY_QUATERNION];
  normalizeQuaternion(q);
  return { quaternion: q };
}

export function normalizeQuaternion(q) {
  const n = Math.hypot(...q);
  if (n < 1e-12) {
    q[0] = 0; q[1] = 0; q[2] = 0; q[3] = 1;
    return q;
  }
  for (let i = 0; i < 4; i++) q[i] /= n;
  return q;
}

export function multiplyQuaternions(a, b) {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz
  ];
}

export function axisAngleQuaternion(axis, angle) {
  const half = angle / 2;
  const s = Math.sin(half);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(half)];
}

export function rotateVectorByQuaternion(v, q) {
  const [x, y, z] = v;
  const [qx, qy, qz, qw] = q;
  const tx = 2 * (qy * z - qz * y);
  const ty = 2 * (qz * x - qx * z);
  const tz = 2 * (qx * y - qy * x);
  return [
    x + qw * tx + (qy * tz - qz * ty),
    y + qw * ty + (qz * tx - qx * tz),
    z + qw * tz + (qx * ty - qy * tx)
  ];
}

export function rotateCubeByScreenDelta(state, { dx = 0, dy = 0, cameraRight = [1, 0, 0], cameraUp = [0, 1, 0], sensitivity = 0.006 } = {}) {
  const yaw = -Number(dx) * sensitivity;
  const pitch = -Number(dy) * sensitivity;
  const yawQ = axisAngleQuaternion(cameraUp, yaw);
  const pitchQ = axisAngleQuaternion(cameraRight, pitch);
  state.quaternion = multiplyQuaternions(pitchQ, multiplyQuaternions(yawQ, state.quaternion));
  normalizeQuaternion(state.quaternion);
  return state;
}
