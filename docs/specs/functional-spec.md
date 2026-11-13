# MIMIC LAB — Functional Specification

Companion to `product-spec.md` (why) and `visual-spec.md` (look). This file defines what each feature does
and the data it consumes. Architecture detail is in `docs/technical/architecture.md`.

## 1. Application state (`src/stores/appStore.ts`, Zustand)

| Key | Type | Meaning |
|---|---|---|
| `stage` | `'intro' \| 'anatomy' \| 'mechanisms' \| 'mimicry' \| 'sources'` | Which scroll stage is on screen |
| `viewMode` | `'normal' \| 'xray' \| 'exploded' \| 'section' \| 'isolated' \| 'neural' \| 'skin'` | Anatomy visualisation mode |
| `selectedStructure` | `string \| null` | Anatomy structure id |
| `explodeProgress` | `0..1` | Exploded-view slider |
| `sectionOffset` | `-1..1` | Cross-section plane position |
| `skinLayer` | `'all' \| 'epidermis' \| 'chromatophores' \| 'iridophores' \| 'leucophores' \| 'dermis'` | Selected skin layer |
| `skinActivation` | `0..1` | Neural drive to chromatophore muscles in the skin model |
| `mechanism` | mechanism id | Active mechanism in the lab |
| `mechanismStep` | `number` | Active step of that mechanism |
| `locomotion` | locomotion id | Active locomotion demo |
| `armControl` | `{ arm, extend, lift, sweep, curl }` | Mechanism 3 manual arm rig |
| `mimicryChannels` | `{ arms, body, skin, movement: boolean }` | Mechanism 5 component toggles |
| `mimicryTarget` | target id \| `null` | Selected identity |
| `playback` | `{ playing, speed, progress }` | Transition playback (progress is written by the engine) |
| `comparison` | `boolean` | Side-by-side comparison on |
| `showBuried` | `boolean` | Make the sand translucent to reveal hidden arms |
| `cameraPreset` | `{ name, nonce }` | Request a camera preset |
| `quality` | `'auto' \| 'high' \| 'medium' \| 'low'` | Requested quality; `effectiveQuality` is what the engine uses |
| `engineStatus` | `'loading' \| 'ready' \| 'unsupported' \| 'error'` + `loadProgress`, `loadLabel` | Boot state |

React writes this store; the engine subscribes to it. The engine writes back only `playback.progress`,
`effectiveQuality`, `fps` and boot state.

## 2. Stage A — Introduction

- Title, tagline, one sentence, two CTAs. "Explore the creature" scrolls to Anatomy; "Discover its
  identities" scrolls to The Ten Identities.
- Camera: slow auto-orbit (off under reduced motion). Octopus in the resting pose.
- Loading overlay with real progress from the engine build steps, then fades.

## 3. Stage B — Anatomy Explorer

### Camera
Orbit (drag / one-finger), pan (right-drag, Shift-drag or two-finger), zoom (pinch, Ctrl + wheel, `+`/`-`
buttons and keys), arrow keys rotate when the viewer is focused. Presets: Reset, Front, Side, Top, Bottom,
Rear, tweened. Plain wheel scrolls the page so the visitor is never trapped; a hint says so.

### Structures (`src/data/anatomy/structures.ts`)

```ts
interface AnatomyStructure {
  id: string;
  name: string;
  group: 'external' | 'internal';
  system: 'integument' | 'nervous' | 'circulatory' | 'respiratory' | 'digestive' | 'locomotor' | 'sensory' | 'defence';
  summary: string;        // short scientific explanation
  func: string;           // biological function
  relations: string;      // relationship with other systems
  deeper: string;         // optional deeper explanation
  basis: 'species' | 'octopod-general';  // known for T. mimicus, or generalised from other octopuses
  approximation?: string; // what is schematic about the 3D representation
  references: string[];   // reference ids
  anchor: string;         // engine anchor id for hotspot + camera focus
  preferredMode?: ViewMode; // mode auto-selected when picked from Normal view
}
```

Required ids: mantle, head, eyes, arms, web, suckers, funnel, skin, brain, optic-lobes, nervous-system,
gills, hearts, digestive-system, beak, radula, ink-sac (only if verified for the species).

Selecting a structure (from the list or a 3D hotspot): highlights it in 3D, focuses the camera, opens its
card (name, summary, function, relations, expandable deeper text, basis label, references). Internal
structures picked in Normal view switch the mode to X-Ray.

Hotspots are HTML buttons projected from engine anchors, so they are keyboard-reachable and have real
labels. The structure list is always available as the non-pointer path.

### View modes

| Mode | Behaviour |
|---|---|
| Normal | Opaque skin, organs hidden |
| X-Ray | Skin becomes a translucent rim-lit shell; organs visible |
| Exploded | Slider 0–1 moves each organ along its own vector out of the body; skin ghosts progressively |
| Cross-Section | A sagittal cutting plane (slider) removes one side of mantle and head; inner wall shaded; organs intact |
| Isolated | Only the selected structure is fully rendered; the rest is a faint ghost |
| Neural | Skin ghosted; brain, optic lobes, nerve ring, eight arm nerve cords and stellate ganglia glow with travelling pulses |
| Skin Structure | Camera moves to a magnified skin block with layers; layer picker and an activation slider expand chromatophores |

