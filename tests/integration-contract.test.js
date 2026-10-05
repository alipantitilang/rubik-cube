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
  assert.match(html, /isColorGroupedSolved/);
  assert.match(html, /runtime\.reset\(\)/);
});

test('index exposes a post-tick solved-state sensor for interactive completion', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /function detectSolvedState\(\)/);
  assert.match(html, /shuffle\.state !== SHUFFLE_STATES\.PLAYING \|\| runtime\.busy/);
  assert.match(html, /runtime\.cubeState\.isSolved\(\)/);
  assert.match(html, /detectSolvedState\(\)/);
  assert.match(html, /gameSolved = false;/);
});


test('production shell keeps Phase 8 controls inside the responsive game panel', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(html, /<aside (?:id="game-panel" )?class="game-panel"/);
  assert.match(html, /<div id="game-actions" class="game-actions"/);
  assert.doesNotMatch(html, /id="menu-button"/);
  assert.doesNotMatch(html, /id="side-menu"/);
  assert.doesNotMatch(html, /id="menu-scrim"/);
  assert.match(html, /id="zoom-range"/);
  assert.match(css, /100dvh/);
  assert.match(css, /max-width: 720px/);
  assert.match(css, /orientation: landscape/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});

test('Phase 8 removes the lava background system and uses the retro puzzle theme', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.doesNotMatch(html, /lava-field|lava-svg|lava-stream|rock-noise|lava-red|lava-green|lava-blue|lava-orange|lava-yellow|lava-white/);
  assert.doesNotMatch(css, /lava-field|lava-svg|lava-stream|rock-noise|lava-flow|blue-gradient-flow|backdrop-filter/);
  assert.match(css, /FIX-536/);
  assert.match(css, /retro puzzle theme/i);
  assert.match(css, /"Arial Black"/);
}
);

test('FIX-539 keeps the main view farther back and adds directional view controls', () => {
  const camera = fs.readFileSync(path.join(root, 'src/camera-view-state.js'), 'utf8');
  const renderer = fs.readFileSync(path.join(root, 'src/render/cube-renderer.js'), 'utf8');
  assert.match(camera, /distance: 13\.0/);
  assert.match(camera, /maxDistance: 24\.0/);
  assert.match(camera, /minDistance: 6\.0/);
  assert.match(renderer, /_createStickerMaterial/);
  assert.match(renderer, /emissiveIntensity/);
  assert.doesNotMatch(renderer, /uTime|smoothstep|ShaderMaterial/);
  assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /zoom-in|zoom-out|rotate-reset/);
  assert.match(fs.readFileSync(path.join(root, 'styles.css'), 'utf8'), /FIX-542/);
});

test('FIX-542 centers rotate controls and uses a full-width plus/minus zoom bar', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(html, /id="zoom-out" class="zoom-step zoom-out"/);
  assert.match(html, /id="zoom-in" class="zoom-step zoom-in"/);
  assert.match(html, />−<|>\u2212</);
  assert.match(html, />\+<|>\+<\/button>/);
  assert.match(css, /FIX-542/);
  assert.match(css, /zoom-controls \{[\s\S]*width: 100%/);
  assert.match(css, /grid-template-columns: 38px minmax\(0,1fr\) 38px/);
  assert.match(css, /rotate-grid \{[\s\S]*margin-inline: auto/);
  assert.match(css, /clip-path: polygon/);
  assert.match(css, /clip-path: circle/);
  assert.match(css, /--panel-transition: 980ms cubic-bezier/);
  assert.match(css, /--panel-width: 360px/);
  assert.doesNotMatch(html, /class="zoom-triangle/);
});

test('FIX-546 compacts the action area and places zoom steps beside rotate controls', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(html, /class="view-button-row"/);
  assert.match(html, /class="zoom-step-stack"/);
  assert.match(html, /id="zoom-in" class="zoom-step zoom-in"/);
  assert.match(html, /id="zoom-out" class="zoom-step zoom-out"/);
  assert.match(html, /class="zoom-controls"[^>]*aria-label="Kontrol zoom kubus"/);
  assert.match(html, /id="zoom-range"/);
  assert.doesNotMatch(html, /class="zoom-meter"/);
  assert.match(css, /FIX-546/);
  assert.match(css, /\.game-actions \{[\s\S]*grid-template-rows: auto/);
  assert.match(css, /\.game-actions \.action-slot:has\(\.control-button\[hidden\]\)/);
  assert.match(css, /\.view-button-row \{[\s\S]*justify-content: center/);
  assert.match(css, /\.zoom-step-stack \{[\s\S]*grid-template-rows: 38px 38px/);
  assert.match(css, /\.zoom-controls \{[\s\S]*display: block/);
  assert.match(css, /zoom-meter,\n\.zoom-label \{ display: none/);
});


test('FIX-547 removes the unused information menu surface and lifts the compact panel', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.doesNotMatch(html, /id="menu-button"/);
  assert.doesNotMatch(html, /id="side-menu"/);
  assert.doesNotMatch(html, /id="menu-scrim"/);
  assert.match(css, /FIX-547/);
  assert.match(css, /@media \(max-width: 720px\)[\s\S]*?\.game-panel \{[\s\S]*?top: 18px/);
  assert.match(css, /@media \(max-width: 460px\)[\s\S]*?\.game-panel \{[\s\S]*?top: 14px/);
});

test('FIX-548 keeps the compact session panel fully inside the viewport', () => {
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(css, /FIX-548/);
  assert.match(css, /top: 0 !important/);
  assert.match(css, /height: min\(var\(--panel-height\), calc\(100dvh - 16px\)\) !important/);
  assert.match(css, /max-height: min\(var\(--panel-height\), calc\(100dvh - 16px\)\) !important/);
});

test('FIX-549 uses fixed panel geometry, leaves bottom breathing room, and exposes edge zoom', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  const camera = fs.readFileSync(path.join(root, 'src', 'camera-controller.js'), 'utf8');
  const manual = fs.readFileSync(path.join(root, 'src', 'interaction', 'manual-controller.js'), 'utf8');
  assert.match(html, /class="edge-zoom"/);
  assert.match(html, /id="edge-zoom-range"/);
  assert.match(html, /edgeZoomRange\.addEventListener\('input'/);
  assert.match(css, /--panel-width: 360px/);
  assert.match(css, /--panel-height: 620px/);
  assert.match(css, /padding-bottom: 22px/);
  assert.match(css, /\.edge-zoom \{/);
  assert.match(css, /@media \(max-width: 980px\) and \(orientation: landscape\)/);
  assert.match(camera, /this\._touches = new Map\(\)/);
  assert.match(camera, /this\._pinchDistance/);
  assert.match(camera, /event\.pointerType === 'touch'/);
  assert.match(manual, /A second touch belongs to the camera pinch gesture/);
});
