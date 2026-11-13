import {
  ARM_COUNT,
  type ArmPose,
  type BodyPose,
  type ChannelWeights,
  type MovementParams,
  type PoseDefinition,
  type SkinPattern,
} from './types';

const ARM_KEYS: (keyof ArmPose)[] = [
  'yaw',
  'pitch0',
  'pitch1',
  'pitchBias',
  'bend',
  'curl',
  'coil',
  'length',
  'bury',
  'waveAmp',
  'waveFreq',
  'waveSpeed',
  'wavePhase',
  'waveAxis',
];
const BODY_KEYS: (keyof BodyPose)[] = [
  'height',
  'mantlePitch',
  'mantleLength',
  'mantleWidth',
  'mantleHeight',
  'headPitch',
  'eyeRaise',
  'webSpread',
  'burrow',
];
const SKIN_SCALAR_KEYS = ['bandFreq', 'bandContrast', 'bandSharpness', 'mottle', 'pale', 'texture'] as const;
const MOVE_KEYS: (keyof MovementParams)[] = [
  'bobAmp',
  'bobFreq',
  'swayAmp',
  'swayFreq',
  'rollAmp',
  'pulseAmp',
  'pulseFreq',
  'travel',
];

export function clonePose(p: PoseDefinition): PoseDefinition {
  return {
    body: { ...p.body },
    arms: p.arms.map((a) => ({ ...a })),
    skin: { ...p.skin, dark: [...p.skin.dark], light: [...p.skin.light] },
    movement: { ...p.movement },
  };
}

export function copyPose(out: PoseDefinition, p: PoseDefinition): PoseDefinition {
  Object.assign(out.body, p.body);
  for (let i = 0; i < ARM_COUNT; i++) Object.assign(out.arms[i], p.arms[i]);
  const { dark, light, ...rest } = p.skin;
  Object.assign(out.skin, rest);
  for (let k = 0; k < 3; k++) {
    out.skin.dark[k] = dark[k];
    out.skin.light[k] = light[k];
  }
  Object.assign(out.movement, p.movement);
  return out;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function blendArm(out: ArmPose, a: ArmPose, b: ArmPose, t: number) {
  for (const k of ARM_KEYS) out[k] = lerp(a[k], b[k], t);
}
function blendBody(out: BodyPose, a: BodyPose, b: BodyPose, t: number) {
  for (const k of BODY_KEYS) out[k] = lerp(a[k], b[k], t);
}
function blendSkin(out: SkinPattern, a: SkinPattern, b: SkinPattern, t: number) {
  for (const k of SKIN_SCALAR_KEYS) out[k] = lerp(a[k], b[k], t);
  for (let i = 0; i < 3; i++) {
    out.dark[i] = lerp(a.dark[i], b.dark[i], t);
    out.light[i] = lerp(a.light[i], b.light[i], t);
  }
}
function blendMovement(out: MovementParams, a: MovementParams, b: MovementParams, t: number) {
  for (const k of MOVE_KEYS) out[k] = lerp(a[k], b[k], t);
}

/**
 * Blend pose `a` toward pose `b` with an independent weight per channel, writing into `out`.
 * `weights.prep` is not used here (see PoseController.applyPreparation).
 */
export function blendPose(
  out: PoseDefinition,
  a: PoseDefinition,
  b: PoseDefinition,
  weights: Pick<ChannelWeights, 'arms' | 'body' | 'skin' | 'movement'>,
): PoseDefinition {
  for (let i = 0; i < ARM_COUNT; i++) blendArm(out.arms[i], a.arms[i], b.arms[i], weights.arms);
  blendBody(out.body, a.body, b.body, weights.body);
  blendSkin(out.skin, a.skin, b.skin, weights.skin);
  blendMovement(out.movement, a.movement, b.movement, weights.movement);
  return out;
}

/** Largest absolute difference between any two corresponding numeric parameters of two poses. */
export function poseDistance(a: PoseDefinition, b: PoseDefinition): number {
  let d = 0;
  for (let i = 0; i < ARM_COUNT; i++) for (const k of ARM_KEYS) d = Math.max(d, Math.abs(a.arms[i][k] - b.arms[i][k]));
  for (const k of BODY_KEYS) d = Math.max(d, Math.abs(a.body[k] - b.body[k]));
  for (const k of SKIN_SCALAR_KEYS) d = Math.max(d, Math.abs(a.skin[k] - b.skin[k]));
  for (let i = 0; i < 3; i++) {
    d = Math.max(d, Math.abs(a.skin.dark[i] - b.skin.dark[i]), Math.abs(a.skin.light[i] - b.skin.light[i]));
  }
  for (const k of MOVE_KEYS) d = Math.max(d, Math.abs(a.movement[k] - b.movement[k]));
  return d;
}

/** True when every numeric value in the pose is finite and there are exactly eight arms. */
export function isValidPose(p: PoseDefinition): boolean {
  if (p.arms.length !== ARM_COUNT) return false;
  for (const arm of p.arms) for (const k of ARM_KEYS) if (!Number.isFinite(arm[k])) return false;
  for (const k of BODY_KEYS) if (!Number.isFinite(p.body[k])) return false;
  for (const k of SKIN_SCALAR_KEYS) if (!Number.isFinite(p.skin[k])) return false;
  for (const k of MOVE_KEYS) if (!Number.isFinite(p.movement[k])) return false;
  return p.skin.dark.length === 3 && p.skin.light.length === 3;
}
