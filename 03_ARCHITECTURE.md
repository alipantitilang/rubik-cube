# Architecture

## 1. Authoritative layers

```text
UI / pointer
    ↓
Interaction geometry
    ↓
Generic Turn
    ↓
CubeTurnRuntime
    ↓
CubeState
    ↓
StickerHistory
```

The renderer observes state; it does not decide puzzle legality.

## 2. CubeState

`src/core/cube.js` owns:

- 26 visible cubies;
- cubie positions;
- sticker identities;
- sticker local faces;
- generic layer turns;
- solved detection;
- state validation.

The internal position `(0,0,0)` is intentionally empty.

## 3. Generic movement

`src/core/turn.js` defines the only active movement command:

```ts
{
  axis: 'x' | 'y' | 'z',
  layer: -1 | 0 | 1,
  quarterTurns: -1 | 1 | 2
}
```

There is no active R/L/U/D/F/B notation API.

## 4. Sticker identity

`src/core/sticker-map.js` defines:

- 54 permanent sticker codes;
- 54 permanent position IDs;
- face-local slot layout;
- solved registry.

Identity and position are separate concepts:

```text
sticker code = who the color block is
position ID   = where that block currently is
```

## 5. Interaction

`src/interaction/drag-move-resolver.js` directly converts geometry into a generic turn.

```text
sticker normal
+ screen drag
+ camera screen basis
+ cube quaternion
+ cubie position
        ↓
cube-local tangent
        ↓
cross(normal, tangent)
        ↓
X/Y/Z axis
        ↓
layer coordinate
        ↓
generic turn
```

No virtual Front frame is created.

## 6. Object orientation

`CubeOrientationController` owns the visual orientation of the Rubik object.

```text
empty drag → cube quaternion → cubeGroup
```

The camera remains a viewer/reference. Zoom remains camera-owned.

## 7. Animation

`src/animation/turn-animator.js` queues generic turns.

`src/render/turn-renderer.js` temporarily attaches the selected layer to a pivot, animates the generic axis, then returns control to the authoritative state.

`CubeTurnRuntime` commits the turn only after animation completion.

## 8. Center movement

Outer layer:

```text
9 cubies
```

Middle layer:

```text
4 edge cubies
+
4 center cubies
=
8 cubies
```

Centers are not fixed anchors in the logical model.

## 9. History

`StickerHistory` compares sticker positions before and after each committed turn.

```text
rc1: p01 → p37
```

Only changed stickers are stored in each event.

## 10. Renderer

The renderer maintains:

```text
cubie ID → render object
```

Sticker material color is taken from the sticker's permanent color identity, not from the local face.

## 11. Camera

Camera infrastructure remains separate from cube state.

Phase 4 camera orbit capability is retained as reusable infrastructure, but Phase 5 disables pointer orbit so empty-space pointer ownership belongs to cube orientation.

## 12. Production entry point

Only `index.html` is used for the current product.

No phase-specific HTML previews remain in the repository.

## 13. Removed legacy architecture

Removed from active code:

- POV move resolver;
- notation parser and inverse-notation helpers;
- legacy move history containers;
- phase-specific HTML previews;
- stale face-turn filenames.

Historical references remain in change logs for traceability.
