/**
 * Phase 7 — player move history.
 * Records only committed player turns. Scramble turns are intentionally
 * excluded by the entry-point/session lifecycle.
 */
import { createTurn } from './turn.js';

export class MoveHistory {
  constructor() {
    this.events = [];
  }

  record(turn, timestamp = Date.now()) {
    const parsed = createTurn(turn);
    if (!Number.isFinite(timestamp)) throw new TypeError('timestamp must be finite');
    const event = Object.freeze({
      index: this.events.length + 1,
      turn: Object.freeze({ ...parsed }),
      timestamp
    });
    this.events.push(event);
    return event;
  }

  get length() { return this.events.length; }
  clear() { this.events.length = 0; }
  getAll() { return Object.freeze([...this.events]); }
  last(count = 5) {
    if (!Number.isInteger(count) || count < 0) throw new RangeError('count must be a non-negative integer');
    return Object.freeze(this.events.slice(Math.max(0, this.events.length - count)));
  }
}

export class SolveTimer {
  constructor(now = () => Date.now()) {
    if (typeof now !== 'function') throw new TypeError('now must be a function');
    this.now = now;
    this.startedAt = null;
    this.stoppedAt = null;
  }

  start(timestamp = this.now()) {
    if (!Number.isFinite(timestamp)) throw new TypeError('timestamp must be finite');
    if (this.startedAt === null) this.startedAt = timestamp;
    this.stoppedAt = null;
    return this;
  }

  stop(timestamp = this.now()) {
    if (!Number.isFinite(timestamp)) throw new TypeError('timestamp must be finite');
    if (this.startedAt !== null && this.stoppedAt === null) this.stoppedAt = Math.max(timestamp, this.startedAt);
    return this;
  }

  reset() {
    this.startedAt = null;
    this.stoppedAt = null;
    return this;
  }

  get running() { return this.startedAt !== null && this.stoppedAt === null; }

  get elapsedMs() {
    if (this.startedAt === null) return 0;
    const end = this.stoppedAt ?? this.now();
    return Math.max(0, end - this.startedAt);
  }

  snapshot() {
    return Object.freeze({
      startedAt: this.startedAt,
      completedAt: this.stoppedAt,
      elapsedMs: this.elapsedMs
    });
  }
}

export function createSessionRecord({ startedAt, completedAt, scramble = [], moves = [], moveCount = moves.length, solved = false, elapsedMs = 0 } = {}) {
  return Object.freeze({
    startedAt: startedAt ?? null,
    completedAt: completedAt ?? null,
    scramble: Object.freeze([...scramble]),
    moves: Object.freeze([...moves]),
    moveCount,
    solved: Boolean(solved),
    elapsedMs
  });
}
