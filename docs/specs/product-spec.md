# MIMIC LAB — Product Specification

Status: written from the project brief, which delegates design decisions to the builder.
Calls made by the builder (not dictated by the brief) are marked **[builder call]**.
Date: 2026-11-13

## 1. Intent

A single-page, immersive educational website about one species: *Thaumoctopus mimicus*, the mimic octopus.
The visitor explores one living-looking 3D animal: its outside, its inside, how its body works, and how the
same body impersonates other animals. Tagline: **"One Organism. Ten Identities. Infinite Possibilities."**

Why: popular coverage of this animal is full of exaggeration ("shape-shifter", "each arm has a brain",
"fifteen species"). The site should be more interesting than the myth *by being accurate*: it shows the
mechanism, and it shows how strong the evidence is for each claim.

## 2. Audience

Curious general public, students and educators. Desktop first; phone and tablet fully usable.

## 3. Goals

1. The 3D organism is the product. It is on screen in every section and everything else explains it.
2. Internal anatomy can be revealed, isolated, sectioned and exploded interactively.
3. Five biological mechanisms are explained with synchronised 3D animation.
4. Ten mimicry targets can be triggered; each is a staged, smooth transition of the *same* rig.
5. Every mimicry target carries a visible evidence grade (A/B/C) and its references.
6. Works without any network service, API key or downloaded 3D asset.
7. Another AI agent can extend it (new mimicry target, new organ) from the docs alone.

## 4. Non-goals

- No routing, CMS, accounts, analytics or backend.
- No runtime LLM integration (the architecture leaves room for an optional assistant later).
- Not a scanned-specimen-accurate model; not a physics simulation of soft tissue.
- No audio in the MVP (`public/audio` is reserved).

## 5. Anti-goals (would make it a failure even if it "works")

- Presenting a conceptual animation as an observed behaviour.
- Presenting ten equally certain mimicries.
- Any instant morph / shape-shift effect, or arms that vanish without explanation.
- A cartoon octopus, or a dashboard-looking UI that buries the animal under panels.
- Buttons that exist but do nothing.

## 6. Approaches considered

| | Approach | Trade-off | Verdict |
|---|---|---|---|
| A | **Procedural octopus generated in code**: arms as parametric curves, body as a deformable lofted tube, instanced suckers, patched PBR skin shader; every pose is a set of numbers | Not sculpt-quality; realism is limited by procedural shading. But one rig truly supports ten poses, eight arms are always accounted for, there is no asset licensing, the download is tiny and the rig is unit-testable | **Chosen** |
| B | Licensed or sculpted glTF octopus with a skeletal rig | Best static realism, but no suitably licensed *T. mimicus* model is available, generic rigs have too few arm bones for the snake and flatfish poses, and ten baked clips means ten assets | Rejected |
| C | Pre-rendered video or turntables per behaviour | Looks great but is not interactive, which violates the core requirement | Rejected |

Rendering stack **[builder call]**: React 19 + TypeScript + Vite for the shell; **plain Three.js** for the scene
(an imperative `Engine` class) rather than React Three Fiber. Reason: the whole scene is per-frame procedural
geometry driven by one animation loop. R3F would put a reconciler between the store and that loop without
simplifying anything, and an imperative engine is easier to unit-test and to dispose. Zustand is the bridge:
React writes state, the engine subscribes. CSS Modules for styling. Vitest + Playwright for tests.

## 7. Experience outline (one page, five scroll stages)

| Stage | What the visitor does | What the octopus does |
|---|---|---|
| A. Introduction | Reads the title, picks a CTA | Rests on a silty seabed, breathing; slow cinematic orbit |
| B. Anatomy Explorer | Orbits, picks structures, switches the 7 view modes | Holds a neutral display posture; skin and organs respond to the mode |
| C. Mechanism Lab | Steps through 5 mechanisms | Runs the matching demonstration |
| D. The Ten Identities | Picks a target, plays / pauses / scrubs, opens comparison | Performs the staged transition; a reference animal is shown alongside |
| E. Sources and method | Reads references, the evidence scale and the model limitations | Rendering paused |

A persistent fixed WebGL canvas sits behind the scrolling content.

## 8. Scientific integrity rules (binding on content and code)

1. Each mimicry target has `evidenceLevel` A/B/C, an `evidenceDescription`, `references` and `limitations`.
2. Each animation has a `reconstruction` flag: `documented` (posture and movement described in the
   literature) or `conceptual` (illustrative). Conceptual ones are labelled on screen.
3. Anatomy generalised from other octopus species is labelled as such per structure (`basis` field).
4. Copy never says the octopus "becomes" or "transforms into" another animal.
5. The 3D model is described everywhere as a procedural approximation.
6. Research lives in `docs/research/`; content in `src/data/` cites reference ids from `src/data/references`.

## 9. Success criteria

The acceptance checklist in the project brief (section 16), verified by `npm run verify` plus browser
inspection. See `docs/qa/test-plan.md`.
