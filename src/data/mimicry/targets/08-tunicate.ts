import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const tunicate: MimicryTarget = {
  id: 'tunicate',
  order: 8,
  evidenceLevel: 'B',
  reconstruction: 'partly-documented',
  references: ['hanlon2008'],
  pose: {
    body: makeBody({ height: 0.3, mantlePitch: 0.95, mantleLength: 0.8, mantleWidth: 1.05, eyeRaise: 0.05, webSpread: 0.4 }),
    arms: makeArms((i, side, pair) => ({
      pitch0: 0.55 - pair * 0.08,
      pitch1: 0.2,
      bend: side * 1.1,
      coil: side * 3.4,
      curl: 3.1 + (i % 2) * 0.5,
      length: 0.3 + (i % 3) * 0.035,
      waveAmp: 0.004,
      waveSpeed: 0.03,
    })),
    skin: makeSkin({
      dark: [0.16, 0.13, 0.15],
      light: [0.72, 0.74, 0.78],
      bandContrast: 0.08,
      mottle: 0.75,
      pale: 0.4,
      texture: 0.7,
    }),
    movement: makeMovement({ bobAmp: 0, swayAmp: 0, travel: 0 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: makeSequence(8.5),
  camera: { azimuth: 0.7, polar: 1.15, distance: 4.6, targetY: 0.35 },
  referenceModel: 'tunicate',
};
