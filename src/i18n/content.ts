import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ComparisonAspect } from '@/data/mimicry/types';
import type en from './locales/en';

/**
 * Typed access to id-driven scientific content. Static interface strings use `t('key')`
 * directly; content that is looked up by a data id (a structure, a mechanism, an identity)
 * is read here as one object, so components never build translation keys by hand.
 */

export interface StructureText {
  name: string;
  summary: string;
  func: string;
  relations: string;
  deeper: string;
  approximation: string;
}

export interface SkinLayerText {
  name: string;
  summary: string;
  detail: string;
  control: string;
}

export interface MechanismText {
  title: string;
  lead: string;
  steps: Record<string, { title: string; text: string }>;
  points: string[];
  caution?: { claim: string; correction: string };
  basisNote: string;
}

export interface LocomotionText {
  name: string;
  summary: string;
}

export interface TargetText {
  name: string;
  /** Qualifier shown after the Latin name of the proposed model, e.g. "(suggested)". */
  modelNote?: string;
  tagline: string;
  evidenceDescription: string;
  reconstructionNote: string;
  mechanism: string;
  /** Where and when it has been seen, if reported. */
  context?: string;
  comparison: Record<ComparisonAspect, { model: string; octopus: string }>;
  limitations: string;
  referenceCaption: string;
}

/** Compile-time proof that the English source has the shapes declared above. */
type Conforms<T extends U, U> = T;
export type ContentShapeCheck = [
  Conforms<(typeof en)['anatomy']['structures'], Record<string, StructureText>>,
  Conforms<(typeof en)['anatomy']['skinLayers'], Record<string, SkinLayerText>>,
  Conforms<(typeof en)['mechanisms']['items'], Record<string, MechanismText>>,
  Conforms<(typeof en)['mechanisms']['locomotion']['modes'], Record<string, LocomotionText>>,
  Conforms<(typeof en)['mimicry']['targets'], Record<string, TargetText>>,
];

export interface Content {
  structure(id: string): StructureText;
  skinLayer(id: string): SkinLayerText;
  mechanism(id: string): MechanismText;
  locomotion(id: string): LocomotionText;
  target(id: string): TargetText;
}

/** Content in the active language. The returned object changes identity when the language does. */
export function useContent(): Content {
  const { t } = useTranslation();
  return useMemo(() => {
    const read = t as unknown as (key: string, options: { returnObjects: true }) => unknown;
    const get = <T>(key: string) => read(key, { returnObjects: true }) as T;
    return {
      structure: (id) => get<StructureText>(`anatomy:structures.${id}`),
      skinLayer: (id) => get<SkinLayerText>(`anatomy:skinLayers.${id}`),
      mechanism: (id) => get<MechanismText>(`mechanisms:items.${id}`),
      locomotion: (id) => get<LocomotionText>(`mechanisms:locomotion.modes.${id}`),
      target: (id) => get<TargetText>(`mimicry:targets.${id}`),
    };
  }, [t]);
}
