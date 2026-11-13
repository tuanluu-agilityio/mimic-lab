import { useTranslation } from 'react-i18next';
import { EvidenceChip } from '@/components/EvidenceChip';
import ui from '@/components/ui.module.css';
import { MIMICRY_TARGETS } from '@/data/mimicry';
import { REFERENCES, type Reference } from '@/data/references';
import { useContent } from '@/i18n/content';
import styles from './SourcesStage.module.css';

const KINDS: Reference['kind'][] = ['peer-reviewed', 'book', 'museum', 'database'];
const LIMITATIONS = ['procedural', 'internal', 'inkSac', 'diagrams', 'curves', 'timing', 'referenceAnimals', 'colours'] as const;
const CREDITS = ['models', 'three', 'tooling', 'fonts'] as const;

function ReferenceEntry({ reference }: { reference: Reference }) {
  const { t } = useTranslation('scientific');
  return (
    <li className={styles.ref} id={`ref-${reference.id}`}>
      {/* Bibliographic details stay in the language of publication. */}
      <p lang="en">
        {reference.authors} ({reference.year}). <strong>{reference.title}</strong>. {reference.source}.
      </p>
      <p className={styles.refMeta}>
        {reference.url && (
          <a href={reference.url} target="_blank" rel="noreferrer">
            {reference.url.replace(/^https?:\/\//, '')}
          </a>
        )}
        <span>{t('references.readAs', { access: t(`references.access.${reference.access}`) })}</span>
      </p>
    </li>
  );
}

export function SourcesStage() {
  const { t } = useTranslation('scientific');
  const content = useContent();
  return (
    <section id="stage-sources" className={styles.stage} data-stage="sources" aria-label={t('sectionLabel')}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={ui.eyebrow}>{t('eyebrow')}</p>
          <h2 className={styles.title}>{t('title')}</h2>
          <p className={ui.lead}>{t('lead')}</p>
        </header>

        <section className={styles.block} aria-labelledby="src-evidence">
          <h3 id="src-evidence" className={ui.subtitle}>
            {t('evidence.heading')}
          </h3>
          <ul className={styles.scale}>
            {(['A', 'B', 'C'] as const).map((level) => (
              <li key={level}>
                <EvidenceChip level={level} />
                <p className={ui.text}>{t(`evidence.levels.${level}.description`)}</p>
              </li>
            ))}
          </ul>
          <div className={styles.tableWrap}>
            <table className={styles.table} data-testid="evidence-table">
              <thead>
                <tr>
                  <th scope="col">{t('evidence.table.number')}</th>
                  <th scope="col">{t('evidence.table.identity')}</th>
                  <th scope="col">{t('evidence.table.grade')}</th>
                  <th scope="col">{t('evidence.table.animation')}</th>
                  <th scope="col">{t('evidence.table.basis')}</th>
                </tr>
              </thead>
              <tbody>
                {MIMICRY_TARGETS.map((target) => (
                  <tr key={target.id}>
                    <td>{String(target.order).padStart(2, '0')}</td>
                    <th scope="row">{content.target(target.id).name}</th>
                    <td>
                      <EvidenceChip level={target.evidenceLevel} />
                    </td>
                    <td>{t(`reconstruction.${target.reconstruction}`)}</td>
                    <td>{content.target(target.id).evidenceDescription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.block} aria-labelledby="src-limits">
          <h3 id="src-limits" className={ui.subtitle}>
            {t('limitations.heading')}
          </h3>
          <ul className={styles.limits} data-testid="limitations">
            {LIMITATIONS.map((id) => (
              <li key={id}>
                <h4>{t(`limitations.items.${id}.title`)}</h4>
                <p className={ui.text}>{t(`limitations.items.${id}.text`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="src-refs">
          <h3 id="src-refs" className={ui.subtitle}>
            {t('references.heading')}
          </h3>
          <p className={ui.small}>{t('references.note')}</p>
          {KINDS.map((kind) => {
            const list = REFERENCES.filter((r) => r.kind === kind);
            if (list.length === 0) return null;
            return (
              <div key={kind} className={ui.field}>
                <span className={ui.fieldLabel}>{t(`references.kinds.${kind}`)}</span>
                <ul className={styles.refs} data-testid={`refs-${kind}`}>
                  {list.map((r) => (
                    <ReferenceEntry key={r.id} reference={r} />
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <section className={styles.block} aria-labelledby="src-credits">
          <h3 id="src-credits" className={ui.subtitle}>
            {t('credits.heading')}
          </h3>
          <dl className={styles.credits}>
            {CREDITS.map((id) => (
              <div key={id}>
                <dt>{t(`credits.items.${id}.name`)}</dt>
                <dd>{t(`credits.items.${id}.detail`)}</dd>
              </div>
            ))}
          </dl>
          <p className={ui.small}>{t('credits.disclaimer')}</p>
        </section>
      </div>
    </section>
  );
}
