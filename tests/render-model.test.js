import test from 'node:test';
import assert from 'node:assert/strict';
import { createSolvedCube } from '../src/core/cube.js';
import { buildRenderModel, cubieType, CUBE_COLORS, FACE_NORMALS } from '../src/render/cube-render-model.js';

test('renderer model exposes exactly 26 visible cubies', () => {
  const model = buildRenderModel(createSolvedCube());
  assert.equal(model.visibleCubieCount, 26);
  assert.equal(model.hasCoreCubie, false);
  assert.equal(model.cubies.length, 26);
});

test('renderer model preserves 8/12/6 cubie classification', () => {
  const model = buildRenderModel(createSolvedCube());
  const counts = { corner: 0, edge: 0, center: 0 };
  for (const cubie of model.cubies) counts[cubie.type]++;
  assert.deepEqual(counts, { corner: 8, edge: 12, center: 6 });
});

test('all renderer IDs are stable and unique', () => {
  const model = buildRenderModel(createSolvedCube());
  const ids = model.cubies.map(c => c.id);
  assert.equal(new Set(ids).size, 26);
  assert.ok(ids.every(id => /^cubie_-?\d_-?\d_-?\d$/.test(id)));
});

test('solved stickers map to configured face colors', () => {
  const model = buildRenderModel(createSolvedCube());
  for (const cubie of model.cubies) {
    for (const sticker of cubie.stickers) {
      const expected = { U: 'white', D: 'yellow', R: 'red', L: 'orange', F: 'green', B: 'blue' }[sticker.face];
      assert.equal(sticker.color, expected);
      assert.ok(CUBE_COLORS[sticker.face]);
      assert.deepEqual(sticker.normal, FACE_NORMALS[sticker.face]);
    }
  }
});

test('position mapping uses one consistent render spacing', () => {
  const model = buildRenderModel(createSolvedCube(), 1.04);
  const corner = model.cubies.find(c => c.logicalPosition.join(',') === '1,1,1');
  assert.deepEqual(corner.renderPosition, [1.04, 1.04, 1.04]);
});

test('cubieType classifies the 26 positions without a core', () => {
  const cube = createSolvedCube();
  assert.equal(cubieType(cube.getCubieAt([1,1,1])), 'corner');
  assert.equal(cubieType(cube.getCubieAt([1,1,0])), 'edge');
  assert.equal(cubieType(cube.getCubieAt([1,0,0])), 'center');
  assert.equal(cube.getCubieAt([0,0,0]), null);
});
