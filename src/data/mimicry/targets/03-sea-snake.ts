import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

/** The two arms that stay outside the burrow in this reconstruction (L2 and R2). */
const EXPOSED = [2, 3];

export const seaSnake: MimicryTarget = {
  id: 'sea-snake',
  order: 3,
  scientificName: 'Laticauda sp.',
  evidenceLevel: 'A',
  reconstruction: 'documented',
  references: ['norman2001', 'huffard2010'],
  pose: {
    body: makeBody({ height: -0.3, mantlePitch: -0.5, mantleLength: 0.9, eyeRaise: 0.15, webSpread: 0.1, burrow: 1 }),
    arms: makeArms((i, side, pair) =>
      EXPOSED.includes(i)
        ? {
            yaw: side * (Math.PI / 2),
            pitch0: 0.9,
            pitch1: 0,
            pitchBias: 0.25,
            bend: 0,
            coil: side * 0.5,
            length: 1.08,
            waveAxis: 0,
            waveAmp: 0.5,
            waveFreq: 1.7,
            waveSpeed: 0.42,
            wavePhase: side > 0 ? 0 : Math.PI,
          }
        : {
            pitch0: -1.25,
            pitch1: -1.45,
            bend: side * 0.4,
            coil: side * (1.2 + pair * 0.3),
            length: 0.46,
            bury: 1,
            waveAmp: 0.03,
            waveSpeed: 0.1,
          },
    ),
    skin: makeSkin({
      dark: [0.006, 0.006, 0.008],
      light: [0.82, 0.82, 0.76],
      bandContrast: 1,
      bandSharpness: 0.92,
      bandFreq: 15,
      mottle: 0.02,
      pale: 0,
      texture: 0.15,
    }),
    movement: makeMovement({ bobAmp: 0, swayAmp: 0, travel: 0 }),
  },
  involvedArms: EXPOSED,
  transitionSequence: makeSequence(10, { arms: [0.18, 0.58], body: [0.3, 0.7] }),
  camera: { azimuth: 0.25, polar: 0.82, distance: 11, targetY: 0.1 },
  referenceModel: 'sea-snake',
};
