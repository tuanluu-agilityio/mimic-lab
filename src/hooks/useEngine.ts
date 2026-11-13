import { useSyncExternalStore } from 'react';
import { getEngine, onEngineChange } from '@/features/viewer/engineHandle';

/** The live engine, or null while it is loading / unavailable. */
export function useEngine() {
  return useSyncExternalStore(onEngineChange, getEngine, () => null);
}
