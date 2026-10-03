import test from 'node:test';
import assert from 'node:assert/strict';
import { createCubeOrientationState, axisAngleQuaternion, rotateCubeByScreenDelta, rotateVectorByQuaternion } from '../src/interaction/cube-orientation-state.js';
import { FACE_NORMALS } from '../src/render/cube-render-model.js';

function approx(a,b,eps=1e-9){ assert.ok(Math.abs(a-b)<eps, `${a} != ${b}`); }

test('cube orientation state starts at identity', () => {
  const s = createCubeOrientationState();
  assert.deepEqual(s.quaternion, [0,0,0,1]);
});

test('cube orientation can turn Yellow toward a fixed camera without moving camera', () => {
  const q = axisAngleQuaternion([1,0,0], Math.PI / 2);
  const worldU = rotateVectorByQuaternion(FACE_NORMALS.U, q);
  approx(worldU[0], 0); approx(worldU[1], 0); approx(worldU[2], 1);
});

test('cube orientation can turn White toward a fixed camera', () => {
  const q = axisAngleQuaternion([1,0,0], -Math.PI / 2);
  const worldD = rotateVectorByQuaternion(FACE_NORMALS.D, q);
  approx(worldD[0], 0); approx(worldD[1], 0); approx(worldD[2], 1);
});

test('screen rotation accumulates beyond a full 360 degree yaw', () => {
  const s = createCubeOrientationState();
  rotateCubeByScreenDelta(s, { dx: -(Math.PI * 2) / 0.006, dy: 0, cameraRight:[1,0,0], cameraUp:[0,1,0], sensitivity:0.006 });
  assert.ok(Math.abs(Math.abs(s.quaternion[3]) - 1) < 1e-9);
});
