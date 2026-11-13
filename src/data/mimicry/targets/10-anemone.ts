import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const anemone: MimicryTarget = {
  id: 'anemone',
  order: 10,
  scientificName: 'Megalactis sp.',
  evidenceLevel: 'B',
  reconstruction: 'partly-documented',
  references: ['norman2001'],
  pose: {
    body: makeBody({ height: 0.24, mantlePitch: -0.15, mantleLength: 0.85, eyeRaise: 0.2, webSpread: 0.8, burrow: 0.45 }),
    arms: makeArms((i, side) => ({
      pitch0: 0.85,
      pitch1: 1.2,
      pitchBias: 0.6,
      bend: side * 0.15,
      curl: -0.3,
      length: 0.52 + (i % 3) * 0.04,
      // A near-stationary zigzag along each arm.
      waveAxis: 0.35,
      waveAmp: 0.5,
      waveFreq: 4.5,
      waveSpeed: 0.035,
      wavePhase: i * 1.3,
    })),
    skin: makeSkin({ bandContrast: 0.85, bandSharpness: 0.55, bandFreq: 10, mottle: 0.3, pale: 0.12, texture: 0.5 }),
    movement: makeMovement({ bobAmp: 0.004, swayAmp: 0.03, swayFreq: 0.08, travel: 0 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: makeSequence(9.5),
  camera: { azimuth: 0.7, polar: 1.2, distance: 8, targetY: 1.0 },
  referenceModel: 'anemone',
};
