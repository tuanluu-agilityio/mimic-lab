import type { MechanismId } from '@/types/app';

export type DiagramId = 'arm-section' | 'chromatophore' | 'neuron-share';

export interface MechanismStep {
  id: string;
  /** For the skin mechanism: neural drive applied to the skin model at this step (0..1). */
  activation?: number;
}

/**
 * Structure of the five mechanisms. All visitor-facing text (title, lead, step text, key points,
 * misconception, basis note) lives in `src/i18n/locales/<locale>/mechanisms.json` under
 * `items.<id>`; step text is keyed by the step ids listed here.
 */
export interface Mechanism {
  id: MechanismId;
  number: number;
  /** Ordered steps of the 3D demonstration. Empty when the demonstration is free-form. */
  steps: MechanismStep[];
  diagram?: DiagramId;
  references: string[];
}

export const MECHANISMS: Mechanism[] = [
  {
    id: 'nervous',
    number: 1,
    steps: [{ id: 'stimulus' }, { id: 'optic' }, { id: 'brain' }, { id: 'commands' }, { id: 'local' }, { id: 'feedback' }],
    diagram: 'neuron-share',
    references: ['young1963', 'sumbre2001', 'zullo2009', 'gutnick2011', 'gutnick2020', 'hochner2012'],
  },
  {
    id: 'skin',
    number: 2,
    steps: [
      { id: 'rest', activation: 0.03 },
      { id: 'signal', activation: 0.32 },
      { id: 'expand', activation: 1 },
      { id: 'pigment', activation: 1 },
      { id: 'pattern', activation: 1 },
    ],
    diagram: 'chromatophore',
    references: ['messenger2001', 'froesch1978', 'mathger2009', 'huffard2010', 'xu2025'],
  },
  {
    id: 'arms',
    number: 3,
    steps: [],
    diagram: 'arm-section',
    references: ['kier1985', 'kier2007', 'kier2002'],
  },
  {
    id: 'locomotion',
    number: 4,
    steps: [],
    references: ['norman2001', 'hanlon2008', 'huffard2010', 'wells1978'],
  },
  {
    id: 'mimicry',
    number: 5,
    steps: [],
    references: ['norman2001', 'hanlon2008', 'huffard2010'],
  },
];

export function getMechanism(id: MechanismId): Mechanism {
  return MECHANISMS.find((m) => m.id === id) ?? MECHANISMS[0];
}
