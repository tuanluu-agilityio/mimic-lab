import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const jellyfish: MimicryTarget = {
  id: 'jellyfish',
  order: 6,
  evidenceLevel: 'B',
  reconstruction: 'partly-documented',
  references: ['norman2001'],
  pose: {
    body: makeBody({ height: 2.5, mantlePitch: 1.45, mantleWidth: 1.12, eyeRaise: 0.3, webSpread: 1 }),
    arms: makeArms((i) => ({
      pitch0: 0.05,
      pitch1: -1.3,
      pitchBias: 0.8,
      bend: 0.15 * Math.sin(i * 2.1),
      curl: 0.3,
      length: 0.8,
      waveAxis: 0.75,
      waveAmp: 0.2,
      waveFreq: 1.3,
      waveSpeed: 0.3,
      wavePhase: i * 0.8,
    })),
    skin: makeSkin({ bandContrast: 0.35, bandSharpness: 0.3, mottle: 0.2, pale: 0.5, texture: 0.1 }),
    movement: makeMovement({ bobAmp: 0.16, bobFreq: 0.16, swayAmp: 0.08, swayFreq: 0.06, pulseAmp: 0.05, pulseFreq: 0.32, travel: 0 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: makeSequence(10),
  camera: { azimuth: 0.6, polar: 1.42, distance: 11.5, targetY: 1.7 },
  referenceModel: 'jellyfish',
};
