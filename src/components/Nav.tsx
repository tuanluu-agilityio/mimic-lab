import { QualityControl } from '@/features/viewer/QualityControl';
import { scrollToStage } from '@/hooks/useStageObserver';
import { useAppStore } from '@/stores/appStore';
import type { Stage } from '@/types/app';
import styles from './Nav.module.css';

const LINKS: { stage: Stage; label: string; short: string }[] = [
  { stage: 'intro', label: 'Introduction', short: 'Intro' },
  { stage: 'anatomy', label: 'Anatomy', short: 'Anatomy' },
  { stage: 'mechanisms', label: 'Mechanism Lab', short: 'Lab' },
  { stage: 'mimicry', label: 'Ten Identities', short: 'Ten' },
  { stage: 'sources', label: 'Sources', short: 'Sources' },
];

export function Nav() {
  const stage = useAppStore((s) => s.stage);
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
        Mimic Lab
      </a>
      <nav aria-label="Sections">
        <ul className={styles.links}>
          {LINKS.map((link) => (
            <li key={link.stage}>
              <a
                href={`#stage-${link.stage}`}
                className={styles.link}
                aria-current={stage === link.stage ? 'true' : undefined}
                data-testid={`nav-${link.stage}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToStage(link.stage);
                }}
              >
                <span className={styles.long}>{link.label}</span>
                <span className={styles.short}>{link.short}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <QualityControl />
    </header>
  );
}
