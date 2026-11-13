import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

/** Arms raised out of the burrow in this reconstruction (L1 and R1). */
const RAISED = [0, 1];

export const tubeWorm: MimicryTarget = {
  id: 'tube-worm',
  order: 9,
  name: 'Tube-worm tube',
  tagline: 'Motionless, resembling the empty-looking tube of a polychaete worm.',
  evidenceLevel: 'B',
  evidenceDescription:
    'The field study from North Sulawesi says motionless animals resembled “tube-worm tubes”. Note the wording: the tube, not the worm with its feathery crown. Only the abstract was available for this project.',
  reconstruction: 'partly-documented',
  reconstructionNote:
    'Being motionless and tube-like is reported. Which arms are used and how the rest of the body is hidden are not described; this animation raises two arms from a burrow as one possible arrangement.',
  references: ['hanlon2008'],
  pose: {
    body: makeBody({ height: -0.28, mantlePitch: -0.5, mantleLength: 0.9, eyeRaise: 0.1, webSpread: 0.05, burrow: 1 }),
    arms: makeArms((i, side, pair) =>
      RAISED.includes(i)
        ? {
            yaw: side * 0.05,
            pitch0: 1.5,
            pitch1: 1.42,
            bend: side * 0.25,
            coil: 0,
            curl: -0.15,
            length: 0.34,
            waveAxis: 0.5,
            waveAmp: 0.025,
            waveFreq: 0.6,
            waveSpeed: 0.12,
            wavePhase: side,
          }
        : {
            pitch0: -1.25,
            pitch1: -1.45,
            bend: side * 0.4,
            coil: side * (1.2 + pair * 0.3),
            length: 0.44,
            bury: 1,
            waveAmp: 0.01,
            waveSpeed: 0.05,
          },
    ),
    skin: makeSkin({
      dark: [0.16, 0.14, 0.11],
      light: [0.5, 0.46, 0.38],
      bandContrast: 0.1,
      mottle: 0.6,
      pale: 0.25,
      texture: 0.7,
    }),
    movement: makeMovement({ bobAmp: 0, swayAmp: 0, travel: 0 }),
  },
  involvedArms: RAISED,
  transitionSequence: makeSequence(9.5, { arms: [0.18, 0.58], body: [0.3, 0.7] }),
  camera: { azimuth: 0.55, polar: 1.25, distance: 5.2, targetY: 0.6 },
  educationalContent: {
    mechanism:
      'With the body down a burrow, a part of the animal that stays above the sand and keeps still can pass for one of the many worm tubes that stand on a sand flat. The skin is dull and unbanded.',
    context: 'Reported for stationary animals on the open sand flat.',
    comparison: [
      { aspect: 'Silhouette', model: 'A narrow upright tube', octopus: 'Arms held together upright form a narrow column' },
      { aspect: 'Body posture', model: 'Worm hidden inside its tube', octopus: 'Body hidden in a burrow' },
      { aspect: 'Colour pattern', model: 'Dull grey-brown, sandy', octopus: 'Dull, unbanded skin' },
      { aspect: 'Movement', model: 'None', octopus: 'Almost none' },
      { aspect: 'Anatomy', model: 'A secreted tube built by a segmented worm', octopus: 'Living, muscular arms' },
    ],
  },
  limitations:
    'The source describes a resemblance to tubes when motionless. It does not describe the octopus imitating a feather-duster crown.',
  referenceModel: 'tube-worm',
  referenceCaption: 'Polychaete worm tubes (illustrative model)',
};
