/** Generic layer-turn descriptor. No R/L/U/D/F/B notation is used. */

export const TURN_AXES = Object.freeze(['x', 'y', 'z']);
export const TURN_LAYERS = Object.freeze([-1, 0, 1]);

export function createTurn({ axis, layer, quarterTurns = 1 } = {}) {
  if (!TURN_AXES.includes(axis)) throw new Error(`Invalid turn axis: ${axis}`);
  if (!TURN_LAYERS.includes(layer)) throw new Error(`Invalid turn layer: ${layer}`);
  if (![1, -1, 2].includes(quarterTurns)) throw new Error(`Invalid quarterTurns: ${quarterTurns}`);
  return Object.freeze({ axis, layer, quarterTurns });
}

export function inverseTurn(turn) {
  const value = typeof turn === 'string' ? JSON.parse(turn) : turn;
  return createTurn({ axis: value.axis, layer: value.layer, quarterTurns: value.quarterTurns === 2 ? 2 : -value.quarterTurns });
}

export function turnKey(turn) {
  const t = createTurn(turn);
  return `${t.axis}:${t.layer}:${t.quarterTurns}`;
}
