import { ARM_COUNT, type ArmPose, type BodyPose, type MovementParams, type PoseDefinition, type SkinPattern } from './types';

const DEG = Math.PI / 180;

/** Heading at which each arm leaves the arm crown. Left arms positive, right arms negative. */
export const ARM_HOME_YAW: readonly number[] = [22.5, -22.5, 67.5, -67.5, 112.5, -112.5, 157.5, -157.5].map(
  (d) => d * DEG,
);

/** +1 for left arms, -1 for right arms. Useful for mirrored pose definitions. */
export const ARM_SIDE: readonly number[] = [1, -1, 1, -1, 1, -1, 1, -1];

export function makeArm(partial: Partial<ArmPose> = {}): ArmPose {
  return {
    yaw: 0,
    pitch0: -0.35,
    pitch1: 0,
    pitchBias: 0.5,
    bend: 0,
    curl: 0,
    coil: 0,
    length: 1,
    bury: 0,
    waveAmp: 0,
    waveFreq: 1,
    waveSpeed: 0,
    wavePhase: 0,
    waveAxis: 0,
    ...partial,
  };
}

export function makeBody(partial: Partial<BodyPose> = {}): BodyPose {
  return {
    height: 0.34,
    mantlePitch: 0.28,
    mantleLength: 1,
    mantleWidth: 1,
    mantleHeight: 1,
    headPitch: 0,
    eyeRaise: 0.55,
    webSpread: 0.5,
    burrow: 0,
    ...partial,
  };
}

/** Colours are linear RGB. The resting animal is drab brown with soft pale banding. */
export function makeSkin(partial: Partial<SkinPattern> = {}): SkinPattern {
  return {
    dark: [0.085, 0.034, 0.014],
    light: [0.5, 0.36, 0.2],
    bandFreq: 11,
    bandContrast: 0.5,
    bandSharpness: 0.35,
    mottle: 0.45,
    pale: 0.1,
    texture: 0.45,
    ...partial,
  };
}

export function makeMovement(partial: Partial<MovementParams> = {}): MovementParams {
  return {
    bobAmp: 0.008,
    bobFreq: 0.22,
    swayAmp: 0.012,
    swayFreq: 0.11,
    rollAmp: 0,
    pulseAmp: 0,
    pulseFreq: 0.3,
    travel: 0,
    ...partial,
  };
}

/**
 * Build eight arm poses from a per-arm function.
 * `side` is +1 (left) / -1 (right); `pair` is 0..3 (front to rear); `home` is the arm's home heading.
 */
export function makeArms(fn: (index: number, side: number, pair: number, home: number) => Partial<ArmPose>): ArmPose[] {
  const arms: ArmPose[] = [];
  for (let i = 0; i < ARM_COUNT; i++) {
    const side = ARM_SIDE[i];
    const pair = i >> 1;
    arms.push(makeArm({ yaw: ARM_HOME_YAW[i], ...fn(i, side, pair, ARM_HOME_YAW[i]) }));
  }
  return arms;
}

// Slight hand-tuned asymmetry so the resting animal does not look mirrored.
const REST_BEND = [0.75, -0.55, 1.05, -1.25, -0.7, 0.95, 0.6, -0.85];
const REST_COIL = [2.6, -2.1, -1.7, 2.9, 2.2, -2.5, -1.9, 2.3];
const REST_LEN = [0.86, 0.9, 0.82, 0.8, 0.84, 0.78, 0.74, 0.76];

/** The resting, sitting posture: arms loosely radiating on the sand with gently coiled tips. */
export const REST_POSE: PoseDefinition = {
  body: makeBody(),
  arms: makeArms((i) => ({
    pitch0: -0.42,
    pitch1: 0,
    pitchBias: 0.35,
    bend: REST_BEND[i],
    coil: REST_COIL[i],
    curl: 0.25,
    length: REST_LEN[i],
    waveAmp: 0.3,
    waveFreq: 1.15,
    waveSpeed: 0.035 + (i % 3) * 0.012,
    wavePhase: i * 1.7,
    waveAxis: 0.15,
  })),
  skin: makeSkin(),
  movement: makeMovement(),
};
