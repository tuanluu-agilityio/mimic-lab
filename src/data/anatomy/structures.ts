import type { ViewMode } from '@/types/app';

export type AnatomySystem =
  | 'integument'
  | 'nervous'
  | 'circulatory'
  | 'respiratory'
  | 'digestive'
  | 'locomotor'
  | 'sensory'
  | 'defence';

/**
 * Structure of the content only. All visitor-facing text (name, summary, function, relations,
 * detail, approximation note) lives in `src/i18n/locales/<locale>/anatomy.json` under
 * `structures.<id>`.
 */
export interface AnatomyStructure {
  id: string;
  group: 'external' | 'internal';
  system: AnatomySystem;
  /**
   * 'species' = stated for Thaumoctopus mimicus in the literature;
   * 'octopod-general' = generalised from better-studied octopuses (mostly Octopus vulgaris).
   */
  basis: 'species' | 'octopod-general';
  references: string[];
  /** Engine anchor id (see src/three/models/anatomy/anchors.ts). */
  anchor: string;
  /** View mode that shows this structure best. */
  preferredMode?: ViewMode;
}

export const ANATOMY_STRUCTURES: AnatomyStructure[] = [
  {
    id: 'mantle',
    group: 'external',
    system: 'locomotor',
    basis: 'species',
    references: ['norman2005', 'sajikumar2020', 'wells1978'],
    anchor: 'mantle',
  },
  {
    id: 'head',
    group: 'external',
    system: 'nervous',
    basis: 'octopod-general',
    references: ['young1971', 'wells1978'],
    anchor: 'head',
  },
  {
    id: 'eyes',
    group: 'external',
    system: 'sensory',
    basis: 'octopod-general',
    references: ['messenger1977', 'hanlon2018'],
    anchor: 'eyes',
  },
  {
    id: 'arms',
    group: 'external',
    system: 'locomotor',
    basis: 'species',
    references: ['norman2001', 'norman2005', 'huffard2010', 'young1963'],
    anchor: 'arms',
  },
  {
    id: 'web',
    group: 'external',
    system: 'locomotor',
    basis: 'octopod-general',
    references: ['hanlon2008', 'hanlon2018'],
    anchor: 'web',
  },
  {
    id: 'suckers',
    group: 'external',
    system: 'sensory',
    basis: 'octopod-general',
    references: ['kier2002', 'vangiesen2020', 'norman2005'],
    anchor: 'suckers',
  },
  {
    id: 'funnel',
    group: 'external',
    system: 'locomotor',
    basis: 'octopod-general',
    references: ['wells1978', 'hanlon2018'],
    anchor: 'funnel',
  },
  {
    id: 'skin',
    group: 'external',
    system: 'integument',
    basis: 'species',
    references: ['norman2005', 'huffard2010', 'hochberg2006', 'messenger2001'],
    anchor: 'skin',
    preferredMode: 'skin',
  },
  {
    id: 'brain',
    group: 'internal',
    system: 'nervous',
    basis: 'octopod-general',
    references: ['young1963', 'young1971', 'hochner2012'],
    anchor: 'brain',
    preferredMode: 'xray',
  },
  {
    id: 'optic-lobes',
    group: 'internal',
    system: 'nervous',
    basis: 'octopod-general',
    references: ['young1963', 'young1971'],
    anchor: 'optic-lobes',
    preferredMode: 'xray',
  },
  {
    id: 'nervous-system',
    group: 'internal',
    system: 'nervous',
    basis: 'octopod-general',
    references: ['young1963', 'sumbre2001', 'gutnick2011', 'gutnick2020', 'zullo2009'],
    anchor: 'nervous-system',
    preferredMode: 'neural',
  },
  {
    id: 'gills',
    group: 'internal',
    system: 'respiratory',
    basis: 'octopod-general',
    references: ['wells1987', 'wells1978'],
    anchor: 'gills',
    preferredMode: 'xray',
  },
  {
    id: 'hearts',
    group: 'internal',
    system: 'circulatory',
    basis: 'octopod-general',
    references: ['wells1987', 'wells1978'],
    anchor: 'hearts',
    preferredMode: 'xray',
  },
  {
    id: 'digestive-system',
    group: 'internal',
    system: 'digestive',
    basis: 'octopod-general',
    references: ['wells1978', 'hanlon2008'],
    anchor: 'digestive-system',
    preferredMode: 'xray',
  },
  {
    id: 'beak',
    group: 'internal',
    system: 'digestive',
    basis: 'octopod-general',
    references: ['wells1978', 'hanlon2018'],
    anchor: 'beak',
    preferredMode: 'isolated',
  },
  {
    id: 'radula',
    group: 'internal',
    system: 'digestive',
    basis: 'octopod-general',
    references: ['wells1978'],
    anchor: 'radula',
    preferredMode: 'isolated',
  },
  {
    id: 'ink-sac',
    group: 'internal',
    system: 'defence',
    basis: 'octopod-general',
    references: ['norman2005', 'hanlon2018'],
    anchor: 'ink-sac',
    preferredMode: 'xray',
  },
];

const BY_ID = new Map(ANATOMY_STRUCTURES.map((s) => [s.id, s]));

export function getStructure(id: string | null | undefined): AnatomyStructure | undefined {
  return id ? BY_ID.get(id) : undefined;
}
