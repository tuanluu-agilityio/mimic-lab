import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/appStore';
import { QUALITY_LEVELS, type QualitySetting } from '@/types/app';
import styles from './QualityControl.module.css';

/** Rendering quality selector. "Auto" follows the measured frame rate. */
export function QualityControl() {
  const quality = useAppStore((s) => s.quality);
  const effective = useAppStore((s) => s.effectiveQuality);
  const fps = useAppStore((s) => s.fps);
  const status = useAppStore((s) => s.engineStatus);
  const { t } = useTranslation();
  if (status !== 'ready') return null;
  const level = t(`quality.levels.${effective}`);
  return (
    <label className={styles.wrap} title={t('quality.title', { level, fps })}>
      <span className="visually-hidden">{t('quality.label')}</span>
      <span className={styles.fps} aria-hidden="true">
        {fps > 0 ? t('quality.fps', { fps }) : ''}
      </span>
      <select
        className={styles.select}
        value={quality}
        data-testid="quality"
        onChange={(e) => useAppStore.getState().setQuality(e.target.value as QualitySetting)}
      >
        <option value="auto">{t('quality.auto', { level })}</option>
        {QUALITY_LEVELS.map((value) => (
          <option key={value} value={value}>
            {t(`quality.options.${value}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
