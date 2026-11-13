# Animation system

All animation is procedural. There are no keyframed clips and no skeleton: a pose is a small set of numbers, and the meshes are rebuilt from those numbers every frame. Code lives in `src/three/animation/` and has no renderer dependency, so it is unit-tested directly.

## Coordinate frame

Y is up, the sand is `y = 0`, the animal faces +Z, its left is +X. Angles are radians. Arms are indexed `L1, R1, L2, R2, L3, R3, L4, R4` (pair 1 is the front pair).

## A pose is data

`PoseDefinition` (`types.ts`) has four channels:

| Channel | Type | Controls |
| --- | --- | --- |
| `arms` | `ArmPose[8]` | heading, pitch at base and tip, bend, tip curl, coil, length, burial, travelling wave |
| `body` | `BodyPose` | height, mantle pitch and scale, head pitch, eye raise, web spread, burrow |
| `skin` | `SkinPattern` | dark and light colours, band frequency/contrast/sharpness, mottle, pallor, texture |
| `movement` | `MovementParams` | bob, sway, mantle pulse, travel speed |

`restPose.ts` provides `makeArm/makeArms/makeBody/makeSkin/makeMovement` builders that fill defaults, and `REST_POSE`. A mimicry target (`src/data/mimicry/targets/*.ts`) is a `PoseDefinition` plus content. `pose.ts` provides `clonePose`, `copyPose`, `blendPose` (per-channel weights), `poseDistance` and `isValidPose`.

**The octopus always has eight arms.** An arm that should disappear (down a burrow, under the sand) sets `bury`, which allows its curve below `y = 0`; it is never removed. The "Reveal hidden arms" control fades the sand to show them.

## From pose to arm shape

`armCurve.ts` turns one `ArmPose` into a sampled curve with a moving frame:

- heading and pitch are integrated along the arm, so bend, curl and coil are angular rates rather than positions and the arm cannot kink;
- the travelling wave adds a phase-shifted heading or pitch offset that grows toward the tip;
- `length` stretches the arm, and the radius scales by `1/√length` so volume is preserved, as in a muscular hydrostat;
- unless `bury > 0`, samples are kept on or above the sand.

`ArmsMesh` sweeps a tapered tube along the curve, `Suckers` places two rows of instanced suckers on its oral side, and `WebMesh` spans the arm bases.

## Transitions

A `TransitionSequence` (`transition.ts`) has a duration and overlapping phases, each tied to a channel:

```
rest → prepare → arms → body → skin → movement → final
```

`channelWeights(sequence, progress)` returns a 0–1 weight per channel, each eased with a quintic smootherstep (zero velocity and acceleration at both ends). Arms lead, the body follows, then skin, then movement, with overlaps so it reads as one action. `DEFAULT_SEQUENCE` lasts 9 s; `QUICK_SEQUENCE` (3.2 s) is used for demos and returning to rest; `makeSequence` retimes phases per target.

This staging is a teaching device. A real animal changes everything at once and much faster; the site says so.

## PoseController

`PoseController.ts` owns the current transition:

- `setTarget(pose, sequence)` starts a transition **from the pose currently on screen**, so changing target mid-transition does not snap;
- `play / pause / seek / setSpeed / replay` implement the playback bar;
- `setChannelMask` holds chosen channels at the starting pose (mechanism 5, "components of mimicry");
- `update(dt)` returns the blended pose and advances the wave, bob, sway, pulse and travel clocks. Clocks are accumulated, not derived from absolute time, so changing a wave speed mid-blend does not jump phase.

The engine then applies extras on top of the returned pose: the manual arm rig (mechanism 3), idle breathing, and reduced-motion scaling.

## Guarantees and the tests behind them

`animation.test.ts` and `src/data/mimicry/mimicry.test.ts` check:

- every pose has eight valid, finite arms;
- arm frames are orthonormal and do not flip, including for vertical arms;
- arc length matches the extension factor;
- unburied arms stay on or above the sand; buried arms may go below;
- channel weights rise monotonically from 0 to 1, in the order arms → body → skin;
- the controller reaches the target at the sequence duration, respects speed, pause, seek, replay and channel masks, and does not snap on retargeting;
- for every one of the ten targets, the transition sampled over time stays finite with no frame-to-frame jump above the continuity threshold.

The browser suite repeats the eight-arms/finite check against the live engine while each of the ten targets plays.

## Adding a pose

1. Build it with the `make*` helpers; only specify what differs from rest.
2. Give it a sequence (`DEFAULT_SEQUENCE` or `makeSequence(...)`).
3. List `involvedArms` so the arm phase can highlight them.
4. Run `npm run test`; the validity and continuity tests pick it up once it is registered in `src/data/mimicry/index.ts`.
