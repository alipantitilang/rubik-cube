import test from 'node:test';
import assert from 'node:assert/strict';
import { GESTURE_CONFIG } from '../src/interaction/manual-controller.js';

test('manual gesture keeps a minimum movement threshold', () => {
  assert.equal(GESTURE_CONFIG.minDistancePx, 10);
});

test('manual gesture quarter-turn scale maps the commit threshold to 50%', () => {
  assert.equal(GESTURE_CONFIG.commitProgress, 0.5);
  assert.equal(41 / GESTURE_CONFIG.pixelsPerQuarterTurn > GESTURE_CONFIG.commitProgress, false);
});

test('manual gesture quarter-turn progress has a stable pixel scale', () => {
  assert.equal(GESTURE_CONFIG.pixelsPerQuarterTurn, 82);
  assert.equal(Math.min(1, 41 / GESTURE_CONFIG.pixelsPerQuarterTurn), 0.5);
  assert.equal(Math.min(1, 1000 / GESTURE_CONFIG.pixelsPerQuarterTurn), 1);
});
