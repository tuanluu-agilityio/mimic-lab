/**
 * Ids of the 3D anchor points the engine can project to the screen (hotspots, camera focus).
 * Kept free of renderer imports so data tests can validate against it.
 */
export const ANCHOR_IDS = [
  // external
  'mantle',
  'head',
  'eyes',
  'arms',
  'web',
  'suckers',
  'funnel',
  'skin',
  // internal
  'brain',
  'optic-lobes',
  'nervous-system',
  'gills',
  'hearts',
  'digestive-system',
  'beak',
  'radula',
  'ink-sac',
] as const;
export type AnchorId = (typeof ANCHOR_IDS)[number];

/** Suggested camera distance when focusing each anchor. */
export const ANCHOR_FOCUS_DISTANCE: Record<AnchorId, number> = {
  mantle: 3.4,
  head: 2.4,
  eyes: 1.7,
  arms: 6.5,
  web: 2.6,
  suckers: 1.9,
  funnel: 1.9,
  skin: 2.6,
  brain: 1.9,
  'optic-lobes': 1.9,
  'nervous-system': 6,
  gills: 2.6,
  hearts: 2.5,
  'digestive-system': 3,
  beak: 1.8,
  radula: 1.6,
  'ink-sac': 2.4,
};

/** Skin-model layer anchors (used for labels in the skin structure view). */
export const SKIN_ANCHOR_IDS = ['epidermis', 'chromatophores', 'iridophores', 'leucophores', 'dermis'] as const;
