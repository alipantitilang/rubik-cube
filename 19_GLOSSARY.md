# Glossary

## Cubie

One of the 26 visible small cube pieces.

## Corner

Cubie with three visible stickers.

There are 8.

## Edge

Cubie with two visible stickers.

There are 12.

## Center

Cubie with one visible sticker.

There are 6.

## Internal core

The empty logical position `(0,0,0)`.

It is not a visible cubie.

## Face

One of six sides:

```text
U D L R F B
```

## Face turn

A 90°, 180°, or -90° rotation of one outer 3×3 layer.

## Slice turn

A rotation of one internal middle slice:

```text
M E S
```

`M` follows `L`, `E` follows `D`, and `S` follows `F`.

The geometric middle plane has 8 visible positions: 4 edge cubies and 4 face-center cubies. Generic slice turns rotate all 8 visible cubies, allowing center sticker identities to move between faces.

## Direct geometric layer turn

A generic turn resolved from sticker surface normal, screen drag, camera screen basis, cube quaternion, and cubie position. It returns `{ axis, layer, quarterTurns }` without a named face movement.


## Move

A symbolic cube operation such as:

```text
R
U'
F2
```

## Scramble

A sequence of legal moves that transforms solved state into a new reachable state.

## Solved state

Every face has one uniform color and the cube matches its canonical solved configuration.

## Cubie orientation

The rotational orientation of a cubie relative to its original sticker arrangement.

## Camera state

Position/orientation/zoom of the viewing camera.

Camera state is separate from cube state.

## Move history

The list of player moves during the current session.
