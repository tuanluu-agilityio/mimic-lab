import { flatfish } from './targets/01-flatfish';
import { lionfish } from './targets/02-lionfish';
import { seaSnake } from './targets/03-sea-snake';
import { stingray } from './targets/04-stingray';
import { snakeEel } from './targets/05-snake-eel';
import { jellyfish } from './targets/06-jellyfish';
import { sponge } from './targets/07-sponge';
import { tunicate } from './targets/08-tunicate';
import { tubeWorm } from './targets/09-tube-worm';
import { anemone } from './targets/10-anemone';
import type { MimicryTarget } from './types';

export * from './types';

/**
 * The ten identities, in display order. To add or change a behaviour, edit or add a file in
 * ./targets and list it here; the engine and UI read everything from this array.
 */
export const MIMICRY_TARGETS: readonly MimicryTarget[] = [
  flatfish,
  lionfish,
  seaSnake,
  stingray,
  snakeEel,
  jellyfish,
  sponge,
  tunicate,
  tubeWorm,
  anemone,
];

const BY_ID = new Map(MIMICRY_TARGETS.map((t) => [t.id, t]));

export function getTarget(id: string | null | undefined): MimicryTarget | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/**
 * Caveats about the mimicry hypothesis as a whole, shown alongside the ten identities.
 * Text lives in `src/i18n/locales/<locale>/mimicry.json` under `caveats.<id>`.
 */
export const MIMICRY_CAVEATS = [
  { id: 'confidence', references: ['norman2001', 'hanlon2008'] },
  { id: 'untested', references: ['huffard2010'] },
  { id: 'toxicity', references: ['huffard2010'] },
  { id: 'counts', references: ['hanlon2008'] },
] as const;
