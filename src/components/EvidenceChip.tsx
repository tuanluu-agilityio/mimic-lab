import { EVIDENCE_LABELS } from '@/data/mimicry';
import type { EvidenceLevel } from '@/types/app';
import styles from './EvidenceChip.module.css';

/**
 * Evidence grade. The grade is conveyed by the letter, the word and the fill pattern of the
 * marker (solid / half / outline), never by colour alone.
 */
export function EvidenceChip({ level, compact = false }: { level: EvidenceLevel; compact?: boolean }) {
  const { word, description } = EVIDENCE_LABELS[level];
  return (
    <span className={styles.chip} data-level={level} title={description}>
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.letter}>{level}</span>
      {!compact && <span className={styles.word}>{word}</span>}
      <span className="visually-hidden">
        {compact ? `${word}. ` : ''}Evidence grade {level}: {description}
      </span>
    </span>
  );
}
