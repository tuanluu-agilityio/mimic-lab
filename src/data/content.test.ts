import { describe, expect, it } from 'vitest';
import { ANATOMY_STRUCTURES } from '@/data/anatomy/structures';
import { MECHANISMS } from '@/data/mechanisms';
import { MIMICRY_CAVEATS } from '@/data/mimicry';
import { hasReference, REFERENCES } from '@/data/references';
import type { MechanismText, StructureText } from '@/i18n/content';
import en from '@/i18n/locales/en';
import { SKIN_LAYERS_INFO } from '@/data/skin/layers';
import { INTERNAL_STRUCTURE_IDS } from '@/stores/appStore';
import { ANCHOR_IDS } from '@/three/models/anatomy/anchors';
import { MECHANISM_IDS, SKIN_LAYERS } from '@/types/app';

// Text is checked against the English source; `src/i18n/i18n.test.ts` holds the other locales to it.
const STRUCTURE_TEXT: Record<string, StructureText> = en.anatomy.structures;
const MECHANISM_TEXT: Record<string, MechanismText> = en.mechanisms.items;

const REQUIRED = [
  'mantle', 'head', 'eyes', 'arms', 'web', 'suckers', 'funnel', 'skin',
  'brain', 'optic-lobes', 'nervous-system', 'gills', 'hearts', 'digestive-system', 'beak', 'radula', 'ink-sac',
];

describe('anatomy content', () => {
  it('covers every required structure exactly once', () => {
    expect(ANATOMY_STRUCTURES.map((s) => s.id).sort()).toEqual([...REQUIRED].sort());
  });

  it.each(ANATOMY_STRUCTURES.map((s) => [s.id, s] as const))('%s is complete', (_id, s) => {
    const t = STRUCTURE_TEXT[s.id];
    for (const text of [t.summary, t.func, t.relations, t.deeper, t.approximation]) expect(text.length).toBeGreaterThan(15);
    expect(s.references.length).toBeGreaterThan(0);
    for (const r of s.references) expect(hasReference(r), `unknown reference ${r}`).toBe(true);
    expect(ANCHOR_IDS as readonly string[]).toContain(s.anchor);
    expect(INTERNAL_STRUCTURE_IDS.has(s.id)).toBe(s.group === 'internal');
  });

  it('labels everything inside the body as generalised from other octopuses', () => {
    for (const s of ANATOMY_STRUCTURES) if (s.group === 'internal') expect(s.basis).toBe('octopod-general');
  });
});

describe('mechanism content', () => {
  it('has the five mechanisms in order', () => {
    expect(MECHANISMS.map((m) => m.id)).toEqual([...MECHANISM_IDS]);
    expect(MECHANISMS.map((m) => m.number)).toEqual([1, 2, 3, 4, 5]);
  });

  it('cites known references and never calls an arm a brain', () => {
    for (const m of MECHANISMS) {
      for (const r of m.references) expect(hasReference(r), `unknown reference ${r}`).toBe(true);
      expect(MECHANISM_TEXT[m.id].basisNote.length).toBeGreaterThan(10);
    }
    expect(MECHANISM_TEXT.nervous.caution?.correction).toMatch(/not separate brains/);
  });

  it('the skin sequence has the five required steps with rising activation', () => {
    const steps = MECHANISMS[1].steps;
    expect(steps.length).toBe(5);
    expect(steps[0].activation).toBeLessThan(steps[1].activation!);
    expect(steps[1].activation).toBeLessThan(steps[2].activation!);
  });
});

describe('other content', () => {
  it('skin layers match the selectable layers', () => {
    expect(SKIN_LAYERS_INFO.map((l) => l.id)).toEqual(SKIN_LAYERS.filter((l) => l !== 'all'));
    for (const l of SKIN_LAYERS_INFO) for (const r of l.references) expect(hasReference(r)).toBe(true);
  });

  it('references have unique ids and caveats cite them', () => {
    expect(new Set(REFERENCES.map((r) => r.id)).size).toBe(REFERENCES.length);
    for (const c of MIMICRY_CAVEATS) for (const r of c.references) expect(hasReference(r)).toBe(true);
  });
});
