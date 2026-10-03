export const DEFAULT_CAMERA_VIEW = Object.freeze({
  yaw: 0.72,
  pitch: 0.56,
  distance: 8.2,
  target: Object.freeze([0, 0, 0]),
  minDistance: 5.0,
  maxDistance: 16.0
});

export function createCameraViewState(options = {}) {
  const base = { ...DEFAULT_CAMERA_VIEW, ...options };
  return {
    yaw: Number(base.yaw),
    pitch: Number(base.pitch),
    distance: clamp(Number(base.distance), Number(base.minDistance), Number(base.maxDistance)),
    target: [...base.target],
    minDistance: Number(base.minDistance),
    maxDistance: Number(base.maxDistance)
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function setDistance(state, distance) {
  state.distance = clamp(distance, state.minDistance, state.maxDistance);
  return state;
}

export function orbit(state, deltaYaw, deltaPitch, pitchLimit = Math.PI * 0.495) {
  state.yaw += deltaYaw;
  state.pitch = clamp(state.pitch + deltaPitch, -pitchLimit, pitchLimit);
  return state;
}

export function resetCameraView(state, source = DEFAULT_CAMERA_VIEW) {
  state.yaw = source.yaw;
  state.pitch = source.pitch;
  state.distance = clamp(source.distance, state.minDistance, state.maxDistance);
  state.target = [...source.target];
  return state;
}

export function getCameraPosition(state) {
  const cosPitch = Math.cos(state.pitch);
  return {
    x: state.target[0] + state.distance * Math.cos(state.yaw) * cosPitch,
    y: state.target[1] + state.distance * Math.sin(state.pitch),
    z: state.target[2] + state.distance * Math.sin(state.yaw) * cosPitch
  };
}

export function distanceToZoomPercent(state, distance = state.distance) {
  const range = state.maxDistance - state.minDistance;
  return ((state.maxDistance - distance) / range) * 100;
}

export function zoomPercentToDistance(state, percent) {
  const p = clamp(Number(percent), 0, 100) / 100;
  return state.maxDistance - p * (state.maxDistance - state.minDistance);
}
