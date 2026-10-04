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
    this.pausedAt = null;
    this.runningSince = null;
    this.accumulatedMs = 0;
  }

  start(timestamp = this.now()) {
    if (!Number.isFinite(timestamp)) throw new TypeError('timestamp must be finite');
    if (this.startedAt === null) this.startedAt = timestamp;
    this.stoppedAt = null;
    this.pausedAt = null;
    this.runningSince = timestamp;
    return this;
  }

  pause(timestamp = this.now()) {
    if (!Number.isFinite(timestamp)) throw new TypeError('timestamp must be finite');
    if (this.running) {
      this.accumulatedMs += Math.max(0, timestamp - this.runningSince);
      this.pausedAt = timestamp;
      this.runningSince = null;
    }
    return this;
  }

  resume(timestamp = this.now()) {
    if (!Number.isFinite(timestamp)) throw new TypeError('timestamp must be finite');
    if (this.startedAt !== null && this.pausedAt !== null && this.stoppedAt === null) {
      this.runningSince = timestamp;
      this.pausedAt = null;
    }
    return this;
  }

  stop(timestamp = this.now()) {
    if (!Number.isFinite(timestamp)) throw new TypeError('timestamp must be finite');
    if (this.startedAt !== null && this.stoppedAt === null) {
      if (this.running) this.accumulatedMs += Math.max(0, timestamp - this.runningSince);
      this.stoppedAt = timestamp;
      this.pausedAt = null;
      this.runningSince = null;
    }
    return this;
  }

  reset() {
    this.startedAt = null;
    this.stoppedAt = null;
    this.pausedAt = null;
    this.runningSince = null;
    this.accumulatedMs = 0;
    return this;
  }

  get running() { return this.startedAt !== null && this.stoppedAt === null && this.pausedAt === null && this.runningSince !== null; }
  get paused() { return this.startedAt !== null && this.stoppedAt === null && this.pausedAt !== null; }

  get elapsedMs() {
    if (this.startedAt === null) return 0;
    if (this.running) return Math.max(0, this.accumulatedMs + this.now() - this.runningSince);
    return Math.max(0, this.accumulatedMs);
  }

  snapshot() {
    return Object.freeze({
      startedAt: this.startedAt,
      completedAt: this.stoppedAt,
      elapsedMs: this.elapsedMs,
      paused: this.paused,
      accumulatedMs: this.accumulatedMs
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
