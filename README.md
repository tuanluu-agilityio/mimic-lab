# MIMIC LAB

**One Organism. Ten Identities. Infinite Possibilities.**

A single-page educational site about the mimic octopus, *Thaumoctopus mimicus*, built around an interactive, procedural 3D model:

- **Anatomy explorer** — 17 structures, seven view modes (normal, X-ray, exploded, section, isolate, nerves, magnified skin).
- **Mechanism lab** — nervous system, skin coloration, arm movement, locomotion and the components of mimicry.
- **Ten identities** — ten reported resemblances, each with an evidence grade (A/B/C), a staged transformation, a reference animal and a side-by-side comparison.
- **Sources and limitations** — the bibliography, how each source was read, and what the model is not.

The site runs entirely in the browser. It needs no API keys, no LLM service and no network access after load.

## Run it

Requires Node 20+ (developed on Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm run preview` | Serve `dist/` on port 4173 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright; needs `npm run build` first and `npx playwright install chromium` once) |
| `npm run verify` | typecheck → unit tests → build → browser tests |

## Stack

React 19, TypeScript, Vite, Three.js (used directly, without a React renderer), Zustand, CSS Modules, Vitest, Playwright. Fonts are self-hosted through Fontsource.

## Where things are

```
src/
  three/          3D engine (no React)
    animation/    pose types, arm curve, transitions, PoseController
    core/         Engine, CameraRig, director (app state → what to show), quality tiers
    models/       procedural octopus, organs, skin block, reference animals
    materials/    patched standard materials and shaders
  data/           all educational content: anatomy, mechanisms, mimicry targets, references
  stores/         single Zustand store shared by UI and engine
  features/       one folder per stage (intro, anatomy, mechanisms, mimicry, sources) + viewer, camera
  components/     shared UI pieces
e2e/              Playwright specs
docs/             research notes, specs, architecture, test plan, agent guides
```

Start with `docs/technical/architecture.md`. If you are an AI coding agent, read `AGENTS.md`.

## Scientific integrity

- Every statement in `src/data/` cites entries in `src/data/references/`. Tests fail if a citation id does not exist.
- Each mimicry target has an evidence grade and a note on how much of its animation follows published descriptions. Only the flatfish and the sea-snake display are grade A. The stingray and snake eel are grade C: no peer-reviewed description was found, and their animations are labelled conceptual.
- Several key papers could only be read as abstracts. `docs/research/scientific-references.md` records how each source was accessed, and the Sources section of the site shows it to visitors.
- The 3D model is procedural and schematic. Internal anatomy is generalised from other octopus species. Whether this species has an ink sac is unconfirmed; the site says so.

## Licences

All 3D models, shaders, diagrams and animations are generated in code for this project. There are no third-party models, textures, photographs or audio. Libraries are MIT-licensed; fonts are under the SIL Open Font License.
