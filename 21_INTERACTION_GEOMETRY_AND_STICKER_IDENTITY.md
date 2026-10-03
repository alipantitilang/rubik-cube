# Interaction Geometry & Sticker Identity Contract

## 1. Colors are permanent sticker identities

Each sticker has a permanent color identity. The solved registry uses six colors:

```text
red, orange, yellow, white, green, blue
```

A color is never a movement direction.
No color is permanently Front, Back, Top, Bottom, Left, or Right in the user interaction model.

## 2. Cube is the object being rotated

```text
Camera = viewer/reference
CubeOrientation = actual visual object orientation
```

Dragging empty space rotates `cubeGroup` with a quaternion. The camera remains a viewer and is not the source of Rubik orientation.

## 3. Sticker interaction has no POV frame

A sticker drag uses:

```text
sticker local normal
+ screen drag vector
+ camera screen basis
+ cube quaternion
+ cubie logical position
```

The result is a generic layer turn:

```ts
{ axis, layer, quarterTurns }
```

## 4. 360° orientation

Cube orientation is quaternion-based and may pass through multiple full rotations. There is no yaw wrap and no color preset.

## 5. 54 sticker identities

Each visible sticker has a permanent code such as:

```text
rc1, rc2, rc3, rc4, rc
re1, re2, re3, re4
```

with equivalent codes for all six colors.

Each current physical slot has an ID `p01..p54`.

## 6. Position history

A turn records transitions such as:

```text
rc1: p01 → p37
```

The code does not change. Only its current slot changes.

## 7. Renderer rule

Sticker material color comes from the sticker's permanent color identity. It must not be inferred from the face it currently occupies.

This is essential after a turn because a red sticker may temporarily occupy a green/orange/etc. local face.
