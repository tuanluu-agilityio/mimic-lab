import { scrollToStage } from '@/hooks/useStageObserver';
import { useAppStore } from '@/stores/appStore';
import ui from '@/components/ui.module.css';
import styles from './IntroStage.module.css';

export function IntroStage() {
  const status = useAppStore((s) => s.engineStatus);
  const noScene = status === 'unsupported' || status === 'error';
  return (
    <section id="stage-intro" className={styles.stage} data-stage="intro" aria-label="Introduction">
      <div className={styles.copy}>
        <p className={ui.eyebrow}>
          <i>Thaumoctopus mimicus</i> · the mimic octopus
        </p>
        <h1 className={styles.title}>Mimic Lab</h1>
        <p className={styles.tagline}>One Organism. Ten Identities. Infinite Possibilities.</p>
        <p className={styles.lead}>
          A small octopus from the sandy shallows of the Indo-West Pacific that reshapes its arms, body, colour and
          movement to resemble other animals. Explore how its body works, and how strong the evidence is for each of
          the ten identities it is said to take on.
        </p>
        <div className={styles.actions}>
          <button type="button" className={ui.btnPrimary} data-testid="cta-anatomy" onClick={() => scrollToStage('anatomy')}>
            Explore the creature
          </button>
          <button type="button" className={ui.btnGhost} data-testid="cta-mimicry" onClick={() => scrollToStage('mimicry')}>
            Discover its identities
          </button>
        </div>
        {noScene && (
          <div className={ui.callout} role="note" data-testid="fallback">
            <span className={ui.calloutLabel}>3D view unavailable</span>
            <p className={ui.small}>
              This browser or device could not start WebGL, so the interactive model is not shown. Every explanation,
              evidence grade and source on this page is still available in the sections below.
            </p>
          </div>
        )}
        <p className={styles.note}>
          The animal shown is a procedural, schematic 3D model built for this site. It is not a scan of a real
          specimen.
        </p>
      </div>
      <div className={styles.view} data-viewport="main" />
    </section>
  );
}
