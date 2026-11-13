# Design notes

The full visual specification is `docs/specs/visual-spec.md`. This page records what was actually built and why.

## Idea

A night dive over open sand. The animal is always on screen; the interface is instrumentation laid over the water, not a page with a 3D widget in it.

## Tokens (`src/styles/tokens.css`)

| Role | Value |
| --- | --- |
| Background | abyss `#020a13`, navy `#071b2c` |
| Text | ivory `#f1ead9`, dimmed `#a9b6bd` |
| Interactive / selected | cyan `#62e6e0` |
| Caution, uncertainty, current phase | amber `#e6a756` |
| Lowest evidence grade | rose `#e58a7b` |

Typefaces: Fraunces (display), Manrope (text), IBM Plex Mono (labels, data). All self-hosted.

Amber is reserved for uncertainty and for "about this model" notes, so a visitor learns that amber means "read this with care".

## Layout

- One scrolling page, five full-height stages, proximity scroll snapping.
- Desktop: tool rail (camera) on the left, free viewer area, docked panel on the right. The engine centres the animal in the free area.
- Phone (under 700 px): viewer on top, panel as a bottom sheet; rails and mode bars become horizontal strips.
- Panels: heading and tabs stay put, only the body scrolls.

## Evidence chip

Letter, word and marker shape together: A = filled dot, B = half-filled, C = outline. Colour reinforces but is never the only signal.

## Motion

Interface transitions are 180–320 ms. Camera moves are tweened. With `prefers-reduced-motion`, scrolling and camera moves are instant and idle motion is reduced; the transformation animations still play because they are the content, and they can be paused and scrubbed.

## Not done

- No audio (the brief's `public/audio` folder is reserved).
- No light theme.
- The octopus skin tone is on the grey-brown side; a warmer brown-and-white would match published photographs better.
