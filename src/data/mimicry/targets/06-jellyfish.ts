import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const jellyfish: MimicryTarget = {
  id: 'jellyfish',
  order: 6,
  name: 'Jellyfish',
  tagline: 'Seen once: a slow sink through the water with arms spread evenly.',
  evidenceLevel: 'B',
  evidenceDescription:
    'A single incident in the original report. The authors wrote only that the octopus “may” impersonate a jellyfish and did not count it among the behaviours they were confident about.',
  reconstruction: 'partly-documented',
  reconstructionNote:
    'Rising several metres to the surface and then sinking slowly with arms spread evenly and undulating is described. Mantle pulsing, colour and the trigger are not, and are filled in here.',
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
  educationalContent: {
    mechanism:
      'The octopus leaves the bottom, then lets itself sink with the arms spread evenly around the body and trailing, so the outline is a rounded mass above a ring of hanging strands.',
    context: 'Reported once, in open water above the sand flat.',
    comparison: [
      { aspect: 'Silhouette', model: 'A bell with tentacles hanging below', octopus: 'Mantle above, arms spread and hanging' },
      { aspect: 'Body posture', model: 'Radially symmetric', octopus: 'Arms spaced evenly around the head' },
      { aspect: 'Colour pattern', model: 'Often translucent', octopus: 'Opaque skin; colour during the event was not reported' },
      { aspect: 'Movement', model: 'Rhythmic pulsing of the bell', octopus: 'Slow sinking with undulating arms' },
      { aspect: 'Anatomy', model: 'No brain, eyes like an octopus’s, or muscular arms', octopus: 'A complex mollusc with a large brain and eyes' },
    ],
  },
  limitations: 'One observation with cautious wording. It may simply be a way of descending through the water.',
  referenceModel: 'jellyfish',
  referenceCaption: 'Jellyfish (illustrative model)',
};
