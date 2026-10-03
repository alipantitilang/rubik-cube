import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCameraViewState,
  distanceToZoomPercent,
  getCameraPosition,
  orbit,
  resetCameraView,
  setDistance,
  zoomPercentToDistance
} from '../src/camera-view-state.js';

test('camera state clamps distance to configured range', () => {
  const s = createCameraViewState({ minDistance: 5, maxDistance: 10, distance: 50 });
  assert.equal(s.distance, 10);
  setDistance(s, 1);
  assert.equal(s.distance, 5);
});

test('zoom percent maps 0 to max distance and 100 to min distance', () => {
  const s = createCameraViewState({ minDistance: 5, maxDistance: 10 });
  assert.equal(zoomPercentToDistance(s, 0), 10);
  assert.equal(zoomPercentToDistance(s, 100), 5);
  assert.equal(distanceToZoomPercent(s, 7.5), 50);
});

test('orbit clamps pitch and changes yaw', () => {
  const s = createCameraViewState();
  const yaw = s.yaw;
  orbit(s, 1, 100);
  assert.equal(s.yaw, yaw + 1);
  assert.ok(s.pitch <= Math.PI * 0.495);
});

test('camera position follows spherical orbit state', () => {
  const s = createCameraViewState({ yaw: 0, pitch: 0, distance: 8 });
  const p = getCameraPosition(s);
  assert.deepEqual(p, { x: 8, y: 0, z: 0 });
});

test('reset restores default view values', () => {
  const s = createCameraViewState({ yaw: 2, pitch: -1, distance: 5 });
  orbit(s, 1, 0.5);
  setDistance(s, 12);
  resetCameraView(s);
  assert.equal(s.yaw, 0.72);
  assert.equal(s.pitch, 0.56);
  assert.equal(s.distance, 8.2);
});
