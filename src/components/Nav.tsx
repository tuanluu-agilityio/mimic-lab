import { useTranslation } from 'react-i18next';
import { QualityControl } from '@/features/viewer/QualityControl';
import { scrollToStage } from '@/hooks/useStageObserver';
import { useAppStore } from '@/stores/appStore';
import type { Stage } from '@/types/app';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Nav.module.css';

const LINKS: Stage[] = ['intro', 'anatomy', 'mechanisms', 'mimicry', 'sources'];

export function Nav() {
  const stage = useAppStore((s) => s.stage);
  const { t } = useTranslation('navigation');
  return (
    <header className={styles.nav}>
      <a
        className={styles.brand}
        href="#stage-intro"
        onClick={(e) => {
          e.preventDefault();
          scrollToStage('intro');
        }}
      >
        <span className={styles.brandMark} aria-hidden="true" />
        <span className={styles.brandName} lang="en">
          {t('brand')}
        </span>
      </a>
      <nav aria-label={t('sections')}>
        <ul className={styles.links}>
          {LINKS.map((link) => (
            <li key={link}>
              <a
                href={`#stage-${link}`}
                className={styles.link}
                aria-current={stage === link ? 'true' : undefined}
                data-testid={`nav-${link}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToStage(link);
                }}
              >
                <span className={styles.long}>{t(`links.${link}.label`)}</span>
                <span className={styles.short}>{t(`links.${link}.short`)}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.tools}>
        <QualityControl />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
