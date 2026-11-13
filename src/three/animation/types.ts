/**
 * Pose data model. Everything here is plain numbers so that poses can be stored as data,
 * blended, snapshotted and unit-tested without a renderer.
 *
 * Coordinate frame ("rig space"): Y is up, the sand surface is y = 0, the animal faces +Z,
 * the animal's left is +X. Angles are radians.
 */

export const ARM_COUNT = 8;

/** Arm index order. Pair 1 is the front (dorsal) pair, pair 4 the rear (ventral) pair. */
export const ARM_NAMES = ['L1', 'R1', 'L2', 'R2', 'L3', 'R3', 'L4', 'R4'] as const;
export type ArmName = (typeof ARM_NAMES)[number];

export interface ArmPose {
  /** Heading of the arm in the animal frame. 0 = forward (+Z), positive = toward the animal's left (+X). */
  yaw: number;
  /** Pitch where the arm leaves the body (positive = up). */
  pitch0: number;
  /** Pitch at the tip. */
  pitch1: number;
  /** Exponent shaping where along the arm the pitch change happens (1 = evenly, <1 = near the base). */
  pitchBias: number;
  /** Total lateral turn spread evenly along the arm. */
  bend: number;
  /** Extra vertical curl concentrated near the tip (positive = tip curls upward). */
  curl: number;
  /** Extra lateral curl concentrated near the tip (a flat spiral lying on the sand). */
  coil: number;
  /** Extension factor (1 = relaxed length). Volume is preserved: radius scales by 1/sqrt(length). */
  length: number;
  /** 0 = arm stays on or above the sand, 1 = arm may lie fully below the sand surface. */
  bury: number;
  /** Travelling-wave amplitude (radians of heading change). */
  waveAmp: number;
  /** Number of waves along the arm. */
  waveFreq: number;
  /** Wave cycles per second (base → tip). */
  waveSpeed: number;
  /** Phase offset in radians. */
  wavePhase: number;
  /** 0 = lateral (side-to-side) wave, 1 = vertical wave. */
  waveAxis: number;
}

export interface BodyPose {
  /** Head centre height above the sand. Negative = sunk into a burrow. */
  height: number;
  /** 0 = mantle trails horizontally behind the head, positive = raised. */
  mantlePitch: number;
  /** Scale factors relative to the resting mantle. */
  mantleLength: number;
  mantleWidth: number;
  mantleHeight: number;
  /** Head tilt (positive = looking up). */
  headPitch: number;
  /** 0..1 how far the eyes are raised on their stalks. */
  eyeRaise: number;
  /** 0..1 how far the web between the arm bases is spread. */
  webSpread: number;
  /** 0..1 visibility of the burrow mouth under the animal. */
  burrow: number;
}

export type RGB = [number, number, number];

export interface SkinPattern {
  /** Linear-space RGB of the dark (expanded chromatophore) colour. */
  dark: RGB;
  /** Linear-space RGB of the pale background colour. */
  light: RGB;
  /** Bands per arm length. */
  bandFreq: number;
  /** 0 = uniform, 1 = full dark/light banding. */
  bandContrast: number;
  /** 0 = soft-edged bands, 1 = crisp bands. */
  bandSharpness: number;
  /** 0..1 irregular blotching. */
  mottle: number;
  /** 0..1 overall blanching toward the light colour. */
  pale: number;
  /** 0..1 skin papillae (bump) strength. */
  texture: number;
}

export interface MovementParams {
  /** Vertical bobbing of the whole body. */
  bobAmp: number;
  bobFreq: number;
  /** Body yaw oscillation. */
  swayAmp: number;
  swayFreq: number;
  /** Body roll oscillation (uses the sway clock). */
  rollAmp: number;
  /** Mantle pulsing beyond normal breathing. */
  pulseAmp: number;
  pulseFreq: number;
  /** Seabed treadmill speed in units/s (positive = the animal travels forward). */
  travel: number;
}

export interface PoseDefinition {
  body: BodyPose;
  arms: ArmPose[];
  skin: SkinPattern;
  movement: MovementParams;
}

/** Independent blend channels of a transition. `prep` is a 0→1→0 anticipation pulse. */
export type Channel = 'prep' | 'arms' | 'body' | 'skin' | 'movement';
export const BLEND_CHANNELS = ['arms', 'body', 'skin', 'movement'] as const;
export type BlendChannel = (typeof BLEND_CHANNELS)[number];
export type ChannelWeights = Record<Channel, number>;

export type PhaseId = 'rest' | 'prepare' | 'arms' | 'body' | 'skin' | 'movement' | 'final';

export interface TransitionPhase {
  id: PhaseId;
  label: string;
  /** Normalised start and end (0..1) within the sequence. Phases may overlap. */
  start: number;
  end: number;
  /** The channel this phase drives, if any. */
  channel?: Channel;
}

export interface TransitionSequence {
  /** Seconds at 1× speed. */
  duration: number;
  phases: TransitionPhase[];
}

export interface Vec3Like {
  x: number;
  y: number;
  z: number;
}
