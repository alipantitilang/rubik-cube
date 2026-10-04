import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);

test('production entry point wires the generic turn render adapter', () => {
  for (const file of ['index.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /TurnRenderAdapter/);
    assert.match(html, /adapter\s*,/);
  }
});


test('production entry point wires the Phase 6 Play flow', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /ShuffleController/);
  assert.match(html, /SHUFFLE_STATES/);
  assert.match(html, /id="play-button"/);
  assert.match(html, /id="reset-button"/);
  assert.match(html, /shuffle\.play\(\)/);
  assert.match(html, /shuffle\.handleTick\(result\)/);
  assert.match(html, /runtime\.cubeState\.isSolved\(\)/);
  assert.match(html, /runtime\.reset\(\)/);
});

test('production entry point uses an authoritative solved-state sensor outside result.completed', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sensor = /const solved =\s*shuffle\.state === SHUFFLE_STATES\.PLAYING\s*&&\s*!runtime\.busy\s*&&\s*runtime\.cubeState\.isSolved\(\);/s;
  assert.match(html, sensor);
  assert.match(html, /if \(solved\) \{/);
  assert.match(html, /resetButton\.hidden = false;/);
});
