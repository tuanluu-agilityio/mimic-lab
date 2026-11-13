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

/** Caveats about the mimicry hypothesis as a whole, shown alongside the ten identities. */
export const MIMICRY_CAVEATS: { text: string; references: string[] }[] = [
  {
    text: 'The scientists who first described these behaviours said they were confident about only three: the flatfish, the lionfish and the sea snake. Only the flatfish has been confirmed and counted by an independent team.',
    references: ['norman2001', 'hanlon2008'],
  },
  {
    text: 'No experiment has yet tested whether predators are actually fooled. “Mimicry” here means a resemblance whose protective function is proposed, not proven.',
    references: ['huffard2010'],
  },
  {
    text: 'It is not known whether the mimic octopus is itself distasteful or toxic. Its bold banding could also work as disruptive camouflage or as an honest warning signal.',
    references: ['huffard2010'],
  },
  {
    text: 'Counts of “more than fifteen” imitated species come from popular media. They are not supported by published descriptions.',
    references: ['hanlon2008'],
  },
];
