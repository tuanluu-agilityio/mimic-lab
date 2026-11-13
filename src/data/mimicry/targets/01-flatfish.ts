import { makeArms, makeBody, makeMovement, makeSkin } from '@/three/animation/restPose';
import { DEFAULT_SEQUENCE } from '@/three/animation/transition';
import type { MimicryTarget } from '../types';

const SPREAD = [0.3, 0.2, 0.11, 0.035];

export const flatfish: MimicryTarget = {
  id: 'flatfish',
  order: 1,
  name: 'Flatfish',
  scientificName: 'Zebrias sp. and other soles and flounders',
  tagline: 'Arms drawn into a leaf-shaped wedge, swimming with a rippling body.',
  evidenceLevel: 'A',
  evidenceDescription:
    'The best documented behaviour. Described in the original 2001 report and later recorded hundreds of times by an independent team in North Sulawesi. Which flatfish is the model is not settled: the first report proposed a banded sole (Zebrias), later authors a wider set of soles and flounders.',
  reconstruction: 'documented',
  reconstructionNote:
    'Arms held together in a flattened, leaf-shaped wedge, mantle trailing the head, eyes raised, jet-propelled swimming with undulation and banded colour are all described. The exact position of each arm, the undulation rate and the speed are not published; those values are estimates.',
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
  educationalContent: {
    mechanism:
      'All eight arms are swept back and held side by side so that the body tapers like a leaf. The mantle is flattened and trails behind the head, the eyes are raised, and water jetted from the funnel pushes the animal forward close to the sand while the whole outline ripples.',
    context: 'Seen when the octopus crosses open sand, where it has no shelter.',
    comparison: [
      { aspect: 'Silhouette', model: 'Flat oval tapering to a tail', octopus: 'Arms pressed together form a similar flat, tapering outline' },
      { aspect: 'Body posture', model: 'Lies and swims on its side, both eyes on top', octopus: 'Mantle flattened, both eyes raised above the outline' },
      { aspect: 'Colour pattern', model: 'Dark and pale bands (in banded soles)', octopus: 'Brown and cream bands produced by chromatophores' },
      { aspect: 'Movement', model: 'Undulates fins and body along the bottom', octopus: 'Jet propulsion plus undulation of the arm wedge' },
      { aspect: 'Anatomy', model: 'A bony fish: skeleton, fins, gills behind the head', octopus: 'A boneless mollusc: eight arms and a mantle, no fins' },
    ],
  },
  limitations:
    'No experiment has tested whether predators are deceived. The model sole is only described as potentially toxic, and flounders of the genus Bothus are not toxic, so the benefit of the resemblance is still an open question.',
  referenceModel: 'flatfish',
  referenceCaption: 'Banded sole (illustrative model)',
};
