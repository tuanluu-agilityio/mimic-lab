import { useTranslation } from 'react-i18next';
import type { EvidenceLevel } from '@/types/app';
import styles from './EvidenceChip.module.css';

/**
 * Evidence grade. The grade is conveyed by the letter, the word and the fill pattern of the
 * marker (solid / half / outline), never by colour alone.
 */
export function EvidenceChip({ level, compact = false }: { level: EvidenceLevel; compact?: boolean }) {
  const { t } = useTranslation('scientific');
  const word = t(`evidence.levels.${level}.word`);
  const description = t(`evidence.levels.${level}.description`);
  return (
    <span className={styles.chip} data-level={level} title={description}>
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.letter}>{level}</span>
      {!compact && <span className={styles.word}>{word}</span>}
      <span className="visually-hidden">
        {compact ? `${word}. ` : ''}
        {t('evidence.srGrade', { level, description })}
      </span>
    </span>
  );
}
