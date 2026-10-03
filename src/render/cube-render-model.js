/** Pure renderer mapping helpers. No browser or Three.js dependency. */

export const FACE_NORMALS = Object.freeze({
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1]
});

export const CUBE_COLORS = Object.freeze({
  U: '#ffd91a',
  D: '#f5f5f5',
  R: '#28a745',
  L: '#2f63d6',
  F: '#d93636',
  B: '#f28c28'
});

export const FACE_ORDER = Object.freeze(['U', 'D', 'R', 'L', 'F', 'B']);

export function cubieType(cubie) {
  const count = cubie.position.filter(v => v !== 0).length;
  if (count === 3) return 'corner';
  if (count === 2) return 'edge';
  if (count === 1) return 'center';
  return 'core';
}

export function logicalToRenderPosition(position, spacing = 1.04) {
  return position.map(v => v * spacing);
}

export function stickerDescriptors(cubie) {
  return Object.entries(cubie.stickers).map(([face, color]) => ({
    face,
    color,
    normal: [...FACE_NORMALS[face]]
  }));
}

export function buildRenderModel(cubeState, spacing = 1.04) {
  const cubies = [...cubeState.cubies.values()].map(cubie => ({
    id: cubie.id,
    type: cubieType(cubie),
    logicalPosition: [...cubie.position],
    renderPosition: logicalToRenderPosition(cubie.position, spacing),
    stickers: stickerDescriptors(cubie)
  }));

  return Object.freeze({
    cubies: Object.freeze(cubies),
    visibleCubieCount: cubies.length,
    hasCoreCubie: cubies.some(c => c.type === 'core')
  });
}
