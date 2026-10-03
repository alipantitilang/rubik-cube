import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDragTurn } from '../src/interaction/drag-move-resolver.js';

const ID = [0,0,0,1];
const RIGHT = [1,0,0];
const UP = [0,1,0];
const turn = (face, position, dx, dy, extra = {}) => resolveDragTurn({ physicalStickerFace: face, cubiePosition: position, dragX: dx, dragY: dy, cameraRight: RIGHT, cameraUp: UP, cubeQuaternion: ID, ...extra });

test('front horizontal drags select the perpendicular y layer and follow drag direction', () => {
  assert.deepEqual(turn('F', [-1,1,1], 100, 0), { axis: 'y', layer: 1, quarterTurns: 1 });
  assert.deepEqual(turn('F', [0,0,1], 100, 0), { axis: 'y', layer: 0, quarterTurns: 1 });
  assert.deepEqual(turn('F', [1,-1,1], 100, 0), { axis: 'y', layer: -1, quarterTurns: 1 });
  assert.deepEqual(turn('F', [-1,1,1], -100, 0), { axis: 'y', layer: 1, quarterTurns: -1 });
});

test('front vertical drags select the perpendicular x layer', () => {
  assert.deepEqual(turn('F', [-1,1,1], 0, 100), { axis: 'x', layer: -1, quarterTurns: 1 });
  assert.deepEqual(turn('F', [0,1,1], 0, 100), { axis: 'x', layer: 0, quarterTurns: 1 });
  assert.deepEqual(turn('F', [1,1,1], 0, 100), { axis: 'x', layer: 1, quarterTurns: 1 });
});

test('side sticker drags use the same geometric rule', () => {
  assert.deepEqual(turn('R', [1,1,1], 0, 100), { axis: 'z', layer: 1, quarterTurns: -1 });
  assert.deepEqual(turn('R', [1,1,0], 0, 100), { axis: 'z', layer: 0, quarterTurns: -1 });
  assert.deepEqual(turn('R', [1,-1,-1], 0, -100), { axis: 'z', layer: -1, quarterTurns: 1 });
});

test('there is no Front mapping in the result', () => {
  const result = turn('U', [1,1,1], 100, 0);
  assert.deepEqual(Object.keys(result).sort(), ['axis', 'layer', 'quarterTurns']);
});

test('cube orientation is part of geometry', () => {
  const q = [0, Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4)];
  assert.deepEqual(turn('F', [-1,1,1], 0, 100, { cubeQuaternion: q }), { axis: 'x', layer: -1, quarterTurns: 1 });
});

test('camera screen basis can change without introducing face remapping', () => {
  assert.deepEqual(turn('F', [-1,1,1], 0, 100, { cameraRight: [0,0,-1], cameraUp: [0,1,0] }), { axis: 'x', layer: -1, quarterTurns: 1 });
});

test('diagonal drag still chooses the nearest perpendicular layer axis', () => {
  assert.deepEqual(turn('F', [1,1,1], 80, 30), { axis: 'y', layer: 1, quarterTurns: 1 });
  assert.deepEqual(turn('F', [1,1,1], 30, 80), { axis: 'x', layer: 1, quarterTurns: 1 });
});
