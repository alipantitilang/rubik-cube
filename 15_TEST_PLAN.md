# Test Plan

## 1. Cube construction

### Test

Initial cube contains:

- 8 corners
- 12 edges
- 6 centers
- 0 visible cubies at `(0,0,0)`

Expected:

```text
26 visible cubies
```

---

## 2. Face move tests

For every face:

```text
U
D
L
R
F
B
```

test:

```text
M × 4 = identity
```

---

## 3. Inverse tests

For every face:

```text
M M' = identity
```

---

## 4. Double-turn tests

```text
M2 M2 = identity
```

---

## 5. Sequence inverse

For arbitrary sequence:

```text
S + inverse(S) = identity
```

Example:

```text
R U F2 L' D B
B' D' L F2 U' R'
```

---

## 6. Scramble tests

Verify:

- scramble starts from solved
- all moves legal
- no impossible sticker state
- scramble result is not intentionally guaranteed solved
- deterministic seed produces deterministic sequence

---

## 7. Solved checker

Verify:

- solved state = true
- one legal move = false
- move + inverse = true
- four same quarter turns = true

---

## 8. Animation tests

Verify:

- no visible snapping during normal move
- final transform exactly matches logical state
- no layer remains attached after animation
- no second turn starts before current turn completes

---

## 9. Interaction tests

Desktop:

- camera drag
- wheel zoom
- face drag
- UI click

Mobile:

- camera drag
- pinch
- face drag
- UI tap

---

## 10. Input isolation

Starting on a UI control must not rotate the cube.

Starting a face gesture must not unexpectedly orbit the camera.

---

## 11. Responsive tests

Test at minimum:

- 320×568
- 375×667
- 390×844
- 768×1024
- 1024×768
- 1280×720
- 1440×900
- 1920×1080

Also test browser zoom:

- 80%
- 100%
- 125%
- 150%
- 200%

---

## 12. Completion test

Solve the cube.

Expected:

1. final turn completes
2. solved state detected
3. Congratulations appears
4. cube remains stable
5. Reshuffle works
6. history resets
7. new scramble begins

---

## 13. Regression test

Every bug involving a move should become a permanent automated test if practical.
