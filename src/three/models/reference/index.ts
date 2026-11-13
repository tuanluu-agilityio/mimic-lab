import type { ReferenceModelId } from '@/types/app';
import type { ReferenceModel } from './kit';

export type { ReferenceModel } from './kit';

/**
 * Lazy registry: a reference model's code is only downloaded and its geometry only built
 * when that model is first shown. Callers must dispose the model when they are done with it.
 */
const LOADERS: Record<ReferenceModelId, () => Promise<ReferenceModel>> = {
  flatfish: () => import('./swimmers').then((m) => m.buildFlatfish()),
  lionfish: () => import('./swimmers').then((m) => m.buildLionfish()),
  'sea-snake': () => import('./swimmers').then((m) => m.buildSeaSnake()),
  stingray: () => import('./swimmers').then((m) => m.buildStingray()),
  'snake-eel': () => import('./swimmers').then((m) => m.buildSnakeEel()),
  jellyfish: () => import('./others').then((m) => m.buildJellyfish()),
  sponge: () => import('./others').then((m) => m.buildSponge()),
  tunicate: () => import('./others').then((m) => m.buildTunicate()),
  'tube-worm': () => import('./others').then((m) => m.buildTubeWorm()),
  anemone: () => import('./others').then((m) => m.buildAnemone()),
};

export function loadReferenceModel(id: ReferenceModelId): Promise<ReferenceModel> {
  return LOADERS[id]();
}
