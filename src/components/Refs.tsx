import { getReference, shortCitation } from '@/data/references';
import ui from './ui.module.css';

/** Compact list of citations for a piece of content. Full entries are in the Sources stage. */
export function Refs({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <div className={ui.field}>
      <span className={ui.fieldLabel}>Sources</span>
      <div className={ui.refs}>
        {ids.map((id) => {
          const ref = getReference(id);
          const text = shortCitation(id);
          return ref?.url ? (
            <a key={id} className={ui.refLink} href={ref.url} target="_blank" rel="noreferrer" title={ref.title}>
              {text}
            </a>
          ) : (
            <span key={id} className={ui.refLink} title={ref?.title}>
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
