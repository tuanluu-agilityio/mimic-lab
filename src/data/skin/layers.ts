import type { SkinLayer } from '@/types/app';

export interface SkinLayerInfo {
  id: Exclude<SkinLayer, 'all'>;
  name: string;
  summary: string;
  detail: string;
  /** Can the animal change this layer's appearance on demand? */
  control: string;
  references: string[];
}

/** Layers of the magnified skin model, from the surface inward. Generalised from other cephalopods. */
export const SKIN_LAYERS_INFO: SkinLayerInfo[] = [
  {
    id: 'epidermis',
    name: 'Epidermis',
    summary: 'The thin, transparent outer layer.',
    detail: 'It protects the tissue beneath and lets light pass to and from the colour layers. It contains mucus-secreting cells.',
    control: 'Not involved in colour change.',
    references: ['messenger2001'],
  },
  {
    id: 'chromatophores',
    name: 'Chromatophores',
    summary: 'Organs, not single cells: an elastic sac of pigment ringed by radial muscles, each wired to a nerve from the brain.',
    detail:
      'At rest the sac is a tiny dot and the skin looks pale. When the nerve fires, the radial muscles contract and pull the sac out into a flat disc many times wider, spreading the pigment so it shows. When the muscles relax the sac springs back. Octopus chromatophores come in yellow, orange, red, brown and black.',
    control: 'Direct nerve and muscle control. A change takes a fraction of a second.',
    references: ['messenger2001', 'froesch1978'],
  },
  {
    id: 'iridophores',
    name: 'Iridophores',
    summary: 'Cells containing stacks of thin reflective platelets.',
    detail:
      'They produce colour by interference of light between the platelets, giving metallic blues, greens and golds that shift with the viewing angle. No pigment is involved.',
    control:
      'In octopuses these are generally regarded as passive reflectors. Actively tunable iridescence has been shown in some squid, not in octopuses.',
    references: ['mathger2009'],
  },
  {
    id: 'leucophores',
    name: 'Leucophores',
    summary: 'Cells that scatter all wavelengths of light equally, so they look white.',
    detail:
      'They form the pale base on which the chromatophores work. Because they reflect whatever light falls on them, white areas take on the general colour of the surrounding light.',
    control: 'Passive. They are revealed when the chromatophores above them contract.',
    references: ['froesch1978', 'mathger2009'],
  },
  {
    id: 'dermis',
    name: 'Dermis and muscle',
    summary: 'Connective tissue and muscle beneath the colour layers.',
    detail:
      'Muscles in the dermis raise papillae: bumps and spikes that change the skin’s texture from smooth to rough within a second or two.',
    control: 'Papillae are under nervous control.',
    references: ['allen2014'],
  },
];

export const SKIN_MODEL_NOTE =
  'A schematic block, not to scale. Layer order and cell types are generalised from other cephalopods, mainly the common octopus; the skin of the mimic octopus has not been studied at this level.';
