import type { PoseDefinition, TransitionSequence } from '@/three/animation/types';
import type { EvidenceLevel, ReferenceModelId } from '@/types/app';

/**
 * How much of the animation is taken from published descriptions.
 * - documented: posture and movement are described in the literature
 * - partly-documented: some elements are described; the rest is filled in
 * - conceptual: an illustrative reconstruction, not an observed behaviour
 */
export type ReconstructionLevel = 'documented' | 'partly-documented' | 'conceptual';

/** Rows of the model-versus-octopus comparison table, in display order. */
export const COMPARISON_ASPECTS = ['silhouette', 'posture', 'colour', 'movement', 'anatomy'] as const;
export type ComparisonAspect = (typeof COMPARISON_ASPECTS)[number];

/**
 * Structure of one identity. All visitor-facing text (name, proposed model species, tagline,
 * evidence description, reconstruction note, mechanism, context, comparison rows, limitations,
 * reference caption) lives in `src/i18n/locales/<locale>/mimicry.json` under `targets.<id>`.
 */
export interface MimicryTarget {
  id: string;
  /** 1..10 */
  order: number;
  /**
   * Latin name of the proposed model, only where the literature names a species or genus.
   * Never translated; a translatable qualifier may follow it (`modelNote` in mimicry.json).
   */
  scientificName?: string;
  evidenceLevel: EvidenceLevel;
  reconstruction: ReconstructionLevel;
  references: string[];

  /** bodyConfiguration + armConfiguration + skinPattern + movementParameters. */
  pose: PoseDefinition;
  /** Arm indices (0..7 = L1,R1,L2,R2,L3,R3,L4,R4) highlighted during the arm phase. */
  involvedArms: number[];
  transitionSequence: TransitionSequence;
  camera: { azimuth: number; polar: number; distance: number; targetY: number };

  referenceModel: ReferenceModelId;
}
