# MIMIC LAB — Visual Specification

## Mood

Natural-history museum, research instrument, underwater documentary. Dark, quiet, precise.
The animal is lit; the interface recedes.

## Colour tokens (`src/styles/tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--abyss` | `#020a13` | page base, deepest background |
| `--navy` | `#071b2c` | panels (with transparency and blur) |
| `--navy-2` | `#0d2a40` | raised surfaces, hover |
| `--teal` | `#1b6f78` | secondary accents, focus borders |
| `--cyan` | `#62e6e0` | bioluminescent accent: selection, active, links |
| `--ivory` | `#f1ead9` | primary text |
| `--ivory-dim` | `#a9b6bd` | secondary text |
| `--amber` | `#e6a756` | restrained accent: "conceptual" labels, evidence B |
| `--line` | `rgba(241,234,217,.14)` | hairlines |

Evidence grades never rely on colour alone: each chip shows the letter and a word
(A Documented / B Qualified / C Tentative) and a distinct fill (solid / half / outline).

## Typography

- Display: **Fraunces Variable** (serif) for titles and the numerals of the ten identities.
- Text and UI: **Manrope Variable**, body 16px / 1.55, never below 13px.
- Data and labels: **IBM Plex Mono** for evidence chips, metadata and small uppercase labels
  (letter-spaced, 11.5px minimum).
- Scientific names in italic.

All fonts are self-hosted through `@fontsource` (no third-party requests).

## Layout

- Fixed full-viewport canvas; content stages are `min-height: 100dvh` and transparent.
- Desktop (1100px and up): one docked panel on the right (400px) and a slim tool rail on the left.
  The camera's principal point is shifted so the animal is centred in the free area, not under the panel.
- Tablet (700–1099px): the panel narrows to 340px and the rail collapses to compact buttons.
- Mobile (below 700px): the viewer occupies roughly the top half; the panel becomes a scrollable bottom sheet.
- Hairlines and generous spacing; no drop-shadow cards and no gradients on interface chrome
  (gradients are reserved for the water).

## Motion

- UI: 180–320ms ease-out opacity and translate. No bounces.
- Camera: about 1.1s ease-in-out between presets.
- Organism: continuous breathing and arm drift; mimicry transitions take 7–10s and are staged.
- `prefers-reduced-motion`: UI transitions off, camera changes are instant, idle motion amplitude is reduced,
  auto-rotate is off. Transitions still play but can be paused and scrubbed.

## 3D look

- Water: exponential fog from deep teal to navy, marine-snow particles, soft caustics on sand and skin.
- Seabed: dark grey-brown silt with ripples (the species lives on silt and sand flats).
- Octopus: wet, slightly glossy skin; brown and white banding; fine chromatophore speckle; raised eyes with
  horizontal slit pupils and a papilla over each; pale suckers on the oral side of every arm.
- Internal organs: clean, colour-coded schematic solids (not gore). Labelled as schematic.
- Selection: cyan rim light on the selected structure; everything else is unchanged or ghosted.

## Avoid

Admin-dashboard grids, a Bootstrap look, heavy glassmorphism, emoji, cartoon shading, text over the animal.
