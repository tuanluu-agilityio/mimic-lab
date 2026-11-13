import { useTranslation } from 'react-i18next';
import { Refs } from '@/components/Refs';
import { Slider } from '@/components/Slider';
import { StageFrame } from '@/components/StageFrame';
import ui from '@/components/ui.module.css';
import { getMechanism, MECHANISMS, type Mechanism } from '@/data/mechanisms';
import { getLocomotion, LOCOMOTION_MODES } from '@/data/mechanisms/locomotion';
import { CameraControls } from '@/features/camera/CameraControls';
import { useContent } from '@/i18n/content';
import { DEFAULT_ARM_CONTROL, useAppStore } from '@/stores/appStore';
import { ARM_NAMES } from '@/three/animation/types';
import type { MechanismId, MimicryChannelToggles } from '@/types/app';
import { Diagram } from './Diagrams';
import styles from './MechanismStage.module.css';

/** Change step, keeping the skin model's nerve drive in line with the step being explained. */
function goToStep(mechanism: Mechanism, index: number): void {
  const step = mechanism.steps[index];
  if (!step) return;
  const store = useAppStore.getState();
  store.setMechanismStep(index);
  if (step.activation !== undefined) store.setSkinActivation(step.activation);
}

function selectMechanism(id: MechanismId): void {
  useAppStore.getState().setMechanism(id);
  const mechanism = getMechanism(id);
  if (mechanism.steps.length) goToStep(mechanism, 0);
}

function Stepper({ mechanism }: { mechanism: Mechanism }) {
  const raw = useAppStore((s) => s.mechanismStep);
  const index = Math.min(raw, mechanism.steps.length - 1);
  const step = mechanism.steps[index];
  const { t } = useTranslation(['mechanisms', 'common']);
  const steps = useContent().mechanism(mechanism.id).steps;
  return (
    <div className={styles.stepper}>
      <ol className={styles.steps}>
        {mechanism.steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={styles.step}
              aria-current={i === index ? 'step' : undefined}
              data-done={i < index}
              data-testid={`step-${i}`}
              onClick={() => goToStep(mechanism, i)}
            >
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{steps[s.id].title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={ui.calloutCyan} aria-live="polite" data-testid="step-text">
        <span className={ui.calloutLabel}>
          {t('stepOf', { current: index + 1, total: mechanism.steps.length, title: steps[step.id].title })}
        </span>
        <p className={ui.text}>{steps[step.id].text}</p>
      </div>
      <div className={ui.row}>
        <button type="button" className={ui.btnSmall} disabled={index === 0} data-testid="step-prev" onClick={() => goToStep(mechanism, index - 1)}>
          {t('common:playback.previous')}
        </button>
        <button
          type="button"
          className={ui.btnSmall}
          disabled={index === mechanism.steps.length - 1}
          data-testid="step-next"
          onClick={() => goToStep(mechanism, index + 1)}
        >
          {t('common:playback.next')}
        </button>
        <button type="button" className={ui.btnSmall} disabled={index === 0} onClick={() => goToStep(mechanism, 0)}>
          {t('common:playback.restart')}
        </button>
      </div>
    </div>
  );
}

function ArmRig() {
  const ctl = useAppStore((s) => s.armControl);
  const set = useAppStore.getState().setArmControl;
  const deg = (v: number) => `${Math.round((v * 180) / Math.PI)}°`;
  const { t } = useTranslation(['mechanisms', 'common']);
  const armNames = t('armRig.names', { returnObjects: true });
  return (
    <div className={styles.controls}>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>{t('armRig.arm')}</span>
        <div className={ui.segmented} role="group" aria-label={t('armRig.group')}>
          {ARM_NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              className={ui.btnSmall}
              aria-pressed={ctl.arm === i}
              aria-label={armNames[i]}
              title={armNames[i]}
              data-testid={`arm-${i}`}
              onClick={() => set({ arm: i })}
            >
              {name}
            </button>
          ))}
        </div>
        <p className={ui.small}>{t('armRig.numbering')}</p>
      </div>
      <Slider label={t('armRig.extend')} value={ctl.extend} min={0.4} max={1.2} onChange={(extend) => set({ extend })} testId="arm-extend" format={(v) => `${Math.round(v * 100)}%`} />
      <Slider label={t('armRig.lift')} value={ctl.lift} min={-0.3} max={1.3} onChange={(lift) => set({ lift })} testId="arm-lift" format={deg} />
      <Slider label={t('armRig.sweep')} value={ctl.sweep} min={-1} max={1} onChange={(sweep) => set({ sweep })} testId="arm-sweep" format={deg} />
      <Slider label={t('armRig.curl')} value={ctl.curl} min={0} max={3} onChange={(curl) => set({ curl })} testId="arm-curl" format={deg} />
      <div className={ui.row}>
        <button type="button" className={ui.btnSmall} onClick={() => set({ ...DEFAULT_ARM_CONTROL, arm: ctl.arm })}>
          {t('armRig.reset')}
        </button>
      </div>
    </div>
  );
}

