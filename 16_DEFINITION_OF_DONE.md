# Definition of Done

## Cube engine

- [ ] 26 visible cubies
- [ ] empty internal center position
- [ ] six face centers
- [ ] legal face moves
- [ ] legal slice moves M/E/S with standard direction conventions
- [ ] correct cubie orientation
- [ ] inverse moves
- [ ] double turns
- [ ] solved detection
- [ ] deterministic tests

## Shuffle

- [ ] legal scramble
- [ ] configurable length
- [ ] no invalid states
- [ ] smooth sequential animation
- [ ] manual input locked during scramble
- [ ] player history starts empty after scramble

## Interaction

- [ ] camera orbit
- [ ] mouse wheel zoom
- [ ] touch pinch zoom
- [ ] face/sticker drag from center, edge, and corner
- [ ] POV dominant-face resolution restricted to F/R/B/L
- [ ] canonical color orientation: U yellow, D white, F red, R green, B orange, L blue
- [ ] exact F/R/B/L adjacency table
- [ ] center identity invariant during M/E/S
- [ ] front corner/edge mapping
- [ ] side F/B/S mapping
- [ ] live drag progress and snap/cancel
- [ ] correct move direction
- [ ] input conflict prevention

## UI

- [ ] Play
- [ ] Reshuffle
- [ ] rotate buttons
- [ ] zoom slider
- [ ] history
- [ ] information
- [ ] Congratulations

## Responsive

- [ ] desktop
- [ ] tablet
- [ ] mobile
- [ ] portrait
- [ ] landscape
- [ ] browser zoom
- [ ] high DPI

## Accessibility

- [ ] keyboard controls
- [ ] focus states
- [ ] labels
- [ ] reduced motion
- [ ] adequate touch targets

## Quality

- [ ] no decorative cube animations
- [ ] no state/render mismatch
- [ ] no floating-point drift
- [ ] no accidental double moves
- [ ] no broken layout at supported sizes
