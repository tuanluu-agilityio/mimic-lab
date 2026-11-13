# Translation guidelines

English (`src/i18n/locales/en/`) is the source. Write or change English first, then Vietnamese and Japanese in the same change. A change that leaves a locale behind fails `npm run test`.

## Science comes first

1. **Same claim, same strength.** "may", "believed", "it is possible", "not reported", "unconfirmed", "about", "roughly" must survive with equal force. Do not turn "may impersonate" into "impersonates", or "not confirmed" into "absent".
2. **Do not add or drop facts.** No explanatory extras that the English does not state; they would be unsourced.
3. **Keep the mechanism exact.** "Radial muscles pull the sac open" must not become "the pigment spreads".
4. **Never translate Latin names**, citations or DOIs. Common names may be localised; where English shows a Latin name, the translation shows it too.
5. **Model notes stay.** "About this model", `approximation`, `limitations` and evidence text are content, not decoration.
6. Use `docs/i18n/translation-glossary.md`. Give the English term in parentheses on first mention in a card when the local term is rare.

## Style

**Vietnamese.** Natural textbook register, not word for word. Sentence case for labels. Quotation marks “ ”. Vietnamese term first, English in parentheses where it helps.

**Japanese.** です・ます体 for prose, noun phrases for labels. Full-width 、。「」（）, no spaces between Japanese words, half-width digits and Latin. Prefer the established zoological term over katakana. Standard 和名 for animals.

## Keys

- Namespaces: `common`, `navigation`, `home`, `anatomy`, `mechanisms`, `mimicry`, `scientific`.
- `camelCase` keys, nested by purpose: `fields.function`, `sliders.cuttingPlane`.
- Content is keyed by the **data id**: `structures.<id>`, `skinLayers.<id>`, `items.<mechanismId>.steps.<stepId>`, `locomotion.modes.<id>`, `targets.<id>`, `caveats.<id>`.
- Variables are `{{name}}` and must be identical in every locale.
- Plurals: `key_one` / `key_other` in English; only `key_other` in Vietnamese and Japanese.
- Optional keys (`caution`, `context`, `modelNote`) must be present in all locales or in none.

## Length

Translated labels must fit their controls; do not shrink fonts to make them fit.

| Slot | Limit |
| --- | --- |
| nav `short` | about 9 Latin characters / 4 Japanese |
| camera `short` | 1–2 Latin characters / 1 kanji, all distinct |
| mode bar label, mechanism `short` tab | one or two short words |
| `meta.description` | about 170 Latin characters / 110 Japanese |

## Recipes

**New UI string.** Add the key to the right namespace in all three locales; use `t('key')`.

**New anatomical structure or label.** Add the structure to `src/data/anatomy/structures.ts` (id, anchor, references, `basis`). Add `structures.<id>` with `name`, `summary`, `func`, `relations`, `deeper`, `approximation` to `anatomy.json` in all three locales. The list button, the card and the 3D marker all read `name` from there.

**New mimicry target.** Add the data file and register it (see `AGENTS.md`). Put the Latin name, if any, in `scientificName` in the data. Add `targets.<id>` to `mimicry.json` in all three locales: `name`, optional `modelNote`, `tagline`, `evidenceDescription`, `reconstructionNote`, `mechanism`, optional `context`, `comparison` (five aspects, each `model` and `octopus`), `limitations`, `referenceCaption`.

**New locale.** Add it to `LOCALES`, `LOCALE_NAMES`, `OG_LOCALES` and `loaders` in `src/i18n/index.ts`; copy `locales/en` and translate; add it to `BUNDLES` and `TRANSLATED` in `i18n.test.ts`; check the fonts cover its script.

## Do not

- Use a paid translation service or an LLM API at build or run time.
- Put visitor-facing strings in components or in `src/data/`.
- Concatenate translated fragments into sentences; use one key with variables.
