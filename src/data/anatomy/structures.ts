import type { ViewMode } from '@/types/app';

export type AnatomySystem =
  | 'integument'
  | 'nervous'
  | 'circulatory'
  | 'respiratory'
  | 'digestive'
  | 'locomotor'
  | 'sensory'
  | 'defence';

export interface AnatomyStructure {
  id: string;
  name: string;
  group: 'external' | 'internal';
  system: AnatomySystem;
  /** Short scientific explanation. */
  summary: string;
  /** Biological function. */
  func: string;
  /** Relationship with other body systems. */
  relations: string;
  /** Optional deeper explanation. */
  deeper: string;
  /**
   * 'species' = stated for Thaumoctopus mimicus in the literature;
   * 'octopod-general' = generalised from better-studied octopuses (mostly Octopus vulgaris).
   */
  basis: 'species' | 'octopod-general';
  /** What is schematic or uncertain about the 3D representation. */
  approximation: string;
  references: string[];
  /** Engine anchor id (see src/three/models/anatomy/anchors.ts). */
  anchor: string;
  /** View mode that shows this structure best. */
  preferredMode?: ViewMode;
}

export const SYSTEM_LABELS: Record<AnatomySystem, string> = {
  integument: 'Skin',
  nervous: 'Nervous system',
  circulatory: 'Circulation',
  respiratory: 'Respiration',
  digestive: 'Digestion',
  locomotor: 'Movement',
  sensory: 'Senses',
  defence: 'Defence',
};

export const BASIS_LABELS: Record<AnatomyStructure['basis'], string> = {
  species: 'Described for this species',
  'octopod-general': 'Generalised from other octopus species',
};

