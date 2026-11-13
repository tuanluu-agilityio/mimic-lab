# Working on MIMIC LAB with an AI coding agent

The binding rules are in `/AGENTS.md`. This page adds recipes and pitfalls. It applies equally to Claude Code, Codex, Gemini CLI, Copilot and Cursor; nothing here depends on a particular tool, plugin or skill.

## Orientation, in reading order

1. `README.md`
2. `docs/technical/architecture.md`
3. `src/stores/appStore.ts` — the whole shared state in one file
4. `src/three/core/director.ts` — what each state means on screen
5. `docs/technical/animation-system.md` if you will touch poses
6. `docs/research/` if you will touch content

## Recipes

### Change what a stage shows

Edit `direct()` in `src/three/core/director.ts`. Do not add stage checks inside `Engine.ts`.

### Add a control

1. Add state and an action to `appStore.ts` (add a store test).
2. Read it in the engine through a `sub(...)` subscription or in `step()`.
3. Render the control in the feature folder with a `data-testid`.
4. Expose what it changes through `engine.debug()` and assert it in `e2e/app.spec.ts`. A test that only checks the button's pressed state does not prove the 3D changed.

### Add or change scientific content

1. Find the source. Add it to `src/data/references/index.ts` with the true `access` level.
2. Write the content in `src/data/…` citing the reference id.
3. Mark the basis: this species, or generalised from other octopuses.
4. If it changes an evidence grade or a caveat, update `docs/research/mimicry-evidence.md` with the reasoning.

### Debug the 3D in a browser

In the console: `__MIMIC__.debug()` returns the engine's state; `__MIMIC__.store.getState()` is the store. `scripts/shot.mjs` drives a headless browser and saves screenshots:

```bash
STEPS='[{"name":"skin","scrollTo":"stage-anatomy","state":{"viewMode":"skin"},"wait":2500}]' \
  node scripts/shot.mjs ./shots http://localhost:5173/
```

Add `--mobile` for a phone viewport. `?nowebgl=1` forces the no-WebGL fallback.

## Pitfalls met while building this

- **Headless Chromium uses a software renderer** (about 10–15 fps). Automatic quality will step down during tests. Poll engine state with `expect.poll`; do not assume a transition finishes in its nominal duration.
- **Engine started below the top quality tier rendered black** until shader programs were rebuilt. `Engine.refreshMaterials()` after the first compile fixes it. If you change lights or shadows at start-up, check a phone-sized viewport.
- **Wrappers over the canvas swallow drags.** `ui.viewport > *` re-enables pointer events; layout-only children must set `pointer-events: none` again.
- **Only the panel body scrolls.** Headers and tabs are fixed inside the panel, so they are always reachable.
- **Test ids repeat across stages** (camera buttons). Scope locators to the stage: `page.locator('#stage-anatomy').getByTestId('cam-front')`.
- **A stage taller than the window** (Sources) is detected by how much of the window it covers, not by its own intersection ratio.
- **Thumbnails read pixels back from the GPU** and are rendered once, lazily, the first time the Ten Identities stage is visited.

## What not to do

- Do not add an LLM/API dependency, analytics, or remote assets.
- Do not import third-party 3D models or textures without a licence that allows redistribution and a credit in the Sources stage.
- Do not remove limitation or evidence text to tidy the interface.
- Do not claim a check passed without running it. `docs/qa/test-plan.md` records real results; update it when they change.
