import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { DEFAULT_SEQUENCE } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const snakeEel: MimicryTarget = {
  id: 'snake-eel',
  order: 5,
  evidenceLevel: 'C',
  reconstruction: 'conceptual',
  references: ['huffard2010', 'hanlon2008'],
  pose: {
    body: makeBody({ height: 0.22, mantlePitch: 0.02, mantleLength: 1.12, mantleWidth: 0.8, mantleHeight: 0.78, eyeRaise: 0.35, webSpread: 0.05 }),
    arms: makeArms((_i, side, pair) => ({
      yaw: side * (Math.PI - 0.022 * (pair + 1)),
      bend: side * 0.03 * (pair + 1),
      pitch0: -0.1,
      pitch1: 0,
      length: 1.02 - pair * 0.03,
      waveAxis: 0,
      waveAmp: 0.34,
      waveFreq: 1.9,
      waveSpeed: 0.5,
      wavePhase: 0,
    })),
    skin: makeSkin({ bandContrast: 0.55, bandSharpness: 0.5, bandFreq: 9, mottle: 0.25, pale: 0.3, texture: 0.2 }),
    movement: makeMovement({ bobAmp: 0.005, swayAmp: 0.05, swayFreq: 0.5, travel: 0.45 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: DEFAULT_SEQUENCE,
  camera: { azimuth: 0.6, polar: 0.9, distance: 9.5, targetY: 0.2 },
  referenceModel: 'snake-eel',
};