function Locomotion() {
  const current = useAppStore((s) => s.locomotion);
  const speed = useAppStore((s) => s.playback.speed);
  const act = useAppStore.getState();
  const mode = getLocomotion(current);
  const { t } = useTranslation(['mechanisms', 'common']);
  const content = useContent();
  return (
    <div className={styles.controls}>
      <div className={ui.segmented} role="group" aria-label={t('locomotion.group')}>
        {LOCOMOTION_MODES.map((m) => (
          <button key={m.id} type="button" className={ui.btnSmall} aria-pressed={current === m.id} data-testid={`loco-${m.id}`} onClick={() => act.setLocomotion(m.id)}>
            {content.locomotion(m.id).name}
          </button>
        ))}
      </div>
      <Slider label={t('common:playback.speed')} value={speed} min={0.25} max={2} step={0.05} onChange={act.setSpeed} testId="loco-speed" format={(v) => `${v.toFixed(2)}×`} />
      {mode && (
        <div className={ui.calloutCyan} aria-live="polite">
          <div className={ui.row}>
            <span className={ui.calloutLabel}>{content.locomotion(mode.id).name}</span>
            <span className={mode.basis === 'species' ? ui.tag : ui.tagAmber}>
              {t(`locomotion.basis.${mode.basis}`)}
            </span>
          </div>
          <p className={ui.text}>{content.locomotion(mode.id).summary}</p>
          <Refs ids={mode.references} />
        </div>
      )}
    </div>
  );
}

const CHANNELS = ['arms', 'body', 'skin', 'movement'] as const satisfies readonly (keyof MimicryChannelToggles)[];

function Channels() {
  const on = useAppStore((s) => s.mimicryChannels);
  const count = CHANNELS.filter((c) => on[c]).length;
  const { t } = useTranslation(['mechanisms', 'common']);
  return (
    <div className={styles.controls}>
      <ul className={styles.channels}>
        {CHANNELS.map((c) => (
          <li key={c}>
            <button
              type="button"
              role="switch"
              aria-checked={on[c]}
              className={styles.channel}
              data-testid={`channel-${c}`}
              onClick={() => useAppStore.getState().toggleMimicryChannel(c)}
            >
              <span className={styles.switch} aria-hidden="true" />
              <span className={styles.channelText}>
                <strong>{t(`channels.${c}.label`)}</strong>
                <span>{t(`channels.${c}.note`)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className={ui.small} aria-live="polite">
        {count === 4 ? t('channels.allOn') : count === 0 ? t('channels.allOff') : t('channels.some', { count })}
      </p>
    </div>
  );
}

function Panel() {
  const id = useAppStore((s) => s.mechanism);
  const mechanism = getMechanism(id);
  const { t } = useTranslation(['mechanisms', 'common']);
  const content = useContent();
  const text = content.mechanism(id);
  return (
    <>
      <div className={ui.panelHeader}>
        <p className={ui.eyebrow}>{t('eyebrow')}</p>
        <h2 className={ui.title}>{t('title')}</h2>
      </div>
      <div className={ui.tabs} role="tablist" aria-label={t('tabs')}>
        {MECHANISMS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            id={`mech-tab-${m.id}`}
            aria-selected={m.id === id}
            aria-controls="mech-panel"
            tabIndex={m.id === id ? 0 : -1}
            className={ui.tab}
            title={content.mechanism(m.id).title}
            data-testid={`mech-${m.id}`}
            onClick={() => selectMechanism(m.id)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
              const i = MECHANISMS.findIndex((x) => x.id === id);
              const next = MECHANISMS[(i + (e.key === 'ArrowRight' ? 1 : MECHANISMS.length - 1)) % MECHANISMS.length];
              selectMechanism(next.id);
              document.getElementById(`mech-tab-${next.id}`)?.focus();
            }}
          >
            <span className={ui.tabNum}>{m.number}</span>
            {t(`short.${m.id}`)}
          </button>
        ))}
      </div>
      <div className={ui.panelBody} role="tabpanel" id="mech-panel" aria-labelledby={`mech-tab-${id}`} data-testid="mech-panel">
        <h3 className={ui.subtitle}>{text.title}</h3>
        <p className={ui.lead}>{text.lead}</p>
        {mechanism.steps.length > 0 && <Stepper mechanism={mechanism} />}
        {id === 'arms' && <ArmRig />}
        {id === 'locomotion' && <Locomotion />}
        {id === 'mimicry' && <Channels />}
        <div className={ui.field}>
          <span className={ui.fieldLabel}>{t('keyPoints')}</span>
          <ul className={ui.bullets}>
            {text.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        {mechanism.diagram && <Diagram id={mechanism.diagram} />}
        {text.caution && (
          <div className={ui.callout}>
            <span className={ui.calloutLabel}>{t('misconception')}</span>
            <p className={ui.text}>
              <strong>{text.caution.claim}</strong>
            </p>
            <p className={ui.text}>{text.caution.correction}</p>
          </div>
        )}
        <p className={ui.small}>
          <strong>{t('basis')}</strong> {text.basisNote}
        </p>
        <Refs ids={mechanism.references} />
      </div>
    </>
  );
}

export function MechanismStage() {
  const { t } = useTranslation(['mechanisms', 'common']);
  return (
    <StageFrame
      stage="mechanisms"
      label={t('sectionLabel')}
      rail={<CameraControls />}
      viewport={<p className={`${ui.hint} ${styles.hint}`}>{t('common:dragHint')}</p>}
      panel={<Panel />}
    />
  );
}
