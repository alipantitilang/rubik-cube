import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CubeState, MoveHistory, MoveQueue, createSolvedCube, COLOR_TO_FACE,
  invertMove, invertSequence, parseMove
} from '../src/core/cube.js';

test('canonical solved colors use the fixed face identities', () => {
  assert.deepEqual(COLOR_TO_FACE, { yellow:'U', white:'D', green:'R', blue:'L', red:'F', orange:'B' });
});

test('solved cube has exactly 26 visible cubies and no core cubie', () => {
  const cube = createSolvedCube();
  assert.equal(cube.cubies.size, 26);
  assert.equal(cube.getCubieAt([0, 0, 0]), null);
  assert.equal(cube.isSolved(), true);
});

test('cubie classification counts are 8 corners, 12 edges, 6 centers', () => {
  const cube = createSolvedCube();
  let corners = 0, edges = 0, centers = 0;
  for (const c of cube.cubies.values()) {
    const n = c.position.filter(v => v !== 0).length;
    if (n === 3) corners++;
    else if (n === 2) edges++;
    else if (n === 1) centers++;
  }
  assert.deepEqual({ corners, edges, centers }, { corners: 8, edges: 12, centers: 6 });
});

test('each face quarter-turn performed four times is identity', () => {
  for (const face of ['U', 'D', 'R', 'L', 'F', 'B']) {
    const cube = createSolvedCube();
    const result = cube.applySequence([face, face, face, face]);
    assert.equal(result.signature(), cube.signature(), `${face}^4 must be identity`);
  }
});

test('move followed by inverse is identity', () => {
  for (const move of ['U', 'D', 'R', 'L', 'F', 'B', "U'", "D'", "R'", "L'", "F'", "B'", 'R2']) {
    const cube = createSolvedCube();
    const result = cube.applySequence([move, invertMove(move)]);
    assert.equal(result.signature(), cube.signature(), `${move} + inverse must be identity`);
  }
});

test('half-turn squared is identity', () => {
  for (const face of ['U', 'D', 'R', 'L', 'F', 'B']) {
    const cube = createSolvedCube();
    assert.equal(cube.applySequence([`${face}2`, `${face}2`]).signature(), cube.signature());
  }
});

test('sequence followed by exact inverse restores solved state', () => {
  const sequence = ['R', 'U', "R'", "U'", 'F2', 'L', 'D2', "B'"];
  const cube = createSolvedCube();
  const result = cube.applySequence([...sequence, ...invertSequence(sequence)]);
  assert.equal(result.isSolved(), true);
});

test('each face move selects exactly nine cubies', () => {
  const axisIndex = { x: 0, y: 1, z: 2 };
  for (const face of ['U', 'D', 'R', 'L', 'F', 'B']) {
    const cube = createSolvedCube();
    const move = parseMove(face);
    const affected = [...cube.cubies.values()].filter(c => c.position[axisIndex[move.axis]] === move.layer);
    assert.equal(affected.length, 9, `${face} must select 9 cubies`);
  }
});

test('parseMove accepts legal notation and rejects invalid notation', () => {
  for (const move of ['U', "D'", 'R2', 'L', "F'", 'B2']) assert.equal(parseMove(move).notation, move);
  for (const move of ['X', 'Q', 'R3', 'UU', 'RU', '', 'R22']) assert.throws(() => parseMove(move));
});

test('history stores committed moves independently', () => {
  const history = new MoveHistory();
  history.push('R'); history.push("U'"); history.push('F2');
  assert.equal(history.length, 3);
  assert.equal(history.toNotation(), "R U' F2");
  assert.equal(history.undo().notation, 'F2');
  assert.equal(history.length, 2);
  history.clear();
  assert.equal(history.length, 0);
});

test('move queue processes moves FIFO', () => {
  const queue = new MoveQueue();
  queue.enqueue('R', 'U', "R'");
  assert.equal(queue.length, 3);
  assert.equal(queue.dequeue().notation, 'R');
  assert.equal(queue.dequeue().notation, 'U');
  assert.equal(queue.dequeue().notation, "R'");
  assert.equal(queue.empty, true);
});

test('slice moves M, E, and S are legal and affect the four middle-slice edges', () => {
  const cases = [
    ['M', 'x'],
    ['E', 'y'],
    ['S', 'z']
  ];
  for (const [notation, axis] of cases) {
    const cube = createSolvedCube();
    const move = parseMove(notation);
    const index = { x: 0, y: 1, z: 2 }[axis];
    const affected = [...cube.cubies.values()].filter(c => c.position[index] === 0);
    const edges = [...cube.cubies.values()].filter(c => c.position[index] === 0 && c.position.filter(v => v !== 0).length === 2);
    assert.equal(affected.length, 8, `${notation} still has 8 positions in its geometric plane`);
    assert.equal(edges.length, 4, `${notation} must affect 4 middle-slice edges; centers remain fixed`);
    const centerPositionsBefore = [...cube.cubies.values()].filter(c => c.position.filter(v => v !== 0).length === 1).map(c => `${c.id}:${c.position.join(',')}:${JSON.stringify(c.stickers)}`).sort();
    const moved = cube.applyMove(notation);
    const centerPositionsAfter = [...moved.cubies.values()].filter(c => c.position.filter(v => v !== 0).length === 1).map(c => `${c.id}:${c.position.join(',')}:${JSON.stringify(c.stickers)}`).sort();
    assert.deepEqual(centerPositionsAfter, centerPositionsBefore, `${notation} must not move center cubies`);
    assert.equal(cube.applySequence([notation, notation, notation, notation]).signature(), cube.signature());
  }
});

test('slice moves and their inverses restore the solved state', () => {
  for (const move of ['M', "M'", 'E', "E'", 'S', "S'", 'M2', 'E2', 'S2']) {
    const cube = createSolvedCube();
    assert.equal(cube.applySequence([move, invertMove(move)]).signature(), cube.signature(), move);
  }
});

test('parseMove accepts standard slice notation and rejects unrelated moves', () => {
  for (const move of ['M', "M'", 'M2', 'E', "E'", 'S', "S'", 'S2']) {
    assert.equal(parseMove(move).notation, move);
  }
  for (const move of ['X', 'x', 'm', 'Q']) assert.throws(() => parseMove(move));
});
