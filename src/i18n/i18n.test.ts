import { describe, expect, it } from 'vitest';
import { ANATOMY_STRUCTURES } from '@/data/anatomy/structures';
import { MECHANISMS } from '@/data/mechanisms';
import { LOCOMOTION_MODES } from '@/data/mechanisms/locomotion';
import { COMPARISON_ASPECTS, MIMICRY_CAVEATS, MIMICRY_TARGETS } from '@/data/mimicry';
import { REFERENCES } from '@/data/references';
import { SKIN_LAYERS_INFO } from '@/data/skin/layers';
import { LOAD_STEPS } from '@/types/app';
import { detectLocale, LOCALES, matchLocale, NAMESPACES, type Locale, type Messages } from './index';
import en from './locales/en';
import ja from './locales/ja';
import vi from './locales/vi';

const BUNDLES: Record<Locale, Messages> = { en, vi: vi as unknown as Messages, ja: ja as unknown as Messages };
const TRANSLATED: Locale[] = ['vi', 'ja'];

/** i18next plural suffixes. A key such as `some_one` / `some_other` counts as the single key `some`. */
const PLURAL = /_(zero|one|two|few|many|other)$/;

/** Flatten to `ns:path` → string. Arrays keep their index, so a missing item shows up as a missing key. */
function flatten(node: unknown, path: string, out: Map<string, string>): Map<string, string> {
  if (typeof node === 'string') out.set(path, node);
  else if (Array.isArray(node)) node.forEach((item, i) => flatten(item, `${path}[${i}]`, out));
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) flatten(value, path ? `${path}.${key}` : key, out);
  } else throw new Error(`unexpected value at ${path}: ${String(node)}`);
  return out;
}

function entries(locale: Locale): Map<string, string> {
  const out = new Map<string, string>();
  for (const ns of NAMESPACES) {
    for (const [path, value] of flatten(BUNDLES[locale][ns], '', new Map())) out.set(`${ns}:${path}`, value);
  }
  return out;
}

