import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';

/** Mirrors the OS "reduce motion" preference into the store so the engine can honour it. */
export function useReducedMotion(): void {
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => useAppStore.setState({ reducedMotion: query.matches });
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);
}
