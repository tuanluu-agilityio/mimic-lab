import { useEffect, useState, type CSSProperties } from 'react';
import { EvidenceChip } from '@/components/EvidenceChip';
import { Refs } from '@/components/Refs';
import { StageFrame } from '@/components/StageFrame';
import ui from '@/components/ui.module.css';
import { getTarget, MIMICRY_CAVEATS, MIMICRY_TARGETS, RECONSTRUCTION_LABELS, type MimicryTarget } from '@/data/mimicry';
import { CameraControls } from '@/features/camera/CameraControls';
import { useEngine } from '@/hooks/useEngine';
import { useAppStore } from '@/stores/appStore';
import styles from './MimicryStage.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** Stills of the ten reference animals, rendered by the engine the first time this stage is visited. */
function useThumbnails(): Record<string, string> {
  const engine = useEngine();
  const visited = useAppStore((s) => s.stage === 'mimicry');
  const [started, setStarted] = useState(false);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  useEffect(() => {
    if (visited) setStarted(true);
  }, [visited]);
  useEffect(() => {
    if (!engine || !started) return;
    let cancelled = false;
    for (const target of MIMICRY_TARGETS) {
      engine
        .renderThumbnail(target.referenceModel)
        .then((url) => {
          if (!cancelled && url) setThumbs((t) => ({ ...t, [target.id]: url }));
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [engine, started]);
  return thumbs;
}

function Filmstrip() {
  const selected = useAppStore((s) => s.mimicryTarget);
  const thumbs = useThumbnails();
  return (
    <ul className={styles.strip} aria-label="Ten identities">
      {MIMICRY_TARGETS.map((t) => (
        <li key={t.id}>
          <button
            type="button"
            className={styles.card}
            aria-pressed={selected === t.id}
            data-testid={`target-${t.id}`}
            onClick={() => useAppStore.getState().selectTarget(selected === t.id ? null : t.id)}
          >
            <span className={styles.thumb}>
              {thumbs[t.id] && <img src={thumbs[t.id]} alt="" loading="lazy" />}
              <span className={styles.num}>{pad(t.order)}</span>
            </span>
            <span className={styles.cardName}>{t.name}</span>
            <EvidenceChip level={t.evidenceLevel} compact />
          </button>
        </li>
      ))}
    </ul>
  );
}

function PlaybackBar({ target }: { target: MimicryTarget }) {
  const playback = useAppStore((s) => s.playback);
  const act = useAppStore.getState();
  const phases = target.transitionSequence.phases;
  const done = playback.progress >= 0.999;
  return (
    <div className={styles.playback} role="group" aria-label="Transformation playback" data-testid="playback">
      <div className={styles.phaseTrack} aria-hidden="true">
        {phases.map((p) => (
          <span
            key={p.id}
            className={styles.phase}
            data-active={p.id === playback.phaseId}
            style={{ left: `${p.start * 100}%`, width: `${(p.end - p.start) * 100}%` }}
          />
        ))}
      </div>
      <input
        className={`${ui.slider} ${styles.scrub}`}
        style={{ '--fill': `${playback.progress * 100}%` } as CSSProperties}
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={playback.progress}
        aria-label="Transformation progress"
        aria-valuetext={`${Math.round(playback.progress * 100)}%, ${playback.phaseLabel}`}
        data-testid="scrub"
        onChange={(e) => {
          act.setPlaying(false);
          act.seek(Number(e.target.value));
        }}
      />
      <div className={styles.playRow}>
        <button
          type="button"
          className={ui.btnSmall}
          data-testid="play-toggle"
          onClick={() => (done ? act.replay() : act.setPlaying(!playback.playing))}
        >
          {done ? 'Replay' : playback.playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className={ui.btnSmall} data-testid="replay" onClick={() => act.replay()}>
          Restart
        </button>
        <span className={styles.phaseLabel} aria-live="polite" data-testid="phase-label">
          {playback.phaseLabel}
        </span>
        <span className={styles.speeds} role="group" aria-label="Playback speed">
          {[0.5, 1, 2].map((v) => (
            <button key={v} type="button" className={ui.btnSmall} aria-pressed={playback.speed === v} data-testid={`speed-${v}`} onClick={() => act.setSpeed(v)}>
              {v}×
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}

function Overview() {
  return (
    <>
      <p className={ui.lead}>
        Ten resemblances are commonly attributed to the mimic octopus. They are not equally well supported. Each one
        below carries an evidence grade, and each animation says how much of it follows published descriptions.
      </p>
      <p className={ui.text}>
        Choose an identity from the strip under the model. The octopus stays an octopus throughout: watch which arms
        move, how the body and skin change, and what is left over.
      </p>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>Evidence grades</span>
        <ul className={styles.legend}>
          {(['A', 'B', 'C'] as const).map((level) => (
            <li key={level}>
              <EvidenceChip level={level} />
              <span className={ui.small}>
                {MIMICRY_TARGETS.filter((t) => t.evidenceLevel === level)
                  .map((t) => t.name)
                  .join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className={ui.callout} data-testid="caveats">
        <span className={ui.calloutLabel}>What is not known</span>
        <ul className={ui.bullets}>
          {MIMICRY_CAVEATS.map((c) => (
            <li key={c.text}>{c.text}</li>
          ))}
        </ul>
        <Refs ids={[...new Set(MIMICRY_CAVEATS.flatMap((c) => c.references))]} />
      </div>
    </>
  );
}

function Detail({ target }: { target: MimicryTarget }) {
  const comparison = useAppStore((s) => s.comparison);
  const showBuried = useAppStore((s) => s.showBuried);
  const act = useAppStore.getState();
  const hasBuried = target.pose.arms.some((a) => a.bury > 0.05);
  return (
    <article className={styles.detail} data-testid="target-detail" aria-live="polite">
      <div className={ui.row}>
        <EvidenceChip level={target.evidenceLevel} />
        <span className={target.reconstruction === 'documented' ? ui.tag : ui.tagAmber}>{RECONSTRUCTION_LABELS[target.reconstruction]}</span>
      </div>
      <div>
        <h3 className={ui.subtitle}>
          {pad(target.order)} · {target.name}
        </h3>
        {target.scientificName && (
          <p className={ui.small}>
            Proposed model: <i>{target.scientificName}</i>
          </p>
        )}
      </div>
      <p className={ui.lead}>{target.tagline}</p>

      <div className={ui.row}>
        <button type="button" className={ui.btnSmall} aria-pressed={comparison} data-testid="compare" onClick={() => act.setComparison(!comparison)}>
          Compare side by side
        </button>
        {hasBuried && (
          <button type="button" className={ui.btnSmall} aria-pressed={showBuried} data-testid="reveal" onClick={() => act.setShowBuried(!showBuried)}>
            Reveal hidden arms
          </button>
        )}
        <button type="button" className={ui.btnSmall} data-testid="rest" onClick={() => act.selectTarget(null)}>
          Return to rest
        </button>
      </div>

      <div className={ui.field}>
        <span className={ui.fieldLabel}>Evidence</span>
        <p className={ui.text}>{target.evidenceDescription}</p>
      </div>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>How the resemblance is made</span>
        <p className={ui.text}>{target.educationalContent.mechanism}</p>
      </div>
      {target.educationalContent.context && (
        <div className={ui.field}>
          <span className={ui.fieldLabel}>Where it has been seen</span>
          <p className={ui.text}>{target.educationalContent.context}</p>
        </div>
      )}

      <div className={ui.field}>
        <span className={ui.fieldLabel}>Model animal and octopus compared</span>
        <table className={styles.table} data-testid="comparison-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">Aspect</span>
              </th>
              <th scope="col">{target.name}</th>
              <th scope="col">Octopus</th>
            </tr>
          </thead>
          <tbody>
            {target.educationalContent.comparison.map((row) => (
              <tr key={row.aspect}>
                <th scope="row">{row.aspect}</th>
                <td>{row.model}</td>
                <td>{row.octopus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={ui.callout}>
        <span className={ui.calloutLabel}>About this animation</span>
        <p className={ui.small}>{target.reconstructionNote}</p>
        <p className={ui.small}>{target.limitations}</p>
      </div>
      <Refs ids={target.references} />
    </article>
  );
}

function Panel() {
  const target = useAppStore((s) => getTarget(s.mimicryTarget));
  return (
    <>
      <div className={ui.panelHeader}>
        <p className={ui.eyebrow}>03 · Ten identities</p>
        <h2 className={ui.title}>What it is said to imitate</h2>
      </div>
      <div className={ui.panelBody}>{target ? <Detail target={target} /> : <Overview />}</div>
    </>
  );
}

function Viewport() {
  const target = useAppStore((s) => getTarget(s.mimicryTarget));
  const comparison = useAppStore((s) => s.comparison && s.mimicryTarget !== null);
  const ready = useAppStore((s) => s.engineStatus === 'ready');
  const none: CSSProperties = { pointerEvents: 'none' };
  return (
    <div className={styles.viewport} data-comparison={comparison} style={none}>
      <div className={styles.main} data-viewport="main" style={none}>
        {comparison && <span className={styles.paneLabel}>Mimic octopus</span>}
      </div>
      {target && ready && (
        <figure className={styles.reference} style={none} data-testid="reference">
          <div className={styles.referenceView} data-viewport="reference" />
          <figcaption>
            <span className={styles.paneLabel}>{comparison ? target.name : 'Reference model'}</span>
            <span className={styles.caption}>{target.referenceCaption}</span>
          </figcaption>
        </figure>
      )}
      <div className={styles.dock}>
        {target && ready && <PlaybackBar target={target} />}
        <Filmstrip />
      </div>
    </div>
  );
}

export function MimicryStage() {
  return (
    <StageFrame
      stage="mimicry"
      label="Ten identities"
      rail={<CameraControls />}
      viewport={<Viewport />}
      panel={<Panel />}
      customMain
    />
  );
}
