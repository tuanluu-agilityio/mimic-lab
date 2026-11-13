import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { DEFAULT_SEQUENCE } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

const SPREAD = [0.3, 0.2, 0.11, 0.035];

export const flatfish: MimicryTarget = {
  id: 'flatfish',
  order: 1,
  scientificName: 'Zebrias sp.',
  evidenceLevel: 'A',
  reconstruction: 'documented',
  references: ['norman2001', 'hanlon2008', 'huffard2010'],
  pose: {
    body: makeBody({ height: 0.46, mantlePitch: 0.04, mantleHeight: 0.6, mantleWidth: 1.12, eyeRaise: 1, webSpread: 0.25 }),
    arms: makeArms((_i, side, pair) => ({
      yaw: side * (Math.PI - SPREAD[pair]),
      bend: side * SPREAD[pair] * 1.75,
      pitch0: -0.05,
      pitch1: 0,
      length: 0.84 - pair * 0.02,
      waveAxis: 1,
      waveAmp: 0.15,
      waveFreq: 1.25,
      waveSpeed: 1.05,
      wavePhase: 0,
    })),
    skin: makeSkin({ bandContrast: 0.95, bandSharpness: 0.7, bandFreq: 12, mottle: 0.2, pale: 0.04, texture: 0.25 }),
    movement: makeMovement({ bobAmp: 0.025, bobFreq: 1.05, rollAmp: 0.035, swayAmp: 0.02, swayFreq: 0.5, pulseAmp: 0.035, pulseFreq: 1.05, travel: 1.0 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: DEFAULT_SEQUENCE,
  camera: { azimuth: 0.95, polar: 1.02, distance: 8.6, targetY: 0.4 },
  referenceModel: 'flatfish',
};
