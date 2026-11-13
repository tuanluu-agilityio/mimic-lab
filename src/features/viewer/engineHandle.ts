import type { Engine } from '@/three/core/Engine';

/**
 * The single live engine instance, shared with UI pieces that need to talk to it directly
 * (hotspot projection, thumbnails). Everything else goes through the store.
 */
let current: Engine | null = null;
const listeners = new Set<(engine: Engine | null) => void>();

export function setEngine(engine: Engine | null): void {
  current = engine;
  for (const fn of listeners) fn(engine);
}

export function getEngine(): Engine | null {
  return current;
}

export function onEngineChange(fn: (engine: Engine | null) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
