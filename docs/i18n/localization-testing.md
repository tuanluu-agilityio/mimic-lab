# Localisation testing

```bash
npm run test                              # includes src/i18n/i18n.test.ts
npm run build && npx playwright test e2e/i18n.spec.ts
npm run verify                            # everything
```

## Unit: `src/i18n/i18n.test.ts`

For `vi` and `ja` against `en`:

- every key present, no extra keys (arrays compared item by item);
- exactly the plural forms the language needs (`Intl.PluralRules`);
- no empty strings;
- identical `{{variables}}` in every string;
- Latin scientific names in an English string also appear in its translation;
- no string longer than 28 characters identical to English (untranslated text), except credit names;
- the text is actually in its own script.

For all three locales against the data: every structure, skin layer, mechanism, step, locomotion mode, identity, comparison row, caveat, reference kind, access level and loading step has text.

Locale detection (`detectLocale`, `matchLocale`) is unit-tested too.

## Browser: `e2e/i18n.spec.ts`

| Test | Checks |
| --- | --- |
| L1 | English default; switcher in the top-right of the nav; labels `EN`, `VI`, `日本語`; active state; keyboard activation |
| L2 | All six switch directions; no reload; same engine object; no GPU geometry rebuilt; `<html lang>`, title, description and stored choice follow |
| L3 | Switching in X-ray with a structure selected keeps selection, mode and camera; the 3D marker is re-labelled |
| L4 | Switching during a transformation in comparison mode: same target, still playing, progress never goes back |
| L5 (vi, ja) | Choice survives reload; the nav never shows English text first |
| L6 (vi, ja) | Whole site walk-through: seven view modes, five mechanisms, ten identities, sources; no raw keys or `{{…}}`; tabs fit; no clipped buttons; no horizontal overflow; Latin names and DOIs intact |
| L7 (vi, ja) `@mobile` | Pixel 7: no horizontal overflow on any stage; nav link and switcher reachable; switching keeps the stage |
| L8 | First visit follows browser language for `vi-VN` and `ja-JP`; `fr-FR` gets English |
| L9 | Noto Sans JP actually loads for Japanese; Manrope covers Vietnamese text |

`e2e/app.spec.ts` (the original acceptance suite) runs in English and must keep passing unchanged.

## By eye

`scripts/shot.mjs` takes a locale:

```bash
LOCALE=ja STEPS='[{"name":"anatomy","scrollTo":"stage-anatomy","wait":3000}]' \
  node scripts/shot.mjs ./shots http://localhost:5173/            # add --mobile or --tablet
```

Look for: clipped diacritics on capitals (Ế, Ỗ), Japanese lines breaking before 。or 、, labels wrapping inside pills, tabs or nav links scrolling out of view, filmstrip card names.

## Not automated

- Translation quality and terminology: no native-speaking biologist has reviewed either language (see the glossary).
- Screen-reader pronunciation in Vietnamese and Japanese.
- Browsers other than Chromium; real phones.