## 4. Stage C — Mechanism Lab (`src/data/mechanisms/`)

```ts
interface Mechanism {
  id: 'nervous' | 'skin' | 'arms' | 'locomotion' | 'mimicry';
  title: string; lead: string;
  steps: { id: string; title: string; text: string }[];
  points: string[];            // key facts
  caution?: string;            // the common misconception this section corrects
  diagram?: DiagramId;         // SVG diagram with a text description
  references: string[];
}
```

1. **Distributed nervous system** — stepper: stimulus → optic lobes → brain → descending commands → local
   arm circuits → coordinated posture change. The 3D nervous system lights up per step and the arms respond.
2. **Dynamic skin coloration** — the five-step sequence on the magnified skin model, driven by
   `skinActivation`; final step returns to the animal showing the resulting pattern.
3. **Arm movement** — pick any of the eight arms; sliders for extend, lift, sweep, curl; presets Extend,
   Fold, Hide, Spread. Muscular-hydrostat diagram.
4. **Locomotion** — Crawling, Jet propulsion, Flatfish-style swimming (and any other mode the research
   supports); speed control 1×, 0.5×, 0.25×.
5. **Adaptive mimicry** — one example identity with four toggles (arm configuration, body posture, skin
   pattern, movement) so the visitor can see that the resemblance is a sum of ordinary octopus abilities.

## 5. Stage D — The Ten Identities (`src/data/mimicry/`)

```ts
interface MimicryTarget {
  id: string; order: number;            // 1..10
  name: string; scientificName?: string;
  tagline: string;                      // one-line card text
  evidenceLevel: 'A' | 'B' | 'C';
  evidenceDescription: string;
  reconstruction: 'documented' | 'partly-documented' | 'conceptual';
  references: string[];
  pose: PoseDefinition;                 // bodyConfiguration + armConfiguration + skinPattern + movementParameters
  involvedArms: number[];               // arm indices to highlight
  transitionSequence: TransitionSequence;
  camera: { azimuth: number; polar: number; distance: number };
  educationalContent: { mechanism: string; similarities: string[]; differences: string[]; context?: string };
  limitations: string;
  referenceModel: ReferenceModelId;
}
```

`PoseDefinition`, `ArmPose`, `BodyPose`, `SkinPattern`, `MovementParams`, `TransitionSequence` are defined
in `src/three/animation/types.ts` and described in `docs/technical/animation-system.md`.

Behaviour:
- A selector shows ten cards: number, name, rendered 3D thumbnail of the reference model, evidence chip,
  one-line explanation.
- Selecting a card focuses the camera and plays the staged transition from the resting pose:
  1 resting state → 2 preparation → 3 arm repositioning → 4 body posture → 5 colour and pattern →
  6 movement → 7 final posture. Step 8 is the explanation panel. The current phase is shown and announced.
- Controls: play / pause, replay, speed (1×, 0.5×, 0.25×), scrubber, return to resting state.
- Involved arms are rim-highlighted during the arm phase.
- A reference model of the target animal appears in an inset viewport; **Comparison mode** enlarges it to a
  split view (animal left, octopus right) with a synchronised camera and animation clock, plus a
  similarities / differences table (silhouette, posture, colour, movement, anatomy).
- "Reveal hidden arms" makes the sand translucent so buried arms can be seen: all eight always exist.
- Switching target mid-transition blends from the current blended pose; nothing snaps.

## 6. Stage E — Sources and method

Evidence scale explained; full reference list (from `src/data/references`); model limitations; asset and
font attribution.

## 7. Performance

- Engine and Three.js are a lazily loaded chunk; the hero text paints first.
- Quality tiers change pixel-ratio cap, shadow map, arm tessellation, sucker count and particle count.
  `auto` steps down when the measured frame rate stays under 30 fps and up when comfortably above 55.
- Suckers and particles are instanced / point clouds; geometry buffers are reused every frame.
- Reference models are built on demand and disposed when no longer shown; thumbnails are rendered once.
- The loop stops when the tab is hidden or the Sources stage covers the canvas.
- No post-processing passes.
- No WebGL: a static illustrated fallback with all educational content.

## 8. Accessibility

Keyboard access to every control; visible focus rings; `aria-pressed` / `aria-selected` on toggles and
tabs; `aria-live` phase announcements; text alternatives for diagrams; reduced-motion support; evidence
grade conveyed by letter and word, not colour.

## 9. Acceptance criteria

Each line is checked by an automated test or a recorded browser inspection (see `docs/qa/test-plan.md`).

1. One route; five stages reachable by scroll and by the nav.
2. Engine reports eight arms with finite geometry in every pose, at every sampled time of every transition.
3. No frame-to-frame vertex jump above a set threshold during any transition (continuity test).
4. All six camera presets move the camera; orbit and zoom change the camera state.
5. Selecting each anatomy structure updates the card and the engine highlight state.
6. Each of the seven view modes changes engine render state (not just a button state).
7. Ten targets exist with valid schema, evidence level, references and limitations.
8. Each target plays to completion; pause freezes progress; replay restarts; reset returns to rest.
9. Comparison mode renders two viewports.
10. Mobile viewport: no horizontal overflow; target selection and playback work by tap.
11. Forced no-WebGL mode shows the fallback with content.
12. Disposing the engine releases its geometries and textures.
