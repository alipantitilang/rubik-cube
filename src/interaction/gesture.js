/** Shared pointer thresholds for the direct geometric manual interaction system. */
export const GESTURE_CONFIG = Object.freeze({
  minDistancePx: 10,
  pixelsPerQuarterTurn: 82,
  commitProgress: 0.5
});

export function classifyDragAxis(dx, dy, config = GESTURE_CONFIG) {
  const distance = Math.hypot(dx, dy);
  if (distance < config.minDistancePx) {
    return Object.freeze({ type: 'undetermined', distance, dx, dy, axis: null });
  }
  const axis = Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical';
  return Object.freeze({ type: axis, distance, dx, dy, axis });
}

export function dragProgress(dx, dy, axis, config = GESTURE_CONFIG) {
  if (!['horizontal', 'vertical'].includes(axis)) return 0;
  const distance = Math.abs(axis === 'horizontal' ? dx : dy);
  return Math.min(1, distance / config.pixelsPerQuarterTurn);
}
