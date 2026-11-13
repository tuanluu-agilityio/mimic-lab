import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const lionfish: MimicryTarget = {
  id: 'lionfish',
  order: 2,
  scientificName: 'Pterois sp.',
  evidenceLevel: 'B',
  reconstruction: 'partly-documented',
  references: ['norman2001', 'huffard2010'],
  pose: {
    body: makeBody({ height: 1.25, mantlePitch: 0.55, eyeRaise: 0.7, webSpread: 0.9 }),
    arms: makeArms((i, side, pair) => ({
      pitch0: 0.42 - pair * 0.1,
      pitch1: -0.85,
      pitchBias: 1.2,
      bend: side * (0.12 + pair * 0.05),
      curl: -0.25,
      length: 0.88,
      waveAxis: 0.6,
      waveAmp: 0.09,
      waveFreq: 1.1,
      waveSpeed: 0.22,
      wavePhase: i * 0.9,
    })),
    skin: makeSkin({ bandContrast: 1, bandSharpness: 0.75, bandFreq: 10, mottle: 0.15, pale: 0.03, texture: 0.3 }),
    movement: makeMovement({ bobAmp: 0.07, bobFreq: 0.3, swayAmp: 0.05, swayFreq: 0.14, pulseAmp: 0.025, pulseFreq: 0.6, travel: 0.22 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: makeSequence(9.5),
  camera: { azimuth: 0.7, polar: 1.3, distance: 10.5, targetY: 0.9 },
  referenceModel: 'lionfish',
};
