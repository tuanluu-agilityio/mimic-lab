import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/appStore';
import { isWebGLAvailable } from '@/three/core/webgl';
import { setEngine } from './engineHandle';
import styles from './Viewer.module.css';

/**
 * The persistent WebGL canvas behind every stage. The engine (and Three.js with it) is a
 * separate chunk loaded after first paint, so the title is readable immediately.
 */
export function Viewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const status = useAppStore((s) => s.engineStatus);

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
    store.setState({ engineStatus: 'loading', loadProgress: 0.05, loadLabel: 'Loading the 3D engine' });
    import('@/three/core/Engine')
      .then(({ Engine }) =>
        Engine.create(canvas, (loadProgress, loadLabel) => {
          if (!cancelled) store.setState({ loadProgress, loadLabel });
        }),
      )
      .then((engine) => {
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
      })
      .catch((error: unknown) => {
        console.error('[mimic-lab] engine failed to start', error);
        if (!cancelled) store.setState({ engineStatus: 'error' });
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
      aria-label="Interactive 3D model of the mimic octopus. Drag to rotate; arrow keys rotate, plus and minus zoom."
    />
  );
}
