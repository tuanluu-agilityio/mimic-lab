# Agent guide — MIMIC LAB

This is the canonical instruction file for AI coding agents. `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md` and `.cursor/rules/mimic-lab.mdc` all point here. Change this file, not the pointers.

## What this project is

A single-page educational website about the mimic octopus with a procedural 3D model. See `README.md` for the tour and `docs/technical/architecture.md` for how it fits together.

## Commands

```bash
npm run dev          # dev server
npm run typecheck    # must be clean
npm run test         # Vitest unit tests
npm run build        # required before test:e2e
npm run test:e2e     # Playwright (desktop + mobile projects)
npm run verify       # all of the above, in order
```

Run `npm run typecheck` and `npm run test` after any change. Run `npm run verify` before calling work done. Only these scripts exist; do not assume others.

## Rules that are easy to break

### Scientific content

1. **Do not invent biology.** Anatomy, behaviour and numbers must come from a source in `src/data/references/index.ts`. If you cannot source a claim, do not add it.
2. **Every content object cites references by id.** The text itself is in `src/i18n/locales/`; `src/data/` holds ids, grades, references and poses. `src/data/content.test.ts` and `src/data/mimicry/mimicry.test.ts` check that the ids exist.
3. **Keep uncertainty visible.** Evidence grades (`A`/`B`/`C`), `basis` (`species` vs `octopod-general`), `reconstruction` level, `approximation` and `limitations` fields are shown to visitors. Do not upgrade a grade or delete a caveat to make the page read better. Changing a grade requires a source; record it in `docs/research/mimicry-evidence.md`.
4. **Most physiology is from *Octopus vulgaris***, not this species. Say so (`basis: 'octopod-general'`).
5. Known open points: the ink sac is unconfirmed for this species; bipedal walking is not documented for it and is deliberately not animated; "15+ species" is a popular-media figure.

### Engine

1. **The engine never imports React, and React never touches Three.js objects.** They communicate only through the Zustand store (`src/stores/appStore.ts`). The two exceptions are `engine.getAnchorScreen` / `engine.onFrame` (hotspots) and `engine.renderThumbnail` (cards), reached through `src/features/viewer/engineHandle.ts`.
2. **`src/three/core/director.ts` is the only place that decides what the engine shows for a given app state.** Add new behaviour there, as a pure function of state, and test it.
3. **The octopus always has eight arms.** Poses are data (`PoseDefinition`); a mimicry target changes pose parameters, never the mesh topology. Hidden arms use `bury`, not removal.
4. **Everything the engine allocates must be disposed.** e2e test 12 asserts zero geometries and textures after `dispose()`.
5. No external assets, no network requests at runtime, no LLM or API dependency.

### Languages

The site ships in English (`en`, default and fallback), Vietnamese (`vi`) and Japanese (`ja`). Read `docs/i18n/localization-architecture.md` before touching text.

1. **No visitor-facing string in a component, in `src/data/` or in the engine.** Text lives in `src/i18n/locales/<locale>/*.json`. Static UI uses `t('key')`; content looked up by a data id uses `useContent()` (`src/i18n/content.ts`).
2. **Change all three locales together.** English is the source. `src/i18n/i18n.test.ts` fails on a missing key, a wrong plural form, a changed `{{variable}}` or a dropped Latin name.
3. **A translation carries the same claim at the same strength.** Hedges ("may", "believed", "unconfirmed") stay. Latin names, citations and DOIs are never translated. Use `docs/i18n/translation-glossary.md`.
4. **Switching language must only re-render text.** Do not key engine or store state on the locale, and do not put the locale in the Zustand store.
5. No translation service, no LLM API, at build time or run time.

### UI

1. One store, selectors per component. Do not put per-frame values in React state; write to the DOM from `engine.onFrame` instead (see `Hotspots.tsx`).
2. Each stage is a `<section id="stage-…" data-stage="…">`. The element marked `[data-viewport="main"]` tells the engine where to centre the animal; `[data-viewport="reference"]` is where the reference animal is drawn.
3. Elements over the canvas must not block dragging: keep `pointer-events: none` on layout wrappers.
4. Evidence is never conveyed by colour alone (letter + word + marker shape).
5. Controls need `data-testid`s; the e2e suite depends on them.

## Adding things

- **A mimicry target:** add `src/data/mimicry/targets/NN-name.ts`, register it in `src/data/mimicry/index.ts`, add a reference model in `src/three/models/reference/`, add the id to `REFERENCE_MODEL_IDS`, and add `targets.<id>` to `mimicry.json` in all three locales. The unit tests validate schema, pose validity, continuity and translation completeness.
- **An anatomy structure:** add it to `src/data/anatomy/structures.ts` with an anchor from `src/three/models/anatomy/anchors.ts`, and `structures.<id>` to `anatomy.json` in all three locales.
- **Any text:** see the recipes in `docs/i18n/translation-guidelines.md`.
- **A reference:** add it to `src/data/references/index.ts` with an honest `access` value.

## More detail

- `docs/ai/README.md` — task recipes and pitfalls
- `docs/technical/architecture.md`, `docs/technical/animation-system.md`
- `docs/qa/test-plan.md`
- `docs/i18n/` — localisation architecture, glossary, guidelines, testing (four short files; enough on their own for a text-only change)
- `docs/research/` — what the literature says and how it was read
