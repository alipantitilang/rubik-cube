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

test('front horizontal mapping follows visual grab direction for all four eligible POV fronts', () => {
  for (const front of ['F','R','B','L']) {
    const frame = FRAME(front);
    const right = { F:[1,0,0], R:[0,0,-1], B:[-1,0,0], L:[0,0,1] }[front];
    const left = right.map(v => -v);
    const frontNormal = { F:[0,0,1], R:[1,0,0], B:[0,0,-1], L:[-1,0,0] }[front];
    const add = (...vs) => vs[0].map((_, i) => vs.reduce((sum, v) => sum + v[i], 0));

    assert.equal(move(frame, frame.front, 'corner', add(left,[0,1,0],frontNormal), 100, 0), 'U', `${front}: top-left drag-right`);
    assert.equal(move(frame, frame.front, 'corner', add(right,[0,1,0],frontNormal), -100, 0), "U'", `${front}: top-right drag-left`);
    assert.equal(move(frame, frame.front, 'corner', add(left,[0,-1,0],frontNormal), 100, 0), "D'", `${front}: bottom-left drag-right`);
    assert.equal(move(frame, frame.front, 'corner', add(right,[0,-1,0],frontNormal), -100, 0), 'D', `${front}: bottom-right drag-left`);

    assert.equal(move(frame, frame.front, 'edge', add(left,frontNormal), 100, 0), "E'", `${front}: left edge drag-right`);
    assert.equal(move(frame, frame.front, 'edge', add(right,frontNormal), -100, 0), 'E', `${front}: right edge drag-left`);
  }
});

test('front vertical mapping follows visual grab direction for all four eligible POV fronts', () => {
  const frontNormals = { F:[0,0,1], R:[1,0,0], B:[0,0,-1], L:[-1,0,0] };
  const rightNormals = { F:[1,0,0], R:[0,0,-1], B:[-1,0,0], L:[0,0,1] };
  const add = (...vs) => vs[0].map((_, i) => vs.reduce((sum, v) => sum + v[i], 0));

  const expected = {
    F: { topLeftDown:'L', topRightDown:"R'", bottomLeftUp:"L'", bottomRightUp:'R', topDown:'M', bottomUp:"M'" },
    R: { topLeftDown:'F', topRightDown:"B'", bottomLeftUp:"F'", bottomRightUp:'B', topDown:"S'", bottomUp:'S' },
    B: { topLeftDown:'R', topRightDown:"L'", bottomLeftUp:"R'", bottomRightUp:'L', topDown:"M'", bottomUp:'M' },
    L: { topLeftDown:'B', topRightDown:"F'", bottomLeftUp:"B'", bottomRightUp:'F', topDown:'S', bottomUp:"S'" }
  };

  for (const front of ['F','R','B','L']) {
    const frame = FRAME(front);
    const fn = frontNormals[front];
    const rn = rightNormals[front];
    const topLeft = add(rn.map(v => -v), [0,1,0], fn);
    const topRight = add(rn, [0,1,0], fn);
    const bottomLeft = add(rn.map(v => -v), [0,-1,0], fn);
    const bottomRight = add(rn, [0,-1,0], fn);

    assert.equal(move(frame, front, 'corner', topLeft, 0, 100), expected[front].topLeftDown, `${front}: top-left drag-down`);
    assert.equal(move(frame, front, 'corner', topRight, 0, 100), expected[front].topRightDown, `${front}: top-right drag-down`);
    assert.equal(move(frame, front, 'corner', bottomLeft, 0, -100), expected[front].bottomLeftUp, `${front}: bottom-left drag-up`);
    assert.equal(move(frame, front, 'corner', bottomRight, 0, -100), expected[front].bottomRightUp, `${front}: bottom-right drag-up`);

    assert.equal(move(frame, front, 'edge', add([0,1,0], fn), 0, 100), expected[front].topDown, `${front}: top edge drag-down`);
    assert.equal(move(frame, front, 'edge', add([0,-1,0], fn), 0, -100), expected[front].bottomUp, `${front}: bottom edge drag-up`);
  }
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

    assert.equal(move(frame, frame.right, 'corner', add(r,u,f), 0, 100), frame.front);
    assert.equal(move(frame, frame.right, 'corner', add(r,u,b), 0, 100), `${frame.back}'`);
    assert.equal(move(frame, frame.right, 'corner', add(r,d,f), 0, -100), `${frame.front}'`);
    assert.equal(move(frame, frame.right, 'corner', add(r,d,b), 0, -100), frame.back);
    assert.equal(move(frame, frame.right, 'edge', add(r,u), 0, 100), 'S');
    assert.equal(move(frame, frame.right, 'edge', add(r,d), 0, -100), "S'");

    assert.equal(move(frame, frame.left, 'corner', add(l,u,f), 0, 100), `${frame.front}'`);
    assert.equal(move(frame, frame.left, 'corner', add(l,u,b), 0, 100), frame.back);
    assert.equal(move(frame, frame.left, 'corner', add(l,d,f), 0, -100), frame.front);
    assert.equal(move(frame, frame.left, 'corner', add(l,d,b), 0, -100), `${frame.back}'`);
    assert.equal(move(frame, frame.left, 'edge', add(l,u), 0, -100), "S'");
    assert.equal(move(frame, frame.left, 'edge', add(l,d), 0, 100), 'S');
  }
});


test('side-face corner vertical turns use the active POV front/back face, not literal F/B', () => {
  for (const front of ['F','R','B','L']) {
    const frame = FRAME(front);
    const normal = { F:[0,0,1], R:[1,0,0], B:[0,0,-1], L:[-1,0,0] }[front];
    const right = { F:[1,0,0], R:[0,0,-1], B:[-1,0,0], L:[0,0,1] }[front];
    const up = [0,1,0];
    const add = (a,b,c) => [a[0]+b[0]+c[0],a[1]+b[1]+c[1],a[2]+b[2]+c[2]];
    const back = frame.back;
    const inverse = (m) => m.endsWith("'") ? m.slice(0,-1) : `${m}'`;

    assert.equal(move(frame, frame.right, 'corner', add(right, up, normal), 0, 100), front);
    assert.equal(move(frame, frame.right, 'corner', add(right, up, [-normal[0],-normal[1],-normal[2]]), 0, 100), `${back}'`);
    assert.equal(move(frame, frame.right, 'corner', add(right, [-up[0],-up[1],-up[2]], normal), 0, -100), `${front}'`);
    assert.equal(move(frame, frame.right, 'corner', add(right, [-up[0],-up[1],-up[2]], [-normal[0],-normal[1],-normal[2]]), 0, -100), back);

    assert.equal(move(frame, frame.left, 'corner', add([-right[0],-right[1],-right[2]], up, normal), 0, 100), `${front}'`);
    assert.equal(move(frame, frame.left, 'corner', add([-right[0],-right[1],-right[2]], up, [-normal[0],-normal[1],-normal[2]]), 0, 100), back);
    assert.equal(move(frame, frame.left, 'corner', add([-right[0],-right[1],-right[2]], [-up[0],-up[1],-up[2]], normal), 0, -100), front);
    assert.equal(move(frame, frame.left, 'corner', add([-right[0],-right[1],-right[2]], [-up[0],-up[1],-up[2]], [-normal[0],-normal[1],-normal[2]]), 0, -100), `${back}'`);
    assert.equal(inverse(front), `${front}'`);
  }
});
