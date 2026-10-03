import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePovMove, resolvePovFrame, POV_FRONT_FACES } from '../src/interaction/pov-move-resolver.js';

const FRAME = (front) => resolvePovFrame({
  cameraPosition: ({ F:[0,0,5], R:[5,0,0], B:[0,0,-5], L:[-5,0,0] })[front]
});

function move(frame, face, type, position, dx, dy) {
  return resolvePovMove({
    frame,
    physicalStickerFace: face,
    cubieType: type,
    cubiePosition: position,
    dragX: dx,
    dragY: dy
  });
}

test('only red/green/orange/blue physical faces may become POV front', () => {
  assert.deepEqual(POV_FRONT_FACES, ['F', 'R', 'B', 'L']);
  assert.equal(FRAME('F').front, 'F');
  assert.equal(FRAME('R').front, 'R');
  assert.equal(FRAME('B').front, 'B');
  assert.equal(FRAME('L').front, 'L');
  assert.equal(resolvePovFrame({ cameraPosition:[0, 8, 0] }).front, 'F');
});

test('each allowed front face has the specified fixed color adjacency', () => {
  assert.deepEqual(FRAME('F'), { front:'F', back:'B', right:'R', left:'L', up:'U', down:'D', axes: FRAME('F').axes });
  assert.equal(FRAME('R').right, 'B'); assert.equal(FRAME('R').left, 'F');
  assert.equal(FRAME('B').right, 'L'); assert.equal(FRAME('B').left, 'R');
  assert.equal(FRAME('L').right, 'F'); assert.equal(FRAME('L').left, 'B');
  for (const front of ['F','R','B','L']) {
    const frame = FRAME(front);
    assert.equal(frame.up, 'U');
    assert.equal(frame.down, 'D');
  }
});

test('front-face corner mapping matches the specified POV method', () => {
  const f = FRAME('F');
  assert.equal(move(f, 'F', 'corner', [-1, 1, 1], 100, 0), 'U');
  assert.equal(move(f, 'F', 'corner', [1, 1, 1], -100, 0), "U'");
  assert.equal(move(f, 'F', 'corner', [-1, -1, 1], 100, 0), "D'");
  assert.equal(move(f, 'F', 'corner', [1, -1, 1], -100, 0), 'D');
  assert.equal(move(f, 'F', 'corner', [-1, 1, 1], 0, 100), 'L');
  assert.equal(move(f, 'F', 'corner', [1, 1, 1], 0, 100), "R'");
  assert.equal(move(f, 'F', 'corner', [-1, -1, 1], 0, -100), "L'");
  assert.equal(move(f, 'F', 'corner', [1, -1, 1], 0, -100), 'R');
});

test('front-face edge mapping matches M and E slice rules', () => {
  const f = FRAME('F');
  assert.equal(move(f, 'F', 'edge', [0, 1, 1], 0, 100), 'M');
  assert.equal(move(f, 'F', 'edge', [-1, 0, 1], 100, 0), "E'");
  assert.equal(move(f, 'F', 'edge', [0, -1, 1], 0, -100), "M'");
  assert.equal(move(f, 'F', 'edge', [1, 0, 1], -100, 0), 'E');
});

test('right-side situational mapping matches the specified F/B/S rules', () => {
  const f = FRAME('F');
  assert.equal(move(f, 'R', 'corner', [1, 1, 1], 0, 100), 'F');
  assert.equal(move(f, 'R', 'corner', [1, 1, -1], 0, 100), "B'");
  assert.equal(move(f, 'R', 'corner', [1, -1, 1], 0, -100), "F'");
  assert.equal(move(f, 'R', 'corner', [1, -1, -1], 0, -100), 'B');
  assert.equal(move(f, 'R', 'edge', [1, 1, 0], 0, 100), 'S');
  assert.equal(move(f, 'R', 'edge', [1, -1, 0], 0, -100), "S'");
});

