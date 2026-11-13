import type { SkinLayer } from '@/types/app';

export interface SkinLayerInfo {
  id: Exclude<SkinLayer, 'all'>;
  references: string[];
}

/**
 * Layers of the magnified skin model, from the surface inward. Generalised from other cephalopods.
 * Text lives in `src/i18n/locales/<locale>/anatomy.json` under `skinLayers.<id>`.
 */
export const SKIN_LAYERS_INFO: SkinLayerInfo[] = [
  {
    id: 'epidermis',
    references: ['messenger2001'],
  },
  {
    id: 'chromatophores',
    references: ['messenger2001', 'froesch1978'],
  },
  {
    id: 'iridophores',
    references: ['mathger2009'],
  },
  {
    id: 'leucophores',
    references: ['froesch1978', 'mathger2009'],
  },
  {
    id: 'dermis',
    references: ['allen2014'],
  },
];
