# Architecture

## Overview

```
┌──────────── React (src/features, src/components) ────────────┐
│  stages, panels, controls                                    │
└───────────────┬──────────────────────────────▲───────────────┘
                │ actions                      │ selectors
        ┌───────▼──────────────────────────────┴───────┐
        │        Zustand store (src/stores/appStore)   │
        └───────┬──────────────────────────────▲───────┘
                │ subscriptions                │ playback progress, fps, quality
┌───────────────▼──────────────────────────────┴───────────────┐
│  Engine (src/three/core/Engine.ts) — plain Three.js          │
│  director → PoseController → Octopus / Organs / SkinPatch    │
└──────────────────────────────────────────────────────────────┘
```

There is one `<canvas>`, fixed behind the page. The page is one scrolling route with five full-height stages. Scrolling changes `stage` in the store; the engine reacts by changing pose, camera and render mode. Nothing is unmounted between stages, so the animal is continuous from the title to the last simulation.

### Why Three.js directly rather than a React renderer

The animal is one persistent object driven every frame by a pose controller, custom shader uniforms and a second scissored viewport. An imperative engine with a small, explicit surface was simpler to reason about, test (`engine.debug()`) and dispose than a declarative scene graph, and it keeps per-frame work out of React entirely. React only renders the interface.

## Languages

Text is not part of the diagram above on purpose: it is a third, independent input. `src/i18n/` (i18next) holds the active locale and all strings; components read them with `t()` and `useContent()`. The store and the engine carry ids only, so changing language re-renders text and nothing else. Details: `docs/i18n/localization-architecture.md`.

## The store

`src/stores/appStore.ts` holds all state shared between UI and engine: current stage, anatomy view mode and selection, mechanism and step, arm-rig values, mimicry target and playback, camera requests, quality. Requests that are events rather than state (camera preset, zoom, replay, seek) carry a `nonce` so repeating the same request still fires.

The engine writes back only: `playback.progress/phaseId`, `fps`, `effectiveQuality`, `engineStatus`, `loadProgress`, `loadStep`. `phaseId` and `loadStep` are ids that the interface translates.

## The director

`src/three/core/director.ts` exports `direct(state) → Directive`, a pure function that answers "given this app state, what should be on screen?": target pose and transition sequence, involved arms, view mode, camera home, whether the visitor can orbit, which reference animal to load, whether the transition is scrubbable, whether rendering can idle.

Keeping this in one pure function means stage logic is testable without WebGL and the engine has no `if (stage === …)` scattered through it.

## The engine

`Engine.create(canvas, onProgress)` builds the scene in steps (reporting real progress), then runs a render loop that:

1. samples frame time and steps the quality tier up or down (`core/quality.ts`);
2. advances the `PoseController` and applies the current pose to the octopus;
3. eases render-state uniforms (X-ray, section, explode, isolate, highlights);
4. measures the DOM rectangles reserved for the animal and the reference viewport;
5. renders the main view, then the reference animal into a scissored rectangle with a camera slaved to the main one.

The loop stops when the tab is hidden or the Sources stage is on screen.

Public surface used by the UI: `getAnchorScreen`, `onFrame`, `renderThumbnail`, `debug`, `dispose`.

### Layout coupling

The engine finds `#stage-<stage> [data-viewport="main"]` and shifts the camera's principal point so the animal is centred in that rectangle rather than in the window (panels cover part of the canvas). `[data-viewport="reference"]` marks where the reference animal is drawn. This is the only place the engine reads the DOM.

## Models

- `models/octopus/` — body (lathe-like profile), eight arms (tube swept along a parametric curve), suckers (instanced, two rows), web between arm bases. Geometry is rebuilt in place each frame from the pose; topology never changes.
- `models/anatomy/` — schematic organs and nerve cords, plus named anchor points used for hotspots and camera focus.
- `models/skin/SkinPatch.ts` — the magnified skin block with separately toggled layers and chromatophores that expand with a 0–1 drive value.
- `models/reference/` — ten low-detail comparison animals, lazy-loaded one at a time.

## Materials

`materials/skinMaterial.ts` patches `MeshStandardMaterial` with a procedural banding/mottle pattern driven by `SkinPattern` values, and with the uniforms for X-ray, section, isolation and highlighting. One shared uniform set drives body, arms and web so they always agree.

## Quality and fallback

Three tiers (high/medium/low) change pixel ratio, shadows, arm tessellation, sucker count and particles. `auto` starts from a device guess and follows measured frame rate. Without WebGL (`?nowebgl=1` forces this) the canvas stays empty, a notice appears, and all written content remains usable.

## Accessibility

Keyboard-operable controls, visible focus, `aria-pressed`/`aria-selected`/`role="switch"` on toggles, live regions for step and phase text, text alternatives for diagrams, evidence grades conveyed by letter, word and shape. `prefers-reduced-motion` disables smooth scrolling and camera tweens and reduces idle motion.

## Known limitations

- Hotspots are not occlusion-tested; a marker can show for a structure on the far side.
- Automated tests run on a software renderer at roughly 10–15 fps, so frame-rate behaviour on real GPUs is checked by hand only.
- Only one engine may be created on the canvas at a time. `Viewer.tsx` queues starts, because React StrictMode mounts effects twice in development and two renderers on one WebGL context intermittently rendered black.
- Shader programs are rebuilt once after the first compile (`refreshMaterials`), because programs compiled before the shadow map existed rendered black when the engine started below the top quality tier. The underlying cause was not investigated further.
