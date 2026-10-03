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
  assert.match(html, /shuffle\.play\(\)/);
  assert.match(html, /shuffle\.handleTick\(result\)/);
});
