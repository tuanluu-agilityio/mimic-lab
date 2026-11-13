import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { EvidenceChip } from '@/components/EvidenceChip';
import { Refs } from '@/components/Refs';
import { StageFrame } from '@/components/StageFrame';
import ui from '@/components/ui.module.css';
import { COMPARISON_ASPECTS, getTarget, MIMICRY_CAVEATS, MIMICRY_TARGETS, type MimicryTarget } from '@/data/mimicry';
import { CameraControls } from '@/features/camera/CameraControls';
import { useEngine } from '@/hooks/useEngine';
import { useContent } from '@/i18n/content';
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
  const { t } = useTranslation(['mimicry', 'common', 'scientific']);
  const content = useContent();
  return (
    <ul className={styles.strip} aria-label={t('sectionLabel')}>
      {MIMICRY_TARGETS.map((target) => (
        <li key={target.id}>
          <button
            type="button"
            className={styles.card}
            aria-pressed={selected === target.id}
            data-testid={`target-${target.id}`}
            onClick={() => useAppStore.getState().selectTarget(selected === target.id ? null : target.id)}
          >
            <span className={styles.thumb}>
              {thumbs[target.id] && <img src={thumbs[target.id]} alt="" loading="lazy" />}
              <span className={styles.num}>{pad(target.order)}</span>
            </span>
            <span className={styles.cardName}>{content.target(target.id).name}</span>
            <EvidenceChip level={target.evidenceLevel} compact />
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
  const { t } = useTranslation(['mimicry', 'common', 'scientific']);
  const phaseLabel = t(`phases.${playback.phaseId}`);
  return (
    <div className={styles.playback} role="group" aria-label={t('playback.group')} data-testid="playback">
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
        aria-label={t('playback.progress')}
        aria-valuetext={t('playback.valueText', { percent: Math.round(playback.progress * 100), phase: phaseLabel })}
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
          {done ? t('common:playback.replay') : playback.playing ? t('common:playback.pause') : t('common:playback.play')}
        </button>
        <button type="button" className={ui.btnSmall} data-testid="replay" onClick={() => act.replay()}>
          {t('common:playback.restart')}
        </button>
        <span className={styles.phaseLabel} aria-live="polite" data-testid="phase-label">
          {phaseLabel}
        </span>
        <span className={styles.speeds} role="group" aria-label={t('common:playback.speed')}>
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
  const { t } = useTranslation(['mimicry', 'common', 'scientific']);
  const content = useContent();
  return (
    <>
      <p className={ui.lead}>{t('overview.lead')}</p>
      <p className={ui.text}>{t('overview.text')}</p>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>{t('overview.grades')}</span>
        <ul className={styles.legend}>
          {(['A', 'B', 'C'] as const).map((level) => (
            <li key={level}>
              <EvidenceChip level={level} />
              <span className={ui.small}>
                {MIMICRY_TARGETS.filter((x) => x.evidenceLevel === level)
                  .map((x) => content.target(x.id).name)
                  .join(t('common:listSeparator'))}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className={ui.callout} data-testid="caveats">
        <span className={ui.calloutLabel}>{t('overview.unknown')}</span>
        <ul className={ui.bullets}>
          {MIMICRY_CAVEATS.map((c) => (
            <li key={c.id}>{t(`caveats.${c.id}`)}</li>
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
  const { t } = useTranslation(['mimicry', 'common', 'scientific']);
  const text = useContent().target(target.id);
  return (
    <article className={styles.detail} data-testid="target-detail" aria-live="polite">
      <div className={ui.row}>
        <EvidenceChip level={target.evidenceLevel} />
        <span className={target.reconstruction === 'documented' ? ui.tag : ui.tagAmber}>{t(`scientific:reconstruction.${target.reconstruction}`)}</span>
      </div>
      <div>
        <h3 className={ui.subtitle}>
          {pad(target.order)} · {text.name}
        </h3>
        {target.scientificName && (
          <p className={ui.small}>
            {t('detail.proposedModel')} <i lang="la">{target.scientificName}</i>
            {text.modelNote && ` ${text.modelNote}`}
          </p>
        )}
      </div>
      <p className={ui.lead}>{text.tagline}</p>

      <div className={ui.row}>
        <button type="button" className={ui.btnSmall} aria-pressed={comparison} data-testid="compare" onClick={() => act.setComparison(!comparison)}>
          {t('detail.compare')}
        </button>
        {hasBuried && (
          <button type="button" className={ui.btnSmall} aria-pressed={showBuried} data-testid="reveal" onClick={() => act.setShowBuried(!showBuried)}>
            {t('detail.reveal')}
          </button>
        )}
        <button type="button" className={ui.btnSmall} data-testid="rest" onClick={() => act.selectTarget(null)}>
          {t('detail.rest')}
        </button>
      </div>

      <div className={ui.field}>
        <span className={ui.fieldLabel}>{t('detail.evidence')}</span>
        <p className={ui.text}>{text.evidenceDescription}</p>
      </div>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>{t('detail.how')}</span>
        <p className={ui.text}>{text.mechanism}</p>
      </div>
      {text.context && (
        <div className={ui.field}>
          <span className={ui.fieldLabel}>{t('detail.where')}</span>
          <p className={ui.text}>{text.context}</p>
        </div>
      )}

      <div className={ui.field}>
        <span className={ui.fieldLabel}>{t('detail.compared')}</span>
        <table className={styles.table} data-testid="comparison-table">
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">{t('detail.aspect')}</span>
              </th>
              <th scope="col">{text.name}</th>
              <th scope="col">{t('detail.octopus')}</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ASPECTS.map((aspect) => (
              <tr key={aspect}>
                <th scope="row">{t(`aspects.${aspect}`)}</th>
                <td>{text.comparison[aspect].model}</td>
                <td>{text.comparison[aspect].octopus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={ui.callout}>
        <span className={ui.calloutLabel}>{t('detail.aboutAnimation')}</span>
        <p className={ui.small}>{text.reconstructionNote}</p>
        <p className={ui.small}>{text.limitations}</p>
      </div>
      <Refs ids={target.references} />
    </article>
  );
}

function Panel() {
  const target = useAppStore((s) => getTarget(s.mimicryTarget));
  const { t } = useTranslation(['mimicry', 'common', 'scientific']);
  return (
    <>
      <div className={ui.panelHeader}>
        <p className={ui.eyebrow}>{t('eyebrow')}</p>
        <h2 className={ui.title}>{t('title')}</h2>
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
  const { t } = useTranslation(['mimicry', 'common', 'scientific']);
  const content = useContent();
  const text = target && content.target(target.id);
  return (
    <div className={styles.viewport} data-comparison={comparison} style={none}>
      <div className={styles.main} data-viewport="main" style={none}>
        {comparison && <span className={styles.paneLabel}>{t('viewport.mimicOctopus')}</span>}
      </div>
      {target && text && ready && (
        <figure className={styles.reference} style={none} data-testid="reference">
          <div className={styles.referenceView} data-viewport="reference" />
          <figcaption>
            <span className={styles.paneLabel}>{comparison ? text.name : t('viewport.referenceModel')}</span>
            <span className={styles.caption}>{text.referenceCaption}</span>
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
  const { t } = useTranslation(['mimicry', 'common', 'scientific']);
  return (
    <StageFrame
      stage="mimicry"
      label={t('sectionLabel')}
      rail={<CameraControls />}
      viewport={<Viewport />}
      panel={<Panel />}
      customMain
    />
  );
}
