import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import styles from './CameraControls.module.css';

const PRESETS = ['front', 'side', 'top', 'rear', 'bottom'] as const;

/** Camera presets and zoom. `below` enables the underside preset (anatomy only). */
export function CameraControls({ below = false }: { below?: boolean }) {
  const ready = useAppStore((s) => s.engineStatus === 'ready');
  const act = useAppStore.getState();
  const { t } = useTranslation();
  if (!ready) return null;
  return (
    <div className={styles.group} role="group" aria-label={t('camera.group')}>
      {PRESETS.filter((name) => below || name !== 'bottom').map((name) => (
        <button
          key={name}
          type="button"
          className={styles.btn}
          title={t(`camera.${name}`)}
          aria-label={t(`camera.${name}`)}
          data-testid={`cam-${name}`}
          onClick={() => act.requestCameraPreset(name)}
        >
          {t(`camera.short.${name}`)}
        </button>
      ))}
      <span className={styles.sep} aria-hidden="true" />
      <button type="button" className={styles.btn} title={t('camera.zoomIn')} aria-label={t('camera.zoomIn')} data-testid="cam-zoom-in" onClick={() => act.requestZoom(1)}>
        +
      </button>
      <button type="button" className={styles.btn} title={t('camera.zoomOut')} aria-label={t('camera.zoomOut')} data-testid="cam-zoom-out" onClick={() => act.requestZoom(-1)}>
        −
      </button>
      <button
        type="button"
        className={styles.btn}
        title={t('camera.reset')}
        aria-label={t('camera.reset')}
        data-testid="cam-reset"
        onClick={() => act.requestCameraPreset('reset')}
      >
        ⟲
      </button>
    </div>
  );
}
