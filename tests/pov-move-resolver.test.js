import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePovMove, resolvePovFrame, POV_FRONT_FACES, virtualFace } from '../src/interaction/pov-move-resolver.js';

const POS = {
  U:[0,1,0], D:[0,-1,0], R:[1,0,0], L:[-1,0,0], F:[0,0,1], B:[0,0,-1]
};
const cameraFor = {
  F:[0,0,5], R:[5,0,0], B:[0,0,-5], L:[-5,0,0], U:[0,5,0], D:[0,-5,0]
};
const FRAME = front => resolvePovFrame({ cameraPosition: cameraFor[front] });
const add = (...vs) => vs[0].map((_,i) => vs.reduce((s,v)=>s+v[i],0));
const neg = v => v.map(x => -x);
const move = (frame, face, type, position, dx, dy) => resolvePovMove({
  frame, physicalStickerFace: face, cubieType:type, cubiePosition:position, dragX:dx, dragY:dy
});

function opposite(face) { return {U:'D',D:'U',R:'L',L:'R',F:'B',B:'F'}[face]; }

test('all six physical faces can become POV front', () => {
  assert.deepEqual(POV_FRONT_FACES, ['U','D','R','L','F','B']);
  for (const face of POV_FRONT_FACES) assert.equal(FRAME(face).front, face);
});

test('each frame is a complete right-handed orientation with opposite pairs', () => {
  for (const front of POV_FRONT_FACES) {
    const f = FRAME(front);
    assert.equal(f.back, opposite(f.front));
    assert.equal(f.left, opposite(f.right));
    assert.equal(f.down, opposite(f.up));
    assert.notEqual(f.right, f.left);
    assert.notEqual(f.up, f.down);
    assert.notEqual(f.front, f.back);
    const selected = ['front','back','right','left','up','down'].map(k=>f[k]);
    assert.equal(new Set(selected).size, 6);
  }
});

test('camera-relative frame keeps screen right/up orientation when Front changes', () => {
  const expected = {
    F:{front:'F',right:'R',up:'U'},
    R:{front:'R',right:'B',up:'U'},
    B:{front:'B',right:'L',up:'U'},
    L:{front:'L',right:'F',up:'U'},
    U:{front:'U',right:'R',up:'B'},
    D:{front:'D',right:'R',up:'F'}
  };
  for (const face of POV_FRONT_FACES) {
    const f=FRAME(face);
    assert.deepEqual({front:f.front,right:f.right,up:f.up}, expected[face]);
  }
});

test('front horizontal movement follows the visual grab direction for all six fronts', () => {
  for (const front of POV_FRONT_FACES) {
    const f=FRAME(front), r=POS[f.right], u=POS[f.up], n=POS[f.front];
    assert.equal(move(f,f.front,'corner',add(neg(r),u,n),100,0), f.up, `${front}: top-left drag-right`);
    assert.equal(move(f,f.front,'corner',add(r,u,n),-100,0), `${f.up}'`, `${front}: top-right drag-left`);
    assert.equal(move(f,f.front,'corner',add(neg(r),neg(u),n),100,0), `${f.down}'`, `${front}: bottom-left drag-right`);
    assert.equal(move(f,f.front,'corner',add(r,neg(u),n),-100,0), f.down, `${front}: bottom-right drag-left`);
  }
});

test('front vertical movement follows the visual grab direction for all six fronts', () => {
  for (const front of POV_FRONT_FACES) {
    const f=FRAME(front), r=POS[f.right], u=POS[f.up], n=POS[f.front];
    assert.equal(move(f,f.front,'corner',add(neg(r),u,n),0,100), f.left, `${front}: top-left drag-down`);
    assert.equal(move(f,f.front,'corner',add(r,u,n),0,100), `${f.right}'`, `${front}: top-right drag-down`);
    assert.equal(move(f,f.front,'corner',add(neg(r),neg(u),n),0,-100), `${f.left}'`, `${front}: bottom-left drag-up`);
    assert.equal(move(f,f.front,'corner',add(r,neg(u),n),0,-100), f.right, `${front}: bottom-right drag-up`);
  }
});

test('front edge movement maps the three virtual slice axes into physical notation', () => {
  for (const front of POV_FRONT_FACES) {
    const f=FRAME(front), r=POS[f.right], u=POS[f.up], n=POS[f.front];
    const top=add(u,n), bottom=add(neg(u),n), left=add(neg(r),n), right=add(r,n);
    const topMove=move(f,f.front,'edge',top,0,100);
    const bottomMove=move(f,f.front,'edge',bottom,0,-100);
    const leftMove=move(f,f.front,'edge',left,100,0);
    const rightMove=move(f,f.front,'edge',right,-100,0);
    assert.ok(topMove && bottomMove && leftMove && rightMove, `${front}: all front edges resolve`);
    assert.equal(bottomMove, topMove.endsWith("'") ? topMove.slice(0,-1) : `${topMove}'`);
    assert.equal(rightMove, leftMove.endsWith("'") ? leftMove.slice(0,-1) : `${leftMove}'`);
  }
});

test('side-face corner turns use active Front/Back faces for all six fronts', () => {
  for (const front of POV_FRONT_FACES) {
    const f=FRAME(front), r=POS[f.right], u=POS[f.up], n=POS[f.front], b=POS[f.back];
    const a=move(f,f.right,'corner',add(r,u,n),0,100);
    const bMove=move(f,f.right,'corner',add(r,u,b),0,100);
    assert.equal(a,f.front,`${front}: right side front corner`);
    assert.equal(bMove,`${f.back}'`,`${front}: right side back corner`);
    assert.equal(move(f,f.left,'corner',add(neg(r),u,n),0,100),`${f.front}'`,`${front}: left side front corner`);
  }
});

test('centers are direct anchors on every physical face, including yellow and white', () => {
  for (const front of POV_FRONT_FACES) {
    const f=FRAME(front), n=POS[f.front];
    assert.equal(move(f,f.front,'center',n,-100,0),f.front,`${front}: center left`);
    assert.equal(move(f,f.front,'center',n,100,0),`${f.front}'`,`${front}: center right`);
  }
});

test('virtualFace exposes all six positions', () => {
  for (const front of POV_FRONT_FACES) {
    const f=FRAME(front);
    for (const face of POV_FRONT_FACES) assert.ok(virtualFace(f,face));
  }
});

test('object-relative POV can make Yellow Front while camera remains fixed', () => {
  const q = [Math.sin(Math.PI / 4), 0, 0, Math.cos(Math.PI / 4)];
  const f = resolvePovFrame({ cameraPosition:[0,0,5], cubeQuaternion:q });
  assert.equal(f.front, 'U');
  assert.equal(f.back, 'D');
  assert.equal(f.right, 'R');
  assert.equal(f.up, 'B');
});

test('object-relative POV can make White Front while camera remains fixed', () => {
  const q = [-Math.sin(Math.PI / 4), 0, 0, Math.cos(Math.PI / 4)];
  const f = resolvePovFrame({ cameraPosition:[0,0,5], cubeQuaternion:q });
  assert.equal(f.front, 'D');
  assert.equal(f.back, 'U');
  assert.equal(f.right, 'R');
  assert.equal(f.up, 'F');
});
