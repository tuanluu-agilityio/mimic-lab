import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const lionfish: MimicryTarget = {
  id: 'lionfish',
  order: 2,
  name: 'Lionfish',
  scientificName: 'Pterois sp.',
  tagline: 'Swimming above the bottom with banded arms spread and trailing.',
  evidenceLevel: 'B',
  evidenceDescription:
    'One of the three behaviours the discoverers said they were confident about, seen in four individuals. However, they had no clear image of it, and no later study has quantified it.',
  reconstruction: 'partly-documented',
  reconstructionNote:
    'Swimming just above the sea floor with banded arms spread and trailing is described. The exact fan of the arms, the mantle position and what triggers the display are not, so the radial arrangement shown here is an interpretation.',
  references: ['norman2001', 'huffard2010'],
  pose: {
    body: makeBody({ height: 1.25, mantlePitch: 0.55, eyeRaise: 0.7, webSpread: 0.9 }),
    arms: makeArms((i, side, pair) => ({
      pitch0: 0.42 - pair * 0.1,
      pitch1: -0.85,
      pitchBias: 1.2,
      bend: side * (0.12 + pair * 0.05),
      curl: -0.25,
      length: 0.88,
      waveAxis: 0.6,
      waveAmp: 0.09,
      waveFreq: 1.1,
      waveSpeed: 0.22,
      wavePhase: i * 0.9,
    })),
    skin: makeSkin({ bandContrast: 1, bandSharpness: 0.75, bandFreq: 10, mottle: 0.15, pale: 0.03, texture: 0.3 }),
    movement: makeMovement({ bobAmp: 0.07, bobFreq: 0.3, swayAmp: 0.05, swayFreq: 0.14, pulseAmp: 0.025, pulseFreq: 0.6, travel: 0.22 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: makeSequence(9.5),
  camera: { azimuth: 0.7, polar: 1.3, distance: 10.5, targetY: 0.9 },
  educationalContent: {
    mechanism:
      'The animal lifts off the sand and swims slowly with its arms spread apart instead of bundled. Each banded arm then reads as a separate striped ray, like the long venomous fin spines of a lionfish.',
    context: 'Reported while swimming in open water just above the bottom.',
    comparison: [
      { aspect: 'Silhouette', model: 'Body surrounded by long, separate fin rays', octopus: 'Head and mantle surrounded by eight spread arms' },
      { aspect: 'Body posture', model: 'Hovers with fins flared', octopus: 'Hovers with arms spread and trailing' },
      { aspect: 'Colour pattern', model: 'Red-brown and white bands on body and rays', octopus: 'Brown and white bands along every arm' },
      { aspect: 'Movement', model: 'Slow, drifting swimming', octopus: 'Slow jet-assisted swimming' },
      { aspect: 'Anatomy', model: 'Venomous spines supported by bone', octopus: 'Soft, flexible arms with no spines and no venom delivered this way' },
    ],
  },
  limitations:
    'Based on a small number of sightings without a clear photograph. An octopus has eight arms, far fewer than the number of rays on a lionfish, so the resemblance is one of overall impression.',
  referenceModel: 'lionfish',
  referenceCaption: 'Lionfish (illustrative model)',
};
