# Test plan and results

## How to run

```bash
npm run verify     # typecheck → unit tests → build → browser tests
```

Browser tests need Chromium once: `npx playwright install chromium`.

## Layers

| Layer | Tool | Files | What it covers |
| --- | --- | --- | --- |
| Types | `tsc --noEmit` (strict) | whole project | |
| Unit | Vitest | `src/three/animation/animation.test.ts`, `src/three/core/quality.test.ts`, `src/stores/appStore.test.ts`, `src/data/mimicry/mimicry.test.ts`, `src/data/content.test.ts`, `src/i18n/i18n.test.ts` | pose maths, arm curve, transitions, controller, quality stepping, store rules, content schema and citation integrity, continuity of all ten transitions, translation completeness (see `docs/i18n/localization-testing.md`) |
| Browser | Playwright, Chromium with software WebGL | `e2e/app.spec.ts` (English acceptance suite), `e2e/i18n.spec.ts` (L1–L9, three languages) | the built site, desktop 1440×900 and Pixel 7 |
| Visual | screenshots via `scripts/shot.mjs`, reviewed by eye | not stored in the repo | layout and rendering |

## Acceptance criteria (functional-spec §9)

| # | Criterion | Checked by | Result |
| --- | --- | --- | --- |
| 1 | One route; five stages reachable by scroll and nav | e2e "1 · five stages…" | pass |
| 2 | Eight arms, finite geometry, every pose, every sampled time | unit (animation, mimicry) + e2e "7–8 · all ten targets…" | pass |
| 3 | No frame-to-frame jump above threshold in any transition | unit (mimicry continuity) | pass |
| 4 | Six camera presets move the camera; orbit and zoom work | e2e "4 · camera…" (six distinct views, zoom button, drag, Ctrl+wheel) | pass |
| 5 | Each anatomy structure updates card and engine highlight | e2e "5 · every anatomy structure…" (17 structures) | pass |
| 6 | Each of seven view modes changes engine render state | e2e "6 · each view mode…" | pass |
| 7 | Ten targets with valid schema, grade, references, limitations | unit (mimicry, content) | pass |
| 8 | Targets play to completion; pause, replay, reset | e2e "7–8" and "8 · pause freezes…" (also scrub/seek) | pass |
| 9 | Comparison mode renders two viewports | e2e "9 · comparison…" | pass |
| 10 | Mobile: no horizontal overflow; tap selection and playback | e2e "10 · mobile… @mobile" | pass |
| 11 | No-WebGL fallback shows content | e2e "11 · without WebGL…" (`?nowebgl=1`) | pass |
| 12 | Dispose releases geometries and textures | e2e "12 · disposing…" (both counts 0) | pass |

An extra browser test covers the mechanism lab (tabs, six-step nervous demo, skin, arm rig, locomotion, mimicry channel switches).

## Last full run

13 November 2026, Windows 11, Node 24.20, Chromium (Playwright 1.65) with SwiftShader.

- `tsc --noEmit`: clean
- Vitest: 6 files, 107 tests, all passed
- `vite build`: succeeded
- Playwright: 23 tests (20 desktop, 3 mobile), all passed, 11.4 minutes

Time limits are generous on purpose (240 s per test, 15 s per assertion). With the earlier 90 s / 5 s limits, two full runs on a busy machine each had four time-outs in different tests; each of those tests passed when run alone. The suite is sensitive to CPU load because WebGL is rendered in software.

## Localisation

Tests L1–L9 and the unit checks are described in `docs/i18n/localization-testing.md`. Screenshots in Vietnamese and Japanese were inspected for the intro, anatomy, mechanism lab and Ten Identities at 1440×900, and for a subset at phone and tablet size (Vietnamese: intro and mechanisms on a phone, mechanisms on a tablet; Japanese: Ten Identities on a phone).

Found and fixed: the scene intermittently rendered black in development only, because React StrictMode created two renderers on one canvas (`Viewer.tsx` now queues engine starts); Vietnamese nav links and mechanism tabs overflowed on phones and in the docked tablet panel.

## Visual review

Screenshots of every stage were inspected at 1440×900 and at Pixel 7 size: intro, anatomy (normal, X-ray with a structure selected, skin block), mechanism lab, the Ten Identities overview, four finished transformations (flatfish, lionfish, sea snake, jellyfish), comparison mode, and Sources.

Found and fixed during review:

- The scene rendered black when the engine started at medium quality (phone-sized viewports). Shader programs are now rebuilt after the first compile.
- The tenth identity card was cut off at 1440 px; cards now all fit.
- Reference thumbnails were framed too loosely to read; the camera was moved closer.
- On phones the quality selector covered the last nav link.
- Panel tabs scrolled out of reach; only the panel body scrolls now.

## Not covered

- **Real GPUs and real phones.** Everything automated ran on a software renderer at about 10–15 fps. Frame rate, automatic quality stepping at 60 fps, and touch gestures (pinch zoom, two-finger behaviour) on physical devices have not been tested.
- **Browsers other than Chromium.** Firefox and Safari were not run.
- **Screen readers.** Roles, labels and live regions are in place and keyboard operation was exercised, but no screen-reader session was carried out, and there is no automated accessibility audit.
- **Six of the ten final poses** (stingray, snake eel, sponge, tunicate, tube-worm tube, anemone) were verified by the automated checks but their finished poses were not individually inspected in screenshots after the last changes.
- **Hotspot occlusion.** Markers are not hidden when their structure is behind the body.
- **Translation review.** Vietnamese and Japanese were not reviewed by a native-speaking biologist; several terms are descriptive coinages (marked † in `docs/i18n/translation-glossary.md`).
- **Localised screens not inspected by eye:** the Sources stage in Vietnamese and Japanese, and the Japanese tablet layout (both are covered by the automated overflow checks). On phones, Japanese identity card names can break mid-word.
- **Scientific review.** Content was written from the literature listed in `docs/research/`, several items of which were read only as abstracts. No specialist has reviewed it.
