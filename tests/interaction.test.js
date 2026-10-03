import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifySwipe,
  classifyProjectedGesture,
  gestureToMove,
  projectPointerDeltaToFacePlane,
  FACE_BASES
} from '../src/interaction/gesture.js';

test('tap and sub-threshold movement do not become a face turn', () => {
  assert.equal(classifySwipe(3, 2).type, 'tap');
  assert.equal(classifySwipe(9, 0).type, 'undetermined');
});

test('dominant horizontal and vertical swipes are classified', () => {
  assert.equal(classifySwipe(30, 4).type, 'horizontal');
  assert.equal(classifySwipe(-30, 4).direction, 'negative');
  assert.equal(classifySwipe(4, -30).type, 'vertical');
  assert.equal(classifySwipe(4, -30).direction, 'positive');
});

test('ambiguous diagonal swipes are rejected', () => {
  assert.equal(classifySwipe(20, 19).type, 'ambiguous');
});

test('gesture mapping produces legal single face moves', () => {
  assert.equal(gestureToMove('F', { type: 'vertical', direction: 'positive' }), 'F');
  assert.equal(gestureToMove('F', { type: 'vertical', direction: 'negative' }), "F'");
  assert.equal(gestureToMove('R', { type: 'horizontal', direction: 'positive' }), "R'");
  assert.equal(gestureToMove('U', { type: 'horizontal', direction: 'negative' }), 'U');
});

test('camera-space pointer delta is projected onto the selected face plane', () => {
  const delta = projectPointerDeltaToFacePlane({
    dx: 10,
    dy: 0,
    cameraRight: [1, 0, 0],
    cameraUp: [0, 1, 0],
    faceNormal: [0, 0, 1]
  });
  assert.deepEqual(delta, [10, 0, 0]);
});

test('projected gesture uses face tangent basis', () => {
  const gesture = classifyProjectedGesture({
    deltaOnFace: [0, 15, 0],
    face: 'F',
    basis: FACE_BASES
  });
  assert.equal(gesture.type, 'vertical');
  assert.equal(gesture.direction, 'positive');
});
