import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { makeSequence } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

export const anemone: MimicryTarget = {
  id: 'anemone',
  order: 10,
  name: 'Sea anemone',
  scientificName: 'Megalactis sp. (suggested)',
  tagline: 'Sitting on a mound with every arm raised in a zigzag.',
  evidenceLevel: 'B',
  evidenceDescription:
    'The original report describes the posture but only says “it is possible” that it imitates a sand anemone of the genus Megalactis. The authors did not list it among the behaviours they were confident about.',
  reconstruction: 'partly-documented',
  reconstructionNote:
    'Sitting on a sand mound with all arms raised, each bent in a zigzag, is described. Movement, colour, what triggers it and how often it was seen are not reported.',
  references: ['norman2001'],
  pose: {
    body: makeBody({ height: 0.24, mantlePitch: -0.15, mantleLength: 0.85, eyeRaise: 0.2, webSpread: 0.8, burrow: 0.45 }),
    arms: makeArms((i, side) => ({
      pitch0: 0.85,
      pitch1: 1.2,
      pitchBias: 0.6,
      bend: side * 0.15,
      curl: -0.3,
      length: 0.52 + (i % 3) * 0.04,
      // A near-stationary zigzag along each arm.
      waveAxis: 0.35,
      waveAmp: 0.5,
      waveFreq: 4.5,
      waveSpeed: 0.035,
      wavePhase: i * 1.3,
    })),
    skin: makeSkin({ bandContrast: 0.85, bandSharpness: 0.55, bandFreq: 10, mottle: 0.3, pale: 0.12, texture: 0.5 }),
    movement: makeMovement({ bobAmp: 0.004, swayAmp: 0.03, swayFreq: 0.08, travel: 0 }),
  },
  involvedArms: [0, 1, 2, 3, 4, 5, 6, 7],
  transitionSequence: makeSequence(9.5),
  camera: { azimuth: 0.7, polar: 1.2, distance: 8, targetY: 1.0 },
  educationalContent: {
    mechanism:
      'The octopus sits on a low mound of sand and lifts all eight arms, holding each one in a zigzag. From a distance the raised, kinked arms resemble the long branched tentacles of a sand-dwelling anemone.',
    context: 'Reported for an animal sitting on a sand mound.',
    comparison: [
      { aspect: 'Silhouette', model: 'A ring of long tentacles around a central disc', octopus: 'Eight raised arms around the head' },
      { aspect: 'Body posture', model: 'Column buried in sand', octopus: 'Sitting on a mound, mantle low' },
      { aspect: 'Colour pattern', model: 'Banded or mottled tentacles', octopus: 'Banded arms; colour during the display was not reported' },
      { aspect: 'Movement', model: 'Slow swaying', octopus: 'Not reported; shown almost still here' },
      { aspect: 'Anatomy', model: 'Stinging tentacles, no brain, fixed in place', octopus: 'Muscular arms with suckers and no stinging cells' },
    ],
  },
  limitations:
    'The identification with an anemone is the authors’ suggestion, worded as a possibility. The number of observations is not given.',
  referenceModel: 'anemone',
  referenceCaption: 'Sand anemone (illustrative model)',
};
