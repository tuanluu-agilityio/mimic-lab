import { useAppStore } from '@/stores/appStore';
import styles from './LoadingOverlay.module.css';

/** Shows real engine build progress; fades out when the scene is ready. */
export function LoadingOverlay() {
  const status = useAppStore((s) => s.engineStatus);
  const progress = useAppStore((s) => s.loadProgress);
  const label = useAppStore((s) => s.loadLabel);
  if (status === 'unsupported') return null;
  const done = status === 'ready';
  return (
    <div className={styles.overlay} data-done={done} aria-hidden={done} data-testid="loading">
      <div className={styles.box} role="status" aria-live="polite">
        {status === 'error' ? (
          <p className={styles.label}>
            The 3D scene could not start on this device. The written content is still available below.
          </p>
        ) : (
          <>
            <div
              className={styles.track}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label="Loading the 3D scene"
            >
              <div className={styles.bar} style={{ transform: `scaleX(${progress})` }} />
            </div>
            <p className={styles.label}>
              <span>{label}</span>
              <span>{Math.round(progress * 100)}%</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
