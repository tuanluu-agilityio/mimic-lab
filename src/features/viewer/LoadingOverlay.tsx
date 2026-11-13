import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import styles from './LoadingOverlay.module.css';

/** Shows real engine build progress; fades out when the scene is ready. */
export function LoadingOverlay() {
  const status = useAppStore((s) => s.engineStatus);
  const progress = useAppStore((s) => s.loadProgress);
  const step = useAppStore((s) => s.loadStep);
  const { t } = useTranslation();
  if (status === 'unsupported') return null;
  const done = status === 'ready';
  return (
    <div className={styles.overlay} data-done={done} aria-hidden={done} data-testid="loading">
      <div className={styles.box} role="status" aria-live="polite">
        {status === 'error' ? (
          <p className={styles.label}>{t('loading.error')}</p>
        ) : (
          <>
            <div
              className={styles.track}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label={t('loading.label')}
            >
              <div className={styles.bar} style={{ transform: `scaleX(${progress})` }} />
            </div>
            <p className={styles.label}>
              <span>{t(`loading.steps.${step}`)}</span>
              <span>{Math.round(progress * 100)}%</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
