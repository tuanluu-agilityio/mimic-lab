import type { PoseDefinition, TransitionSequence } from '@/three/animation/types';
import type { EvidenceLevel, ReferenceModelId } from '@/types/app';

/**
 * How much of the animation is taken from published descriptions.
 * - documented: posture and movement are described in the literature
 * - partly-documented: some elements are described; the rest is filled in
 * - conceptual: an illustrative reconstruction, not an observed behaviour
 */
export type ReconstructionLevel = 'documented' | 'partly-documented' | 'conceptual';

export interface ComparisonRow {
  aspect: 'Silhouette' | 'Body posture' | 'Colour pattern' | 'Movement' | 'Anatomy';
  model: string;
  octopus: string;
}

export interface MimicryTarget {
  id: string;
  /** 1..10 */
  order: number;
  name: string;
  /** Only where the literature names a model species or genus. */
  scientificName?: string;
  /** One-line card text. */
  tagline: string;
  evidenceLevel: EvidenceLevel;
  evidenceDescription: string;
  reconstruction: ReconstructionLevel;
  /** What exactly is and is not taken from the literature in this animation. */
  reconstructionNote: string;
  references: string[];

  /** bodyConfiguration + armConfiguration + skinPattern + movementParameters. */
  pose: PoseDefinition;
  /** Arm indices (0..7 = L1,R1,L2,R2,L3,R3,L4,R4) highlighted during the arm phase. */
  involvedArms: number[];
  transitionSequence: TransitionSequence;
  camera: { azimuth: number; polar: number; distance: number; targetY: number };

  educationalContent: {
    /** How the resemblance is produced, in terms of ordinary octopus abilities. */
    mechanism: string;
    /** Where and when it has been seen, if reported. */
    context?: string;
    comparison: ComparisonRow[];
  };
  limitations: string;
  referenceModel: ReferenceModelId;
  /** Caption for the reference model. */
  referenceCaption: string;
}

export const EVIDENCE_LABELS: Record<EvidenceLevel, { word: string; description: string }> = {
  A: {
    word: 'Documented',
    description: 'Directly observed and described in peer-reviewed literature, with the posture and movement recorded.',
  },
  B: {
    word: 'Qualified',
    description:
      'Reported in the scientific literature, but with reservations: few observations, cautious wording by the authors, or little descriptive detail.',
  },
  C: {
    word: 'Tentative',
    description: 'Popular or anecdotal claim. No peer-reviewed description was found during research for this project.',
  },
};

export const RECONSTRUCTION_LABELS: Record<ReconstructionLevel, string> = {
  documented: 'Animation follows published descriptions',
  'partly-documented': 'Animation partly reconstructed',
  conceptual: 'Conceptual reconstruction',
};
