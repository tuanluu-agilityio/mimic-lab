import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';
import { STAGES, type Stage } from '@/types/app';

/** Keeps `stage` in the store equal to the stage section that fills most of the viewport. */
export function useStageObserver(): void {
  useEffect(() => {
    const ratios = new Map<Stage, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Share of the window the stage covers, so stages taller than the window still win.
          const cover = entry.intersectionRect.height / Math.max(1, window.innerHeight);
          ratios.set((entry.target as HTMLElement).dataset.stage as Stage, cover);
        }
        let best: Stage | null = null;
        let bestRatio = 0.4;
        for (const [stage, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = stage;
            bestRatio = ratio;
          }
        }
        if (best) useAppStore.getState().setStage(best);
      },
      { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.28, 0.35, 0.42, 0.5, 0.58, 0.65, 0.8, 1] },
    );
    for (const stage of STAGES) {
      const el = document.getElementById(`stage-${stage}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
}

export function scrollToStage(stage: Stage): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(`stage-${stage}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
