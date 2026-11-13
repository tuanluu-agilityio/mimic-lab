import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const sponge: MimicryTarget = {
  id: 'sponge',
  order: 7,
  evidenceLevel: 'B',
  reconstruction: 'partly-documented',
  references: ['hanlon2008'],
  pose: {
    body: makeBody({ height: 0.36, mantlePitch: 1.2, mantleLength: 0.86, mantleWidth: 1.12, eyeRaise: 0.1, webSpread: 0.6 }),
    arms: makeArms((i, side, pair) => ({
      pitch0: -0.5,
      pitch1: 0,
      bend: side * (1.5 + pair * 0.25),
      coil: side * (4.2 + (i % 3) * 0.5),
      curl: 0.2,
      length: 0.4 + pair * 0.03,
      waveAmp: 0.004,
      waveSpeed: 0.03,
    })),
    skin: makeSkin({
      dark: [0.2, 0.085, 0.03],
      light: [0.56, 0.36, 0.17],
      bandContrast: 0.04,
      mottle: 0.9,
      pale: 0.1,
      texture: 1,
    }),
    movement: makeMovement({ bobAmp: 0, swayAmp: 0, travel: 0 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: makeSequence(8.5),
  camera: { azimuth: 0.7, polar: 1.15, distance: 5, targetY: 0.4 },
  referenceModel: 'sponge',
};