test('left-side situational mapping matches the specified F/B/S rules', () => {
  const f = FRAME('F');
  assert.equal(move(f, 'L', 'corner', [-1, 1, 1], 0, 100), "F'");
  assert.equal(move(f, 'L', 'corner', [-1, 1, -1], 0, 100), 'B');
  assert.equal(move(f, 'L', 'corner', [-1, -1, 1], 0, -100), 'F');
  assert.equal(move(f, 'L', 'corner', [-1, -1, -1], 0, -100), "B'");
  assert.equal(move(f, 'L', 'edge', [-1, 1, 0], 0, -100), "S'");
  assert.equal(move(f, 'L', 'edge', [-1, -1, 0], 0, 100), 'S');
});

test('front horizontal mapping is corrected only for red/F while other POV fronts retain their prior mapping', () => {
  assert.equal(move(FRAME('F'), 'F', 'corner', [-1,1,1], 100, 0), 'U');
  assert.equal(move(FRAME('F'), 'F', 'corner', [1,1,1], -100, 0), "U'");
  assert.equal(move(FRAME('R'), 'R', 'corner', [1,1,1], 100, 0), "U'");
  assert.equal(move(FRAME('B'), 'B', 'corner', [1,1,-1], 100, 0), "U'");
  assert.equal(move(FRAME('L'), 'L', 'corner', [-1,1,-1], 100, 0), "U'");
});

test('center stickers use the currently dominant front face as their face move', () => {
  for (const front of ['F','R','B','L']) {
    const frame = FRAME(front);
    const normal = { F:[0,0,1], R:[1,0,0], B:[0,0,-1], L:[-1,0,0] }[front];
    assert.equal(move(frame, front, 'center', normal, -100, 0), front);
    assert.equal(move(frame, front, 'center', normal, 100, 0), `${front}'`);
  }
});

test('inverse direction is recognized for every listed side mapping', () => {
  const f = FRAME('F');
  assert.equal(move(f, 'R', 'edge', [1,1,0], 0, -100), "S'");
  assert.equal(move(f, 'R', 'edge', [1,-1,0], 0, 100), 'S');
  assert.equal(move(f, 'L', 'edge', [-1,1,0], 0, 100), 'S');
  assert.equal(move(f, 'L', 'edge', [-1,-1,0], 0, -100), "S'");
});

test('yellow and white centers remain draggable without becoming POV front', () => {
  const f = FRAME('F');
  assert.equal(move(f, 'U', 'center', [0,1,0], -100, 0), 'U');
  assert.equal(move(f, 'U', 'center', [0,1,0], 100, 0), "U'");
  assert.equal(move(f, 'D', 'center', [0,-1,0], -100, 0), 'D');
  assert.equal(move(f, 'D', 'center', [0,-1,0], 100, 0), "D'");
});

test('right/left situational tables rotate correctly for all four allowed front faces', () => {
  const normals = { U:[0,1,0], D:[0,-1,0], F:[0,0,1], B:[0,0,-1], R:[1,0,0], L:[-1,0,0] };
  const add = (...vs) => vs[0].map((_, i) => vs.reduce((sum, v) => sum + v[i], 0));
  for (const front of ['F','R','B','L']) {
    const frame = FRAME(front);
    const f = normals[frame.front], b = normals[frame.back], r = normals[frame.right], l = normals[frame.left], u = normals.U, d = normals.D;

    assert.equal(move(frame, frame.right, 'corner', add(r,u,f), 0, 100), 'F');
    assert.equal(move(frame, frame.right, 'corner', add(r,u,b), 0, 100), "B'");
    assert.equal(move(frame, frame.right, 'corner', add(r,d,f), 0, -100), "F'");
    assert.equal(move(frame, frame.right, 'corner', add(r,d,b), 0, -100), 'B');
    assert.equal(move(frame, frame.right, 'edge', add(r,u), 0, 100), 'S');
    assert.equal(move(frame, frame.right, 'edge', add(r,d), 0, -100), "S'");

    assert.equal(move(frame, frame.left, 'corner', add(l,u,f), 0, 100), "F'");
    assert.equal(move(frame, frame.left, 'corner', add(l,u,b), 0, 100), 'B');
    assert.equal(move(frame, frame.left, 'corner', add(l,d,f), 0, -100), 'F');
    assert.equal(move(frame, frame.left, 'corner', add(l,d,b), 0, -100), "B'");
    assert.equal(move(frame, frame.left, 'edge', add(l,u), 0, -100), "S'");
    assert.equal(move(frame, frame.left, 'edge', add(l,d), 0, 100), 'S');
  }
});