export const ANATOMY_STRUCTURES: AnatomyStructure[] = [
  {
    id: 'mantle',
    name: 'Mantle',
    group: 'external',
    system: 'locomotor',
    summary:
      'The muscular sac behind the head. It encloses the gills, hearts, gut and reproductive organs, and is what most people take for the “head”.',
    func: 'Its wall contracts rhythmically to pump water over the gills. A hard contraction forces that water out through the funnel and jets the animal along.',
    relations:
      'Breathing and jet propulsion use the same muscle and the same water, so swimming fast competes with steady respiration and circulation.',
    deeper:
      'Collected specimens of this species have mantle lengths of about 44 to 48 mm, so it is a small octopus. The species description notes a white teardrop-shaped ring in the middle of the upper mantle and a white “U” on the rear of the mantle.',
    basis: 'species',
    approximation: 'Shape is a smooth procedural ovoid; the white mantle markings of the species are not individually modelled.',
    references: ['norman2005', 'sajikumar2020', 'wells1978'],
    anchor: 'mantle',
  },
  {
    id: 'head',
    name: 'Head',
    group: 'external',
    system: 'nervous',
    summary:
      'The region between the mantle and the arms. It carries the eyes and contains the brain, which is protected by a capsule of cartilage.',
    func: 'Houses the central brain and the main sense organs, and joins the arm crown to the rest of the body.',
    relations:
      'The oesophagus runs straight through the middle of the brain on its way from the mouth to the gut, so the brain forms a ring around it.',
    deeper:
      'In octopuses the mouth is not on the head at all: it lies underneath, at the centre of the ring of arms.',
    basis: 'octopod-general',
    approximation: 'Proportions are approximate.',
    references: ['young1971', 'wells1978'],
    anchor: 'head',
  },
  {
    id: 'eyes',
    name: 'Eyes',
    group: 'external',
    system: 'sensory',
    summary:
      'Large camera-type eyes with a lens, set on raised mounts on top of the head. The pupil is a horizontal slit.',
    func: 'Vision is the main sense used for navigating, finding prey and judging threats. The raised position lets the animal look out while the body stays low, or even while it sits in a burrow.',
    relations:
      'Each eye feeds a large optic lobe directly behind it. What the animal sees drives the patterns it produces on its skin.',
    deeper:
      'Experiments on other octopuses indicate that they do not discriminate colours in the usual way, having a single type of visual pigment. How a colour-blind animal matches coloured surroundings is unresolved; proposed explanations, such as using chromatic blur through the oddly shaped pupil or light-sensitive molecules in the skin, are still hypotheses.',
    basis: 'octopod-general',
    approximation:
      'The papilla drawn above each eye follows photographs and secondary descriptions; primary measurements were not available.',
    references: ['messenger1977', 'hanlon2018'],
    anchor: 'eyes',
  },
  {
    id: 'arms',
    name: 'Eight arms',
    group: 'external',
    system: 'locomotor',
    summary:
      'Eight long, slender arms arranged in a ring around the mouth. They are solid muscle with no skeleton, and each has a large nerve cord running along its centre.',
    func: 'Walking, probing holes for prey, handling food, digging, and forming the postures seen in this animal’s displays.',
    relations:
      'About two thirds of an octopus’s nerve cells lie in the arm nerve cords rather than the brain, so much of the fine control of each arm is handled locally.',
    deeper:
      'This species is classed among octopuses with very long arms, at least about six and a half times the mantle length, and an arm span up to roughly 60 cm has been reported. Like some relatives it can shed an arm at a set point near the base. Arms are numbered in four pairs from front to back: L1 to L4 on the left, R1 to R4 on the right.',
    basis: 'species',
    approximation:
      'Arm length in the model is close to the published ratio but is not measured from a specimen. Each arm is a curve-driven tube, not simulated muscle.',
    references: ['norman2001', 'norman2005', 'huffard2010', 'young1963'],
    anchor: 'arms',
  },
  {
    id: 'web',
    name: 'Arm web',
    group: 'external',
    system: 'locomotor',
    summary: 'A thin sheet of skin and muscle joining the bases of neighbouring arms.',
    func: 'Spread like a parachute, the web closes off the space under the arms. Foraging octopuses flare it over a patch of sand or rubble to trap animals flushed out by the arm tips.',
    relations: 'Works with the arms and suckers during feeding, and adds surface when the animal changes its outline.',
    deeper:
      'Flared webs used to trap fleeing prey are reported for this species on sand flats. No published measurement of web depth was found for this project.',
    basis: 'octopod-general',
    approximation: 'Web depth is an estimate; no primary measurement was available.',
    references: ['hanlon2008', 'hanlon2018'],
    anchor: 'web',
  },
  {
    id: 'suckers',
    name: 'Suckers',
    group: 'external',
    system: 'sensory',
    summary:
      'Muscular cups along the underside of each arm. Each has a flexible outer rim (the infundibulum) and an inner chamber (the acetabulum).',
    func: 'The rim seals against a surface and the chamber muscles then lower the pressure inside, so the sucker grips. Suckers can also pinch, hold and pass small objects along the arm.',
    relations:
      'The rim is packed with sensory cells that respond to touch and to chemicals, so the animal effectively tastes what it touches. Each sucker has its own small ganglion connected to the arm nerve cord.',
    deeper:
      'The species description notes that there are no enlarged suckers. Suckers are generally arranged in two rows in this family; that arrangement is shown here on the strength of secondary sources.',
    basis: 'octopod-general',
    approximation: 'Two rows of simplified cups; the count per arm is illustrative.',
    references: ['kier2002', 'vangiesen2020', 'norman2005'],
    anchor: 'suckers',
  },
  {
    id: 'funnel',
    name: 'Funnel (siphon)',
    group: 'external',
    system: 'locomotor',
    summary: 'A muscular tube opening beside the head from the mantle cavity.',
    func: 'It is the outlet for the water used in breathing and the nozzle for jet propulsion. It also carries away waste and, when released, ink.',
    relations:
      'Because the funnel can be pointed, the animal can jet backward, forward or sideways with the same mantle contraction.',
    deeper: 'Water enters the mantle cavity around the neck and leaves only through the funnel, so flow is one-way.',
    basis: 'octopod-general',
    approximation: 'Position and size are schematic; no primary data for this species.',
    references: ['wells1978', 'hanlon2018'],
    anchor: 'funnel',
  },
  {
    id: 'skin',
    name: 'Skin',
    group: 'external',
    system: 'integument',
    summary:
      'A thin, soft skin containing thousands of colour organs under direct nervous control, above layers of reflecting cells.',
    func: 'Produces the animal’s patterns: drab brown while foraging, or bold dark brown and cream bands. It can also raise small bumps (papillae) to change its texture.',
    relations:
      'Each colour organ is opened by tiny muscles wired to the brain, so the pattern can change in a fraction of a second, guided by what the eyes see.',
    deeper:
      'The banded pattern of this species is changeable, not fixed: it is switched on and off by the nervous system. Its close relative Wunderpus photogenicus, by contrast, is described as having a fixed pattern of white bars and spots. Open the Skin Structure view to see the layers.',
    basis: 'species',
    approximation: 'The pattern is procedural shading, not a photograph-derived texture.',
    references: ['norman2005', 'huffard2010', 'hochberg2006', 'messenger2001'],
    anchor: 'skin',
    preferredMode: 'skin',
  },
  {
    id: 'brain',
    name: 'Brain',
    group: 'internal',
    system: 'nervous',
    summary:
      'A compact mass of fused ganglia between the eyes, wrapped around the oesophagus and enclosed in cartilage. It has a part above the oesophagus and a part below it.',
    func: 'Learning, memory and decision-making, and issuing the high-level commands that start and steer movements.',
    relations:
      'Receives vision through the optic lobes and touch and chemical information from the arms, and sends motor commands down the arm nerve cords and to the skin’s colour organs.',
    deeper:
      'In the common octopus the central brain holds roughly 40 to 50 million neurons out of about 500 million in the whole animal. No counts exist for the mimic octopus itself.',
    basis: 'octopod-general',
    approximation: 'Shown as simplified lobes. Internal lobes are not differentiated.',
    references: ['young1963', 'young1971', 'hochner2012'],
    anchor: 'brain',
    preferredMode: 'xray',
  },
  {
    id: 'optic-lobes',
    name: 'Optic lobes',
    group: 'internal',
    system: 'nervous',
    summary: 'Two large lobes, one behind each eye, connected to the central brain by a short stalk.',
    func: 'Process visual information from the retina. They also take part in controlling body patterning.',
    relations: 'They sit between the eyes and the central brain: vision in, pattern and movement decisions out.',
    deeper:
      'Together the optic lobes of the common octopus contain more neurons than the central brain itself: estimates range from about 90 to 180 million.',
    basis: 'octopod-general',
    approximation: 'Size and shape are schematic.',
    references: ['young1963', 'young1971'],
    anchor: 'optic-lobes',
    preferredMode: 'xray',
  },
  {
    id: 'nervous-system',
    name: 'Arm nerve cords',
    group: 'internal',
    system: 'nervous',
    summary:
      'A thick nerve cord runs down the centre of every arm, with a ganglion for each sucker. The eight cords are linked to one another around the mouth and to the brain.',
    func: 'Local circuits in the cords generate basic arm movements and sucker actions. Two stellate ganglia in the mantle relay commands to the mantle muscles.',
    relations:
      'The brain decides when and where to move; the arm cords work out much of how. Sensory information from the arms also travels back up to the brain.',
    deeper:
      'In the common octopus, roughly 300 to 350 million of about 500 million neurons are in the arms. An arm cut off from the brain can still perform a reaching movement when stimulated. But experiments also show the brain can guide a single arm using vision, and use touch information coming back from that arm. The arms are semi-independent; they are not separate brains.',
    basis: 'octopod-general',
    approximation: 'Cords, nerve ring and stellate ganglia are drawn as simple tubes and nodes.',
    references: ['young1963', 'sumbre2001', 'gutnick2011', 'gutnick2020', 'zullo2009'],
    anchor: 'nervous-system',
    preferredMode: 'neural',
  },
  {
    id: 'gills',
    name: 'Gills',
    group: 'internal',
    system: 'respiratory',
    summary: 'A single pair of feathery gills inside the mantle cavity, one on each side.',
    func: 'Take up oxygen from the water pumped through the mantle cavity and release carbon dioxide.',
    relations: 'Each gill has its own branchial heart that pushes blood through it before the blood returns to the main heart.',
    deeper:
      'Octopus blood carries oxygen with haemocyanin, a copper-based protein that is blue when oxygenated. It carries less oxygen than haemoglobin, which is one reason the circulation needs extra pumps.',
    basis: 'octopod-general',
    approximation: 'Lamellae are simplified discs.',
    references: ['wells1987', 'wells1978'],
    anchor: 'gills',
    preferredMode: 'xray',
  },
  {
    id: 'hearts',
    name: 'Three hearts',
    group: 'internal',
    system: 'circulatory',
    summary: 'One systemic heart in the middle of the mantle and two smaller branchial hearts, one at the base of each gill.',
    func: 'The branchial hearts push oxygen-poor blood through the gills. The systemic heart then pumps the oxygen-rich blood to the rest of the body.',
    relations:
      'The circulation is closed, with blood kept in vessels. The hearts and gills depend on the mantle’s breathing movements, so hard jetting disturbs the flow.',
    deeper:
      'In the model the branchial hearts contract just before the systemic heart, to show the order in which blood moves through them.',
    basis: 'octopod-general',
    approximation: 'Hearts and vessels are schematic; beat timing is illustrative.',
    references: ['wells1987', 'wells1978'],
    anchor: 'hearts',
    preferredMode: 'xray',
  },
  {
    id: 'digestive-system',
    name: 'Digestive system',
    group: 'internal',
    system: 'digestive',
    summary:
      'A U-shaped gut: buccal mass, oesophagus, crop, stomach, caecum and intestine, with a large digestive gland beside it.',
    func: 'Food is cut up in the buccal mass, stored in the crop, ground in the muscular stomach and sorted in the spiral caecum. The digestive gland supplies enzymes and absorbs nutrients.',
    relations:
      'The oesophagus passes through the brain, which limits the size of each mouthful. The intestine bends forward so the anus opens near the funnel, and waste leaves with the outgoing water.',
    deeper:
      'Salivary glands behind the brain produce secretions used to subdue and begin digesting prey. On the sand flats this species feeds mainly on small crustaceans and fish caught with the arms.',
    basis: 'octopod-general',
    approximation: 'Organs are simplified solids; salivary glands are not shown.',
    references: ['wells1978', 'hanlon2008'],
    anchor: 'digestive-system',
    preferredMode: 'xray',
  },
  {
    id: 'beak',
    name: 'Beak',
    group: 'internal',
    system: 'digestive',
    summary:
      'A pair of hard, dark jaws made of chitin and protein, shaped rather like a parrot’s beak, hidden in the buccal mass at the centre of the arms.',
    func: 'Bites and tears prey into pieces small enough to swallow.',
    relations: 'It is the only hard part of the animal, so the beak sets the size of the smallest gap an octopus can squeeze through.',
    deeper: 'The lower jaw overlaps the upper one, the reverse of a parrot’s.',
    basis: 'octopod-general',
    approximation: 'Shown as two simple cones.',
    references: ['wells1978', 'hanlon2018'],
    anchor: 'beak',
    preferredMode: 'isolated',
  },
  {
    id: 'radula',
    name: 'Radula',
    group: 'internal',
    system: 'digestive',
    summary: 'A ribbon carrying rows of tiny teeth, inside the buccal mass behind the beak.',
    func: 'Rasps flesh and moves pieces of food back toward the oesophagus.',
    relations: 'Works together with the beak and the salivary secretions as the first stage of digestion.',
    deeper: 'A toothed radula is a feature octopuses share with snails and most other molluscs.',
    basis: 'octopod-general',
    approximation: 'Greatly enlarged for visibility; the real radula is very small.',
    references: ['wells1978'],
    anchor: 'radula',
    preferredMode: 'isolated',
  },
  {
    id: 'ink-sac',
    name: 'Ink sac',
    group: 'internal',
    system: 'defence',
    summary:
      'In shallow-water octopuses, a small pear-shaped sac lying against the digestive gland, with a duct that opens into the end of the gut near the anus.',
    func: 'Stores ink, a suspension of the dark pigment melanin with mucus. Released through the funnel, it forms a cloud or a blob that can distract a predator.',
    relations: 'Ink leaves by the same route as waste and respiratory water: out of the funnel.',
    deeper:
      'Presence of an ink sac in the mimic octopus could not be confirmed for this project, because the full species description was not accessible. Nothing found says it is absent, and the features that define the genus do not include losing it, so it is shown here as expected but unconfirmed.',
    basis: 'octopod-general',
    approximation: 'Unconfirmed for this species. Position follows general octopus anatomy.',
    references: ['norman2005', 'hanlon2018'],
    anchor: 'ink-sac',
    preferredMode: 'xray',
  },
];

const BY_ID = new Map(ANATOMY_STRUCTURES.map((s) => [s.id, s]));

export function getStructure(id: string | null | undefined): AnatomyStructure | undefined {
  return id ? BY_ID.get(id) : undefined;
}
