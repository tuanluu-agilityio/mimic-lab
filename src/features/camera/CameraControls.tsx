import { useAppStore } from '@/stores/appStore';
import type { CameraPresetName } from '@/types/app';
import styles from './CameraControls.module.css';

const PRESETS: { name: CameraPresetName; short: string; label: string }[] = [
  { name: 'front', short: 'F', label: 'Front view' },
  { name: 'side', short: 'S', label: 'Side view' },
  { name: 'top', short: 'T', label: 'Top view' },
  { name: 'rear', short: 'R', label: 'Rear view' },
  { name: 'bottom', short: 'U', label: 'Underside view' },
];

/** Camera presets and zoom. `below` enables the underside preset (anatomy only). */
export function CameraControls({ below = false }: { below?: boolean }) {
  const ready = useAppStore((s) => s.engineStatus === 'ready');
  const act = useAppStore.getState();
  if (!ready) return null;
  return (
    <div className={styles.group} role="group" aria-label="Camera">
      {PRESETS.filter((p) => below || p.name !== 'bottom').map((p) => (
        <button
          key={p.name}
          type="button"
          className={styles.btn}
          title={p.label}
          aria-label={p.label}
          data-testid={`cam-${p.name}`}
          onClick={() => act.requestCameraPreset(p.name)}
        >
          {p.short}
        </button>
      ))}
      <span className={styles.sep} aria-hidden="true" />
      <button type="button" className={styles.btn} title="Zoom in" aria-label="Zoom in" data-testid="cam-zoom-in" onClick={() => act.requestZoom(1)}>
        +
      </button>
      <button type="button" className={styles.btn} title="Zoom out" aria-label="Zoom out" data-testid="cam-zoom-out" onClick={() => act.requestZoom(-1)}>
        −
      </button>
      <button
        type="button"
        className={styles.btn}
        title="Reset camera"
        aria-label="Reset camera"
        data-testid="cam-reset"
        onClick={() => act.requestCameraPreset('reset')}
      >
        ⟲
      </button>
    </div>
  );
}
