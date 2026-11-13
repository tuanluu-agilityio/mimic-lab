import { useTranslation } from 'react-i18next';
import { scrollToStage } from '@/hooks/useStageObserver';
import { useAppStore } from '@/stores/appStore';
import ui from '@/components/ui.module.css';
import styles from './IntroStage.module.css';

export function IntroStage() {
  const status = useAppStore((s) => s.engineStatus);
  const { t } = useTranslation(['home', 'common']);
  const noScene = status === 'unsupported' || status === 'error';
  return (
    <section id="stage-intro" className={styles.stage} data-stage="intro" aria-label={t('sectionLabel')}>
      <div className={styles.copy}>
        <p className={ui.eyebrow}>
          <i lang="la">Thaumoctopus mimicus</i> · {t('eyebrow')}
        </p>
        <h1 className={styles.title} lang="en">
          {t('title')}
        </h1>
        <p className={styles.tagline}>{t('tagline')}</p>
        <p className={styles.lead}>{t('lead')}</p>
        <div className={styles.actions}>
          <button type="button" className={ui.btnPrimary} data-testid="cta-anatomy" onClick={() => scrollToStage('anatomy')}>
            {t('ctaAnatomy')}
          </button>
          <button type="button" className={ui.btnGhost} data-testid="cta-mimicry" onClick={() => scrollToStage('mimicry')}>
            {t('ctaMimicry')}
          </button>
        </div>
        {noScene && (
          <div className={ui.callout} role="note" data-testid="fallback">
            <span className={ui.calloutLabel}>{t('common:fallback.label')}</span>
            <p className={ui.small}>{t('common:fallback.text')}</p>
          </div>
        )}
        <p className={styles.note}>{t('note')}</p>
      </div>
      <div className={styles.view} data-viewport="main" />
    </section>
  );
}