const placeholders = (text: string) => [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort();
const baseKey = (key: string) => key.replace(PLURAL, '');
const pluralForms = (locale: Locale) => new Intl.PluralRules(locale).resolvedOptions().pluralCategories;

describe('locale detection', () => {
  it('maps browser language tags to supported locales', () => {
    expect(matchLocale('vi-VN')).toBe('vi');
    expect(matchLocale('ja')).toBe('ja');
    expect(matchLocale('JA-jp')).toBe('ja');
    expect(matchLocale('fr-FR')).toBeUndefined();
    expect(matchLocale(undefined)).toBeUndefined();
  });

  it('lets a stored choice win, and falls back to English', () => {
    expect(detectLocale('ja', 'vi-VN')).toBe('ja');
    expect(detectLocale(null, 'vi-VN')).toBe('vi');
    expect(detectLocale(null, 'fr-FR')).toBe('en');
    expect(detectLocale('xx', 'en-US')).toBe('en');
    expect(detectLocale('xx', 'ja-JP')).toBe('ja');
  });
});

describe.each(TRANSLATED)('%s is a complete translation', (locale) => {
  const source = entries('en');
  const target = entries(locale);

  it('has every English key and no extra ones', () => {
    const want = new Set([...source.keys()].map(baseKey));
    const have = new Set([...target.keys()].map(baseKey));
    expect([...want].filter((k) => !have.has(k)), 'missing keys').toEqual([]);
    expect([...have].filter((k) => !want.has(k)), 'unknown keys').toEqual([]);
  });

  it('has exactly the plural forms its language needs', () => {
    const forms = pluralForms(locale);
    const pluralKeys = new Set([...source.keys()].filter((k) => PLURAL.test(k)).map(baseKey));
    for (const key of pluralKeys) {
      for (const form of forms) expect(target.has(`${key}_${form}`), `${key}_${form}`).toBe(true);
    }
    for (const key of target.keys()) {
      const form = key.match(PLURAL)?.[1];
      if (form) expect(forms, key).toContain(form);
    }
  });

  it('has no empty strings', () => {
    for (const [key, value] of target) expect(value.length, key).toBeGreaterThan(0);
  });

  it('keeps every interpolation variable', () => {
    const bySource = new Map<string, string[]>();
    for (const [key, value] of source) bySource.set(baseKey(key), placeholders(value));
    for (const [key, value] of target) expect(placeholders(value), key).toEqual(bySource.get(baseKey(key)));
  });

  it('keeps scientific names, citations and numbers that English states', () => {
    const latin = /Thaumoctopus mimicus|Octopus vulgaris|Wunderpus photogenicus|Zebrias|Pterois|Laticauda|Megalactis|Bothus/g;
    for (const [key, value] of source) {
      const other = target.get(key);
      if (other === undefined) continue;
      for (const name of new Set(value.match(latin) ?? [])) expect(other, `${key} should keep "${name}"`).toContain(name);
    }
  });

  it('does not leave long passages untranslated', () => {
    // Identical text is only acceptable for names, codes and symbols.
    const same = [...target].filter(([key, value]) => source.get(key) === value && value.length > 28).map(([key]) => key);
    const allowed = /^(scientific:credits\.items\.(three|tooling|fonts)\.name)$/;
    expect(same.filter((k) => !allowed.test(k))).toEqual([]);
  });

  it('uses its own script', () => {
    const text = [...target.values()].join(' ');
    if (locale === 'ja') expect(text).toMatch(/[぀-ヿ]/);
    if (locale === 'vi') expect(text).toMatch(/[ăâđêôơưĂÂĐÊÔƠƯ]/);
    const prose = target.get('home:lead') ?? '';
    if (locale === 'ja') expect(prose).toMatch(/[぀-ゟ]/);
    if (locale === 'vi') expect(prose).toMatch(/[Ạ-ỹ]/);
  });
});

describe.each(LOCALES)('%s covers every piece of content the data refers to', (locale) => {
  const m = BUNDLES[locale];

  it('anatomy structures and skin layers', () => {
    expect(Object.keys(m.anatomy.structures).sort()).toEqual(ANATOMY_STRUCTURES.map((s) => s.id).sort());
    expect(Object.keys(m.anatomy.skinLayers).sort()).toEqual(SKIN_LAYERS_INFO.map((l) => l.id).sort());
  });

  it('mechanisms, their steps and locomotion modes', () => {
    const items = m.mechanisms.items as Record<string, { steps: Record<string, unknown>; points: string[] }>;
    expect(Object.keys(items).sort()).toEqual(MECHANISMS.map((x) => x.id).sort());
    for (const mechanism of MECHANISMS) {
      expect(Object.keys(items[mechanism.id].steps).sort(), mechanism.id).toEqual(mechanism.steps.map((s) => s.id).sort());
      expect(items[mechanism.id].points.length, mechanism.id).toBeGreaterThan(2);
    }
    expect(Object.keys(m.mechanisms.locomotion.modes).sort()).toEqual(LOCOMOTION_MODES.map((x) => x.id).sort());
    expect(m.mechanisms.armRig.names.length).toBe(8);
  });

  it('the ten identities, with all five comparison rows', () => {
    const targets = m.mimicry.targets as Record<string, { comparison: Record<string, unknown> }>;
    expect(Object.keys(targets).sort()).toEqual(MIMICRY_TARGETS.map((t) => t.id).sort());
    for (const t of MIMICRY_TARGETS) expect(Object.keys(targets[t.id].comparison).sort(), t.id).toEqual([...COMPARISON_ASPECTS].sort());
    expect(Object.keys(m.mimicry.caveats).sort()).toEqual(MIMICRY_CAVEATS.map((c) => c.id).sort());
  });

  it('reference kinds and access levels, and loading steps', () => {
    for (const r of REFERENCES) {
      expect(m.scientific.references.kinds).toHaveProperty([r.kind]);
      expect(m.scientific.references.access).toHaveProperty([r.access]);
    }
    expect(Object.keys(m.common.loading.steps).sort()).toEqual([...LOAD_STEPS].sort());
  });
});
