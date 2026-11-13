import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { DEFAULT_SEQUENCE } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

const WING_YAW = [0.95, 1.5, 2.05];

export const stingray: MimicryTarget = {
  id: 'stingray',
  order: 4,
  name: 'Stingray',
  tagline: 'A widely repeated claim with no scientific description behind it.',
  evidenceLevel: 'C',
  evidenceDescription:
    'Stingrays appear in many popular lists of animals the mimic octopus imitates. Research for this project found no peer-reviewed paper that describes such a display.',
  reconstruction: 'conceptual',
  reconstructionNote:
    'Nothing about this posture is taken from the scientific literature. The animation only shows how an octopus body could produce a ray-like outline, to illustrate what the popular claim would involve.',
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
  educationalContent: {
    mechanism:
      'In this illustration six arms are folded out sideways and held with the web spread to suggest two wings, while the last pair trails as a tail. This is a thought experiment about body shape, not a record of behaviour.',
    comparison: [
      { aspect: 'Silhouette', model: 'Flat disc with a thin tail', octopus: 'Arms and web spread sideways could suggest a disc' },
      { aspect: 'Body posture', model: 'Body and pectoral fins fused into one disc', octopus: 'Separate arms held together' },
      { aspect: 'Colour pattern', model: 'Plain or spotted upper side', octopus: 'Drab, unbanded skin in this illustration' },
      { aspect: 'Movement', model: 'Waves travel along the fin margins', octopus: 'Illustrative arm ripples; not observed' },
      { aspect: 'Anatomy', model: 'A cartilaginous fish with a tail spine', octopus: 'A mollusc with no skeleton or spine' },
    ],
  },
  limitations:
    'Treat this as unverified. If you find a peer-reviewed description of ray mimicry in this species, the evidence grade should be revised.',
  referenceModel: 'stingray',
  referenceCaption: 'Stingray (illustrative model)',
};
