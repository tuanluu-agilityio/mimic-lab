import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { DEFAULT_SEQUENCE } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

const WING_YAW = [0.95, 1.5, 2.05];

export const stingray: MimicryTarget = {
  id: 'stingray',
  order: 4,
  evidenceLevel: 'C',
  reconstruction: 'conceptual',
  references: ['huffard2010', 'hanlon2008'],
  pose: {
    body: makeBody({ height: 0.5, mantlePitch: 0.02, mantleHeight: 0.62, mantleWidth: 1.2, eyeRaise: 0.85, webSpread: 1 }),
    arms: makeArms((_i, side, pair) =>
      pair === 3
        ? { yaw: side * (Math.PI - 0.025), pitch0: 0, pitch1: 0, length: 0.8, waveAmp: 0.05, waveFreq: 1, waveSpeed: 0.3 }
        : {
            yaw: side * WING_YAW[pair],
            bend: side * 1.25,
            pitch0: 0,
            pitch1: -0.05,
            length: 0.46,
            waveAxis: 1,
            waveAmp: 0.3,
            waveFreq: 0.8,
            waveSpeed: 0.6,
            wavePhase: -pair * 0.9,
          },
    ),
    skin: makeSkin({ bandContrast: 0.12, mottle: 0.6, pale: 0.12, texture: 0.4 }),
    movement: makeMovement({ bobAmp: 0.04, bobFreq: 0.6, swayAmp: 0.02, travel: 0.55 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5],
  transitionSequence: DEFAULT_SEQUENCE,
  camera: { azimuth: 0.85, polar: 0.95, distance: 8.5, targetY: 0.4 },
  referenceModel: 'stingray',
};
