import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const tunicate: MimicryTarget = {
  id: 'tunicate',
  order: 8,
  name: 'Colonial tunicate',
  tagline: 'Motionless and compact, resembling a cluster of sea squirts.',
  evidenceLevel: 'B',
  evidenceDescription:
    'The same field study that mentions sponges reports that motionless animals resembled colonial tunicates. Only the abstract was available for this project; it gives no detail of the posture.',
  reconstruction: 'partly-documented',
  reconstructionNote:
    'Being motionless is reported. The knobbly cluster of raised arm loops shown here is an interpretation, not a described posture.',
  references: ['hanlon2008'],
  pose: {
    body: makeBody({ height: 0.3, mantlePitch: 0.95, mantleLength: 0.8, mantleWidth: 1.05, eyeRaise: 0.05, webSpread: 0.4 }),
    arms: makeArms((i, side, pair) => ({
      pitch0: 0.55 - pair * 0.08,
      pitch1: 0.2,
      bend: side * 1.1,
      coil: side * 3.4,
      curl: 3.1 + (i % 2) * 0.5,
      length: 0.3 + (i % 3) * 0.035,
      waveAmp: 0.004,
      waveSpeed: 0.03,
    })),
    skin: makeSkin({
      dark: [0.16, 0.13, 0.15],
      light: [0.72, 0.74, 0.78],
      bandContrast: 0.08,
      mottle: 0.75,
      pale: 0.4,
      texture: 0.7,
    }),
    movement: makeMovement({ bobAmp: 0, swayAmp: 0, travel: 0 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: makeSequence(8.5),
  camera: { azimuth: 0.7, polar: 1.15, distance: 4.6, targetY: 0.35 },
  educationalContent: {
    mechanism:
      'The animal sits still with the arms drawn in. In this illustration the arms are looped upward so the outline is a cluster of rounded knobs, and the skin is pale and blotchy. As with the sponge, this is camouflage by resemblance to a background object.',
    context: 'Reported for stationary animals on the open sand flat.',
    comparison: [
      { aspect: 'Silhouette', model: 'A cluster of small rounded zooids', octopus: 'A compact cluster of curled arms and mantle' },
      { aspect: 'Body posture', model: 'Fixed to the bottom', octopus: 'Sitting still' },
      { aspect: 'Colour pattern', model: 'Often pale or translucent with coloured rims', octopus: 'Pale, blotchy skin' },
      { aspect: 'Movement', model: 'None visible', octopus: 'None while the posture is held' },
      { aspect: 'Anatomy', model: 'Many small filter-feeding animals sharing a base', octopus: 'A single animal' },
    ],
  },
  limitations: 'The posture is an interpretation of a one-sentence report. No model species is named in the abstract.',
  referenceModel: 'tunicate',
  referenceCaption: 'Colonial tunicate (illustrative model)',
};
