import test from 'node:test';
import assert from 'node:assert/strict';
import { CubeState, MoveHistory, MoveQueue, StickerHistory, createSolvedCube, COLOR_TO_FACE, parseMove } from '../src/core/cube.js';
import { createTurn } from '../src/core/turn.js';

test('canonical solved colors remain stable identities', () => {
  assert.deepEqual(COLOR_TO_FACE, { yellow:'U', white:'D', green:'R', blue:'L', red:'F', orange:'B' });
});

test('solved cube has 26 visible cubies, no core, and 54 stickers', () => {
  const cube = createSolvedCube();
  assert.equal(cube.cubies.size, 26); assert.equal(cube.getCubieAt([0,0,0]), null); assert.equal(cube.getStickerRecords().length, 54); assert.equal(cube.isSolved(), true);
});

test('cubie classification counts are 8 corners, 12 edges, 6 centers', () => {
  const cube = createSolvedCube(); let corners=0,edges=0,centers=0;
  for (const c of cube.cubies.values()) { const n=c.position.filter(v=>v!==0).length; if(n===3)corners++; else if(n===2)edges++; else if(n===1)centers++; }
  assert.deepEqual({corners,edges,centers},{corners:8,edges:12,centers:6});
});

test('generic outer quarter-turn performed four times is identity', () => {
  for (const axis of ['x','y','z']) for (const layer of [-1,1]) {
    const turn={axis,layer,quarterTurns:1};
    assert.equal(createSolvedCube().applySequence([turn,turn,turn,turn]).signature(), createSolvedCube().signature());
  }
});

test('generic turn followed by inverse is identity', () => {
  for (const turn of [
    {axis:'x',layer:1,quarterTurns:1},{axis:'x',layer:-1,quarterTurns:-1},
    {axis:'y',layer:1,quarterTurns:1},{axis:'z',layer:-1,quarterTurns:1},
    {axis:'x',layer:0,quarterTurns:1}
  ]) {
    const inverse={...turn,quarterTurns:turn.quarterTurns===2?2:-turn.quarterTurns};
    assert.equal(createSolvedCube().applySequence([turn,inverse]).isSolved(), true);
  }
});

test('each outer generic turn selects exactly nine cubies', () => {
  const cube=createSolvedCube();
  for(const axis of ['x','y','z']) for(const layer of [-1,1]) {
    const i={x:0,y:1,z:2}[axis]; assert.equal([...cube.cubies.values()].filter(c=>c.position[i]===layer).length,9);
  }
});

test('legacy notation adapter remains isolated from Phase 5 generic turns', () => {
  assert.deepEqual(parseMove('R'), { notation:'R', face:'R', axis:'x', layer:1, quarterTurns:-1 });
  assert.deepEqual(createTurn({axis:'x',layer:1,quarterTurns:1}), {axis:'x',layer:1,quarterTurns:1});
});

test('legacy MoveHistory is not the new sticker history', () => {
  const history=new MoveHistory(); history.push('R'); assert.equal(history.length,1); history.clear(); assert.equal(history.length,0);
  const stickerHistory=new StickerHistory(); assert.equal(stickerHistory.length,0);
});

test('MoveQueue stores generic turns', () => {
  const queue=new MoveQueue(); queue.enqueue({axis:'x',layer:1,quarterTurns:1},{axis:'y',layer:-1,quarterTurns:-1});
  assert.deepEqual(queue.dequeue(),{axis:'x',layer:1,quarterTurns:1}); assert.deepEqual(queue.dequeue(),{axis:'y',layer:-1,quarterTurns:-1}); assert.equal(queue.empty,true);
});

test('middle layer turn carries face centers between center positions', () => {
  const cube=createSolvedCube();
  const before = cube.getStickerPositions();
  for (const axis of ['x', 'y', 'z']) {
    const moved = cube.applyTurn({ axis, layer: 0, quarterTurns: 1 });
    assert.equal([...moved.cubies.values()].filter(c => c.position[{'x':0,'y':1,'z':2}[axis]] === 0).length, 8);
    const after = moved.getStickerPositions();
    const centerCodes = ['rc', 'oc', 'yc', 'wc', 'gc', 'bc'];
    assert.ok(centerCodes.some(code => after[code] !== before[code]));
    assert.equal(new Set(Object.values(after)).size, 54);
  }
});

test('CubeState clone preserves sticker identities', () => {
  const cube=createSolvedCube(); assert.equal(cube.clone().getStickerPositions().rc1,'p01');
});
