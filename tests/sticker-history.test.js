import test from 'node:test';
import assert from 'node:assert/strict';
import { createSolvedCube, StickerHistory } from '../src/core/cube.js';
import { SOLVED_STICKERS, stickerPositionId } from '../src/core/sticker-map.js';

test('solved cube exposes exactly 54 stable sticker codes and positions', () => {
  const cube = createSolvedCube();
  const records = cube.getStickerRecords();
  assert.equal(records.length, 54);
  assert.equal(new Set(records.map(r => r.code)).size, 54);
  assert.equal(new Set(records.map(r => r.position)).size, 54);
  assert.equal(records.find(r => r.code === 'rc1').position, 'p01');
  assert.equal(records.find(r => r.code === 'rc').position, 'p05');
  assert.equal(records.find(r => r.code === 're1').position, 'p02');
  assert.equal(records.find(r => r.code === 'oc1').position, 'p10');
  assert.equal(records.find(r => r.code === 'gc').position, 'p41');
  assert.equal(records.find(r => r.code === 'bc').position, 'p50');
});

test('sticker identity moves between position slots without changing its code', () => {
  const cube = createSolvedCube();
  const turn = { axis: 'y', layer: 1, quarterTurns: 1 };
  const moved = cube.applyTurn(turn);
  assert.equal(moved.getStickerPositions().rc1, 'p37');
  assert.equal(moved.getStickerPositions().rc2, 'p39');
  assert.equal(moved.getStickerPositions().oc1, 'p46');
  assert.equal(moved.getStickerPositions().gc1, 'p10');
});

test('StickerHistory records code -> old position -> new position per committed turn', () => {
  const cube = createSolvedCube();
  const moved = cube.applyTurn({ axis: 'y', layer: 1, quarterTurns: 1 });
  const history = new StickerHistory();
  const event = history.record(cube, moved, { axis: 'y', layer: 1, quarterTurns: 1 });
  assert.equal(event.index, 1);
  assert.ok(event.changes.some(c => c.code === 'rc1' && c.from === 'p01' && c.to === 'p37'));
  assert.deepEqual(history.getStickerHistory('rc1')[0], {
    event: 1,
    turn: { axis: 'y', layer: 1, quarterTurns: 1 },
    from: 'p01',
    to: 'p37'
  });
  assert.equal(history.getStickerHistory('rc').length, 0);

  const sliceMoved = cube.applyTurn({ axis: 'x', layer: 0, quarterTurns: 1 });
  const sliceEvent = history.record(cube, sliceMoved, { axis: 'x', layer: 0, quarterTurns: 1 });
  assert.ok(sliceEvent.changes.some(c => ['yc', 'wc', 'gc', 'bc'].includes(c.code)));
  assert.ok(history.getStickerHistory('yc').some(c => c.from !== c.to));
});

test('all solved sticker slots remain a complete 01..54 registry', () => {
  const positions = SOLVED_STICKERS.map(s => s.position);
  assert.deepEqual(positions, Array.from({ length: 54 }, (_, i) => `p${String(i + 1).padStart(2, '0')}`));
});
