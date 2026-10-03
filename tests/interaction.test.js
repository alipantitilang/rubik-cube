import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyDragAxis, dragProgress } from '../src/interaction/gesture.js';

test('small movement remains below the face-turn threshold', () => {
  assert.equal(classifyDragAxis(3, 4).type, 'undetermined');
});

test('dominant screen axis is captured without rejecting diagonal movement', () => {
  assert.equal(classifyDragAxis(80, 30).axis, 'horizontal');
  assert.equal(classifyDragAxis(30, 80).axis, 'vertical');
});

test('live drag progress is bounded from zero to one', () => {
  assert.equal(dragProgress(0, 0, 'horizontal'), 0);
  assert.equal(dragProgress(41, 0, 'horizontal'), 0.5);
  assert.equal(dragProgress(1000, 0, 'horizontal'), 1);
});
