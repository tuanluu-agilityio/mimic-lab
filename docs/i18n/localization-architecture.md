# Localisation architecture

Three locales: `en` (default, fallback), `vi`, `ja`. Library: `i18next` + `react-i18next`. No language detection plugin, no backend plugin, no network service.

## Files

```
src/i18n/
  index.ts          init, locale detection, setLocale, document metadata
  content.ts        useContent(): typed access to id-driven content
  fonts-ja.ts       Japanese typefaces (loaded with the ja locale only)
  i18next.d.ts      types t() keys from the English files
  i18n.test.ts      completeness tests (run by `npm run test`)
  locales/<locale>/
    index.ts        aggregates the seven JSON files
    common.json     shared UI: loading, quality, camera, playback, fallback, meta
    navigation.json nav links, language switcher label
    home.json       intro stage
    anatomy.json    anatomy stage UI + structures.<id> + skinLayers.<id>
    mechanisms.json lab UI + items.<id> + locomotion + diagrams + arm rig
    mimicry.json    identities UI + targets.<id> + caveats + phases + aspects
    scientific.json evidence grades, reconstruction labels, sources stage
src/components/LanguageSwitcher.tsx
```

## Where text lives

**All visitor-facing text is in the locale JSON files.** `src/data/` holds structure only: ids, evidence grades, `basis`, references, poses, cameras, and Latin scientific names (`scientificName`, never translated). The engine holds no text: it reports ids (`playback.phaseId`, `loadStep`) and the interface translates them.

There is no text inside WebGL. Anatomy markers are DOM buttons positioned from engine anchors (`Hotspots.tsx`); they re-label when the language changes and keep their anchors.

## Reading text in components

- Static UI string: `const { t } = useTranslation('anatomy'); t('fields.function')`. Keys are type-checked against `locales/en`.
- A second namespace: `useTranslation(['anatomy', 'common'])`, then `t('common:aboutModel')`.
- Content looked up by a data id: `useContent().structure(id)`, `.skinLayer(id)`, `.mechanism(id)`, `.locomotion(id)`, `.target(id)`. Each returns one typed object. Do not build keys from ids by hand.
- Variables: `t('stepOf', { current, total, title })` with `{{current}}` in the JSON.
- Plurals: i18next suffixes. English needs `key_one` and `key_other`; Vietnamese and Japanese need only `key_other`. Call `t('key', { count })`.

## Loading and persistence

1. `main.tsx` awaits `initI18n()` before the first render.
2. Locale = stored choice (`localStorage['mimic-lab.locale']`) → else browser language if it is `vi*` or `ja*` → else `en`.
3. English is in the main bundle. `vi` and `ja` are separate chunks, fetched once on demand. Because the wanted locale is loaded before render, the page never paints English first.
4. `setLocale(locale)` loads the chunk if needed, calls `i18n.changeLanguage`, stores the choice. Only text re-renders. The Zustand store and the engine are not touched, so stage, selection, view mode, camera and a running transformation all carry on.
5. On every change `<html lang>`, `<title>`, meta description and Open Graph title/description/locale are updated.

A missing key falls back to English and logs `[i18n] missing key …` in development. `i18n.test.ts` fails the build if any locale is incomplete, so that fallback should never be reached in production.

## URLs and SEO

One URL for all languages; the locale is not in the path. For that reason there are no `hreflang` links: they would have nothing distinct to point at. If per-locale URLs are ever added, add `hreflang` then.

## Fonts

| Script | Display | Text | Labels |
| --- | --- | --- | --- |
| Latin, Vietnamese | Fraunces | Manrope | IBM Plex Mono |
| Japanese | Noto Serif JP | Noto Sans JP | Noto Sans JP |

All three Latin faces ship a Vietnamese subset, selected automatically by `unicode-range`. The Japanese faces sit later in the same font stacks (`src/styles/tokens.css`); their CSS is imported only by the `ja` chunk, and the browser then downloads only the unicode-range slices a page uses. Japanese-specific rules (`line-break: strict`, no synthesised italics, looser line height) are in `src/styles/global.css` under `:lang(ja)`.

## Layout rules that exist because of translation

- Phones (≤ 600 px): two-row navigation; `--nav-h` is 84 px there.
- Mechanism tabs: number above label in the narrow docked panel (700–1099 px).
- Lists of names are joined with `common:listSeparator` (`, ` or `、`).
