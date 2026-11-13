export const STAGES = ['intro', 'anatomy', 'mechanisms', 'mimicry', 'sources'] as const;
export type Stage = (typeof STAGES)[number];

export const VIEW_MODES = ['normal', 'xray', 'exploded', 'section', 'isolated', 'neural', 'skin'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export const QUALITY_LEVELS = ['high', 'medium', 'low'] as const;
export type QualityLevel = (typeof QUALITY_LEVELS)[number];
export type QualitySetting = 'auto' | QualityLevel;

export const SKIN_LAYERS = ['all', 'epidermis', 'chromatophores', 'iridophores', 'leucophores', 'dermis'] as const;
export type SkinLayer = (typeof SKIN_LAYERS)[number];

export const CAMERA_PRESETS = ['reset', 'front', 'side', 'top', 'bottom', 'rear'] as const;
export type CameraPresetName = (typeof CAMERA_PRESETS)[number];

export const MECHANISM_IDS = ['nervous', 'skin', 'arms', 'locomotion', 'mimicry'] as const;
export type MechanismId = (typeof MECHANISM_IDS)[number];

export const REFERENCE_MODEL_IDS = [
  'flatfish',
  'lionfish',
  'sea-snake',
  'stingray',
  'snake-eel',
  'jellyfish',
  'sponge',
  'tunicate',
  'tube-worm',
  'anemone',
] as const;
export type ReferenceModelId = (typeof REFERENCE_MODEL_IDS)[number];

export const LOAD_STEPS = ['prepare', 'engine', 'environment', 'octopus', 'organs', 'skin', 'shaders'] as const;
export type LoadStep = (typeof LOAD_STEPS)[number];

export type EvidenceLevel = 'A' | 'B' | 'C';

export interface ArmControl {
  /** Arm index 0..7. */
  arm: number;
  /** Extension factor 0.4..1.2. */
  extend: number;
  /** Lift (pitch) in radians. */
  lift: number;
  /** Sweep relative to the arm's home heading, radians. */
  sweep: number;
  /** Tip curl, radians. */
  curl: number;
}

export interface MimicryChannelToggles {
  arms: boolean;
  body: boolean;
  skin: boolean;
  movement: boolean;
}
