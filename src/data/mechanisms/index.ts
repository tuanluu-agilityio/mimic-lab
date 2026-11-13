import type { MechanismId } from '@/types/app';

export type DiagramId = 'arm-section' | 'chromatophore' | 'neuron-share';

export interface MechanismStep {
  id: string;
  title: string;
  text: string;
  /** For the skin mechanism: neural drive applied to the skin model at this step (0..1). */
  activation?: number;
}

export interface Mechanism {
  id: MechanismId;
  number: number;
  title: string;
  lead: string;
  /** Ordered steps of the 3D demonstration. Empty when the demonstration is free-form. */
  steps: MechanismStep[];
  /** Key facts. */
  points: string[];
  /** The common misconception this section corrects. */
  caution?: { claim: string; correction: string };
  diagram?: DiagramId;
  /** What part of the content is generalised from other species. */
  basisNote: string;
  references: string[];
}

export const MECHANISMS: Mechanism[] = [
  {
    id: 'nervous',
    number: 1,
    title: 'Distributed nervous system',
    lead: 'An octopus has a large central brain, and it also has most of its nerve cells outside that brain, in its arms. Control is shared between the two.',
    steps: [
      {
        id: 'stimulus',
        title: 'Something is seen',
        text: 'Light from a movement nearby reaches the retina. The eyes are the main way the animal monitors its surroundings.',
      },
      {
        id: 'optic',
        title: 'Optic lobes',
        text: 'Signals pass to the optic lobe behind each eye, where the visual scene is analysed. Together these lobes hold more nerve cells than the rest of the brain.',
      },
      {
        id: 'brain',
        title: 'Central brain',
        text: 'The central brain combines what is seen with touch and chemical information and with memory, and selects a response.',
      },
      {
        id: 'commands',
        title: 'Commands go out',
        text: 'High-level commands travel down the eight arm nerve cords and to the muscles of the skin’s colour organs. They specify what to do, not every muscle contraction.',
      },
      {
        id: 'local',
        title: 'Arm circuits take over',
        text: 'Circuits within each arm cord turn the command into coordinated muscle activity along the arm. Here the animal draws its arms in, raises its eyes and darkens its bands.',
      },
      {
        id: 'feedback',
        title: 'Information returns',
        text: 'Touch and taste signals from the suckers travel back up the cords. The brain can use this, and vision, to guide an individual arm.',
      },
    ],
    points: [
      'In the common octopus, about 500 million neurons in total; roughly two thirds are in the arms.',
      'An isolated arm can still carry out a stereotyped reach when its nerve cord is stimulated.',
      'The brain can nevertheless direct a single arm to a target using vision alone.',
      'The eight cords are linked to each other around the mouth, so arms can also coordinate with their neighbours.',
    ],
    caution: {
      claim: '“Each arm has its own brain.”',
      correction:
        'Each arm has a nerve cord with local circuits that can produce basic movements without moment-to-moment instructions. The brain still decides when and where to move and receives information back. The arms are semi-independent, not separate brains.',
    },
    diagram: 'neuron-share',
    basisNote: 'All figures and experiments are from the common octopus, Octopus vulgaris. Nothing has been measured in the mimic octopus.',
    references: ['young1963', 'sumbre2001', 'zullo2009', 'gutnick2011', 'gutnick2020', 'hochner2012'],
  },
  {
    id: 'skin',
    number: 2,
    title: 'Dynamic skin coloration',
    lead: 'The banding of the mimic octopus is not painted on. It is produced, moment by moment, by thousands of muscle-driven colour organs over layers of reflecting cells.',
    steps: [
      {
        id: 'rest',
        title: 'Skin at rest',
        text: 'With the radial muscles relaxed, each chromatophore’s pigment sac is a tiny dot. The white leucophores beneath show through and the skin looks pale.',
        activation: 0.03,
      },
      {
        id: 'signal',
        title: 'Neural activation',
        text: 'Motor nerves from the brain fire. Each chromatophore is connected directly, with no relay in between, which is why the response is so fast.',
        activation: 0.32,
      },
      {
        id: 'expand',
        title: 'Chromatophores expand',
        text: 'The radial muscles contract and pull each elastic sac out into a thin disc many times its resting width.',
        activation: 1,
      },
      {
        id: 'pigment',
        title: 'Pigment becomes visible',
        text: 'Spread thin, the pigment now covers the reflecting layers underneath. Where a group of dark chromatophores expands together, a dark patch appears.',
        activation: 1,
      },
      {
        id: 'pattern',
        title: 'Resulting pattern',
        text: 'Expanding chromatophores in some zones and not in others produces the animal’s bold brown and cream bands. Relax the muscles and the pattern fades again.',
        activation: 1,
      },
    ],
    points: [
      'Chromatophores are organs: a pigment sac, radial muscles and nerves.',
      'Iridophores reflect light from stacked platelets, giving structural colours.',
      'Leucophores scatter light and provide the white base.',
      'The pattern of this species is changeable; it is switched on and off by the nervous system.',
    ],
    caution: {
      claim: '“Colour change is slow, like pigment gradually spreading through the skin.”',
      correction:
        'Cephalopod chromatophores are opened by muscles under direct nervous control, so patterns can change in well under a second. No slow hormonal or pigment-migration step is needed.',
    },
    diagram: 'chromatophore',
    basisNote: 'Skin structure is generalised from other cephalopods. The changeable banded pattern is reported for this species.',
    references: ['messenger2001', 'froesch1978', 'mathger2009', 'huffard2010', 'xu2025'],
  },
  {
    id: 'arms',
    number: 3,
    title: 'Arm movement',
    lead: 'An octopus arm has no bones and no joints. It can bend at any point, in any direction, and can lengthen, shorten, stiffen or twist. Choose an arm and move it yourself.',
    steps: [],
    points: [
      'A muscular hydrostat: muscle is almost incompressible, so when the arm gets thinner it must get longer, and the reverse.',
      'Transverse muscles squeeze the arm and extend it. Longitudinal muscles shorten it, or bend it when only one side contracts.',
      'Oblique muscles wound in both directions twist the arm.',
      'Each sucker seals with its rim and grips by lowering the pressure in its chamber.',
      'Arms can be extended, folded, coiled, spread, or hidden under the body or in the sand.',
    ],
    caution: {
      claim: '“Arms and tentacles are the same thing.”',
      correction: 'Octopuses have eight arms, with suckers along their whole length. Tentacles, found in squid and cuttlefish, are a different, extensible pair with suckers mainly at the tip.',
    },
    diagram: 'arm-section',
    basisNote: 'Arm mechanics are generalised from other octopuses. The model’s arm is driven by a curve, not by simulated muscle.',
    references: ['kier1985', 'kier2007', 'kier2002'],
  },
  {
    id: 'locomotion',
    number: 4,
    title: 'Locomotion',
    lead: 'The same body gets around in several quite different ways. Pick one and slow it down.',
    steps: [],
    points: [
      'Crawling on the arms is the everyday mode and is used while foraging.',
      'Jetting is the fast mode, used to escape or to cross open ground.',
      'Flatfish swimming, the style this species is known for, combines jetting with an undulating, flattened arm wedge.',
      'Walking on two arms has been described in other octopus species but is not documented for this one, so it is not shown.',
    ],
    basisNote: 'Flatfish swimming is described for this species. Crawling and jet mechanics are generalised from other octopuses. Speeds in the animation are illustrative; none have been published.',
    references: ['norman2001', 'hanlon2008', 'huffard2010', 'wells1978'],
  },
  {
    id: 'mimicry',
    number: 5,
    title: 'Adaptive mimicry',
    lead: 'The octopus does not turn into another animal. Each resemblance is assembled from things any octopus can do: place its arms, reshape its body, change its skin and move in a particular way. Switch the components on and off.',
    steps: [],
    points: [
      'Arm configuration: together, spread, raised or hidden.',
      'Body posture: mantle flattened, raised or tucked away; eyes raised.',
      'Skin: banding switched on or off, texture smooth or rough.',
      'Movement: undulating, drifting or holding still.',
      'Context: the sea-snake display was seen after attacks by damselfish, which suggests the response can depend on the threat.',
    ],
    caution: {
      claim: '“It shape-shifts into more than fifteen species.”',
      correction:
        'It remains an octopus throughout, with eight arms and no skeleton. The scientists who described it were confident about three resemblances, and no experiment has yet shown that predators are deceived.',
    },
    basisNote: 'The example shown is flatfish swimming, the best documented behaviour.',
    references: ['norman2001', 'hanlon2008', 'huffard2010'],
  },
];

export function getMechanism(id: MechanismId): Mechanism {
  return MECHANISMS.find((m) => m.id === id) ?? MECHANISMS[0];
}
