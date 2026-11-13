import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import { isWebGLAvailable } from '@/three/core/webgl';
import { setEngine } from './engineHandle';
import styles from './Viewer.module.css';

/**
 * One engine at a time may own the canvas's WebGL context. React's StrictMode mounts effects
 * twice in development; two renderers created on the same canvas share one context but keep
 * separate state caches, which intermittently rendered the scene black. Each start therefore
 * waits for the previous one to finish (and, if it was cancelled, to have created nothing).
 */
let engineSlot: Promise<void> = Promise.resolve();

/**
 * The persistent WebGL canvas behind every stage. The engine (and Three.js with it) is a
 * separate chunk loaded after first paint, so the title is readable immediately.
 */
export function Viewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const status = useAppStore((s) => s.engineStatus);
  const { t } = useTranslation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const store = useAppStore;
    if (!isWebGLAvailable()) {
      store.setState({ engineStatus: 'unsupported' });
      return;
    }
    let cancelled = false;
    let dispose: (() => void) | undefined;
    store.setState({ engineStatus: 'loading', loadProgress: 0.05, loadStep: 'engine' });
    engineSlot = engineSlot.then(async () => {
      if (cancelled) return;
      try {
        const { Engine } = await import('@/three/core/Engine');
        const engine = await Engine.create(canvas, (loadProgress, loadStep) => {
          if (!cancelled) store.setState({ loadProgress, loadStep });
        });
        if (cancelled) {
          engine.dispose();
          return;
        }
        dispose = () => engine.dispose();
        setEngine(engine);
        // Test and debugging hook; not used by the application itself.
        (window as unknown as { __MIMIC__?: unknown }).__MIMIC__ = {
          debug: () => engine.debug(),
          dispose: () => {
            engine.dispose();
            setEngine(null);
            return engine.renderer.info.memory;
          },
          store,
        };
        store.setState({ engineStatus: 'ready', loadProgress: 1 });
      } catch (error: unknown) {
        console.error('[mimic-lab] engine failed to start', error);
        if (!cancelled) store.setState({ engineStatus: 'error' });
      }
    });
    return () => {
      cancelled = true;
      setEngine(null);
      dispose?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      data-ready={status === 'ready'}
      tabIndex={0}
      role="img"
      aria-label={t('canvasLabel')}
    />
  );
}
