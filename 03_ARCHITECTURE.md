# Technical Architecture

## 1. Layered Architecture

```text
UI
 │
 ├── Controls
 ├── History
 ├── Congratulations
 └── Information
       │
       ▼
Interaction Controller
       │
       ├── Camera Interaction
       ├── Face Gesture Detection
       └── Button Commands
       │
       ▼
Cube Domain
       │
       ├── CubeState
       ├── Cubie
       ├── Face
       ├── Move
       ├── MoveEngine
       ├── ScrambleGenerator
       └── SolvedChecker
       │
       ▼
Renderer
       │
       ├── Cubie Meshes
       ├── Materials
       ├── Scene
       ├── Camera
       └── Lighting
```

## 2. Suggested project structure

```text
src/
├── app/
│   ├── App
│   └── routes
├── cube/
│   ├── CubeState
│   ├── Cubie
│   ├── Face
│   ├── Move
│   ├── MoveEngine
│   ├── ScrambleGenerator
│   └── SolvedChecker
├── renderer/
│   ├── CubeRenderer
│   ├── CubieRenderer
│   ├── Materials
│   ├── CameraController
│   └── Lighting
├── interaction/
│   ├── FaceGestureController
│   ├── CameraGestureController
│   └── PointerState
├── ui/
│   ├── ControlPanel
│   ├── ZoomControl
│   ├── RotateControls
│   ├── MoveHistory
│   ├── Congratulations
│   └── InfoPanel
├── config/
│   ├── colors
│   ├── dimensions
│   └── interaction
└── tests/
    ├── cube
    ├── scramble
    └── interaction
```

## 3. Separation of responsibilities

### CubeState

Stores the current puzzle state.

### MoveEngine

Applies legal moves.

### Renderer

Converts state to visual representation.

### Interaction Controller

Converts pointer/touch input into commands.

### UI

Displays state and sends commands.

---

## 4. Recommended state shape

Conceptual example:

```ts
type Axis = 'x' | 'y' | 'z'

type Vector3Int = {
  x: -1 | 0 | 1
  y: -1 | 0 | 1
  z: -1 | 0 | 1
}

type Cubie = {
  id: string
  position: Vector3Int
  orientation: Orientation
  stickers: Sticker[]
}

type CubeState = {
  cubies: Cubie[]
  moveHistory: Move[]
  status: 'idle' | 'scrambling' | 'playing' | 'solved'
}
```

This is conceptual. The final representation may be optimized after correctness is established.

---

## 5. Renderer rule

The renderer should maintain a mapping:

```text
logical cubie id → render object
```

When state changes:

- update logical transform target
- animate if required
- do not create a new random cubie
- preserve stable IDs

Stable IDs simplify animation and debugging.

---

## 6. Internal core

The empty `(0,0,0)` position may be represented by an internal core object.

The core is not a puzzle cubie and must not receive face stickers.

It exists only to support:

- structural grouping
- rotation pivot
- future implementation convenience

If a scene graph approach requires a pivot, the pivot may be invisible.

---

## 7. Animation model

A face turn should rotate a temporary layer/pivot.

Conceptually:

```text
layer cubies
    ↓
attach to turn pivot
    ↓
animate pivot rotation
    ↓
detach
    ↓
commit logical state
    ↓
snap/resolve transforms
```

The exact rendering technique may vary.

The logical state must remain consistent with the final result.
