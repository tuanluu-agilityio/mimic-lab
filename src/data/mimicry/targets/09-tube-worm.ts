import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

/** Arms raised out of the burrow in this reconstruction (L1 and R1). */
const RAISED = [0, 1];

export const tubeWorm: MimicryTarget = {
  id: 'tube-worm',
  order: 9,
  evidenceLevel: 'B',
  reconstruction: 'partly-documented',
  references: ['hanlon2008'],
  pose: {
    body: makeBody({ height: -0.28, mantlePitch: -0.5, mantleLength: 0.9, eyeRaise: 0.1, webSpread: 0.05, burrow: 1 }),
    arms: makeArms((i, side, pair) =>
      RAISED.includes(i)
        ? {
            yaw: side * 0.05,
            pitch0: 1.5,
            pitch1: 1.42,
            bend: side * 0.25,
            coil: 0,
            curl: -0.15,
            length: 0.34,
            waveAxis: 0.5,
            waveAmp: 0.025,
            waveFreq: 0.6,
            waveSpeed: 0.12,
            wavePhase: side,
          }
        : {
            pitch0: -1.25,
            pitch1: -1.45,
            bend: side * 0.4,
            coil: side * (1.2 + pair * 0.3),
            length: 0.44,
            bury: 1,
            waveAmp: 0.01,
            waveSpeed: 0.05,
          },
    ),
    skin: makeSkin({
      dark: [0.16, 0.14, 0.11],
      light: [0.5, 0.46, 0.38],
      bandContrast: 0.1,
      mottle: 0.6,
      pale: 0.25,
      texture: 0.7,
    }),
    movement: makeMovement({ bobAmp: 0, swayAmp: 0, travel: 0 }),
  },
  involvedArms: RAISED,
  transitionSequence: makeSequence(9.5, { arms: [0.18, 0.58], body: [0.3, 0.7] }),
  camera: { azimuth: 0.55, polar: 1.25, distance: 5.2, targetY: 0.6 },
  referenceModel: 'tube-worm',
};
