import { useAppStore } from '@/stores/appStore';
import type { QualitySetting } from '@/types/app';
import styles from './QualityControl.module.css';

const OPTIONS: { value: QualitySetting; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/** Rendering quality selector. "Auto" follows the measured frame rate. */
export function QualityControl() {
  const quality = useAppStore((s) => s.quality);
  const effective = useAppStore((s) => s.effectiveQuality);
  const fps = useAppStore((s) => s.fps);
  const status = useAppStore((s) => s.engineStatus);
  if (status !== 'ready') return null;
  return (
    <label className={styles.wrap} title={`Rendering quality. Currently ${effective}, about ${fps} frames per second.`}>
      <span className="visually-hidden">Rendering quality</span>
      <span className={styles.fps} aria-hidden="true">
        {fps > 0 ? `${fps} fps` : ''}
      </span>
      <select
        className={styles.select}
        value={quality}
        data-testid="quality"
        onChange={(e) => useAppStore.getState().setQuality(e.target.value as QualitySetting)}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value === 'auto' ? `Auto (${effective})` : o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
