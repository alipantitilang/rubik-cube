# Sticker History Specification

## Purpose

History records how each permanent color sticker moves between the 54 physical sticker slots.

There is no move-string history such as `R U' F2`.

## Permanent sticker identity

Every visible sticker has one stable code:

```text
rc1 rc2 rc3 rc4 rc
re1 re2 re3 re4
```

and equivalent codes for orange, yellow, white, green, and blue.

## Position identity

Every visible sticker slot has one stable ID:

```text
p01 ... p54
```

## History event

A committed turn creates:

```ts
{
  index: 1,
  turn: {
    axis: 'y',
    layer: 1,
    quarterTurns: 1
  },
  changes: [
    { code: 'rc1', from: 'p01', to: 'p37' },
    ...
  ]
}
```

Only stickers whose slot changed are included in `changes`.

## Per-sticker history

The history can answer:

```text
What happened to rc1?
```

Example:

```text
rc1
p01 → p37
p37 → p39
p39 → p10
...
```

The sticker code remains `rc1` throughout.

## Current snapshot

`CubeState.getStickerPositions()` returns all 54 current locations:

```ts
{
  rc1: 'p37',
  re1: 'p38',
  ...
}
```

## Scramble vs player history

Scramble turns may be recorded by the same mechanism for state auditing, but UI solve history should be able to distinguish them from player turns.

## Reset

When the cube is reset/reshuffled as a new session, solve history is cleared. The sticker identity registry itself is never regenerated or renumbered.
