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
  assert.match(fs.readFileSync(path.join(root, 'styles.css'), 'utf8'), /FIX-550/);
});

test('FIX-550 uses a clean fixed panel layout with compact view controls and direct zoom access', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  const camera = fs.readFileSync(path.join(root, 'src', 'camera-controller.js'), 'utf8');
  const manual = fs.readFileSync(path.join(root, 'src', 'interaction', 'manual-controller.js'), 'utf8');

  assert.match(html, /id="game-panel" class="game-panel"/);
  assert.match(html, /id="play-button"/);
  assert.match(html, /id="reset-button"/);
  assert.match(html, /class="history-screen"/);
  assert.match(html, /class="rotate-grid"/);
  assert.match(html, /class="zoom-step-stack"/);
  assert.match(html, /id="zoom-in" class="zoom-step zoom-in"/);
  assert.match(html, /id="zoom-out" class="zoom-step zoom-out"/);
  assert.match(html, /class="zoom-controls"/);
  assert.match(html, /class="edge-zoom"/);
  assert.match(html, /id="edge-zoom-range"/);
  assert.doesNotMatch(html, /id="finish-button"|id="start-button"|id="stop-button"/);
  assert.match(css, /FIX-550/);
  assert.match(css, /--panel-width: 360px/);
  assert.match(css, /--panel-height: 620px/);
  assert.match(css, /height: var\(--panel-height\) !important/);
  assert.match(css, /top: max\(10px, calc\(\(100dvh - var\(--panel-height\)\) \/ 2\)\) !important/);
  assert.match(css, /\.status-line \{[\s\S]*position: absolute !important/);
  assert.match(css, /\.action-main \{ height: 44px/);
  assert.match(css, /\.action-reset \{ height: 0/);
  assert.match(css, /\.action-reset:has\(\.control-button:not\(\[hidden\]\)\)/);
  assert.match(css, /\.history-section \{[\s\S]*height: 136px/);
  assert.match(css, /grid-auto-rows: 30px/);
  assert.match(css, /\.zoom-step-stack \{[\s\S]*grid-template-rows: 38px 38px/);
  assert.match(css, /\.edge-zoom \{/);
  assert.match(css, /@media \(max-width: 980px\) and \(orientation: landscape\)/);
  assert.match(camera, /this\._touches = new Map\(\)/);
  assert.match(camera, /this\._pinchDistance/);
  assert.match(camera, /event\.pointerType === 'touch'/);
  assert.match(manual, /A second touch belongs to the camera pinch gesture/);
});
