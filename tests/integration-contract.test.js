import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);

test('Phase 5 entry points wire the face-turn render adapter', () => {
  for (const file of ['public/index.html', 'public/phase5.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(html, /FaceTurnRenderAdapter/);
    assert.match(html, /adapter\s*,/);
  }
});
