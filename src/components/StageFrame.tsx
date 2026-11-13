import type { ReactNode } from 'react';
import type { Stage } from '@/types/app';
import ui from './ui.module.css';

interface Props {
  stage: Stage;
  label: string;
  rail?: ReactNode;
  /** Overlays positioned inside the free viewer area. */
  viewport?: ReactNode;
  panel?: ReactNode;
  panelLabel?: string;
  /** The viewport content supplies its own `[data-viewport="main"]` element (split layouts). */
  customMain?: boolean;
}

/**
 * One full-height scroll stage: tool rail, free viewer area and a docked panel.
 * The `[data-viewport="main"]` element tells the engine where to centre the animal.
 */
export function StageFrame({ stage, label, rail, viewport, panel, panelLabel, customMain }: Props) {
  return (
    <section id={`stage-${stage}`} className={ui.stage} aria-label={label} data-stage={stage}>
      {rail ? <div className={ui.rail}>{rail}</div> : <div aria-hidden="true" />}
      <div className={ui.viewport} data-viewport={customMain ? undefined : 'main'}>
        {viewport}
      </div>
      {panel ? (
        <aside className={ui.panel} aria-label={panelLabel ?? label}>
          {panel}
        </aside>
      ) : (
        <div aria-hidden="true" />
      )}
    </section>
  );
}
