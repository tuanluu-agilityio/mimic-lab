import { Refs } from '@/components/Refs';
import { Slider } from '@/components/Slider';
import { StageFrame } from '@/components/StageFrame';
import ui from '@/components/ui.module.css';
import { getMechanism, MECHANISMS, type Mechanism } from '@/data/mechanisms';
import { getLocomotion, LOCOMOTION_MODES } from '@/data/mechanisms/locomotion';
import { CameraControls } from '@/features/camera/CameraControls';
import { DEFAULT_ARM_CONTROL, useAppStore } from '@/stores/appStore';
import { ARM_NAMES } from '@/three/animation/types';
import type { MechanismId, MimicryChannelToggles } from '@/types/app';
import { Diagram } from './Diagrams';
import styles from './MechanismStage.module.css';

const SHORT: Record<MechanismId, string> = {
  nervous: 'Nerves',
  skin: 'Skin',
  arms: 'Arms',
  locomotion: 'Motion',
  mimicry: 'Mimicry',
};

const ARM_LABELS = ['Left 1', 'Right 1', 'Left 2', 'Right 2', 'Left 3', 'Right 3', 'Left 4', 'Right 4'];

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
              <span>{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={ui.calloutCyan} aria-live="polite" data-testid="step-text">
        <span className={ui.calloutLabel}>
          Step {index + 1} of {mechanism.steps.length} · {step.title}
        </span>
        <p className={ui.text}>{step.text}</p>
      </div>
      <div className={ui.row}>
        <button type="button" className={ui.btnSmall} disabled={index === 0} data-testid="step-prev" onClick={() => goToStep(mechanism, index - 1)}>
          ← Previous
        </button>
        <button
          type="button"
          className={ui.btnSmall}
          disabled={index === mechanism.steps.length - 1}
          data-testid="step-next"
          onClick={() => goToStep(mechanism, index + 1)}
        >
          Next →
        </button>
        <button type="button" className={ui.btnSmall} disabled={index === 0} onClick={() => goToStep(mechanism, 0)}>
          Restart
        </button>
      </div>
    </div>
  );
}

function ArmRig() {
  const ctl = useAppStore((s) => s.armControl);
  const set = useAppStore.getState().setArmControl;
  const deg = (v: number) => `${Math.round((v * 180) / Math.PI)}°`;
  return (
    <div className={styles.controls}>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>Arm</span>
        <div className={ui.segmented} role="group" aria-label="Arm to move">
          {ARM_NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              className={ui.btnSmall}
              aria-pressed={ctl.arm === i}
              aria-label={`${ARM_LABELS[i]} arm`}
              title={`${ARM_LABELS[i]} arm`}
              data-testid={`arm-${i}`}
              onClick={() => set({ arm: i })}
            >
              {name}
            </button>
          ))}
        </div>
        <p className={ui.small}>Arms are numbered in pairs from the front: L1 and R1 are the front pair.</p>
      </div>
      <Slider label="Extend" value={ctl.extend} min={0.4} max={1.2} onChange={(extend) => set({ extend })} testId="arm-extend" format={(v) => `${Math.round(v * 100)}%`} />
      <Slider label="Lift" value={ctl.lift} min={-0.3} max={1.3} onChange={(lift) => set({ lift })} testId="arm-lift" format={deg} />
      <Slider label="Sweep" value={ctl.sweep} min={-1} max={1} onChange={(sweep) => set({ sweep })} testId="arm-sweep" format={deg} />
      <Slider label="Curl the tip" value={ctl.curl} min={0} max={3} onChange={(curl) => set({ curl })} testId="arm-curl" format={deg} />
      <div className={ui.row}>
        <button type="button" className={ui.btnSmall} onClick={() => set({ ...DEFAULT_ARM_CONTROL, arm: ctl.arm })}>
          Reset this arm
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
  return (
    <div className={styles.controls}>
      <div className={ui.segmented} role="group" aria-label="Way of moving">
        {LOCOMOTION_MODES.map((m) => (
          <button key={m.id} type="button" className={ui.btnSmall} aria-pressed={current === m.id} data-testid={`loco-${m.id}`} onClick={() => act.setLocomotion(m.id)}>
            {m.name}
          </button>
        ))}
      </div>
      <Slider label="Playback speed" value={speed} min={0.25} max={2} step={0.05} onChange={act.setSpeed} testId="loco-speed" format={(v) => `${v.toFixed(2)}×`} />
      {mode && (
        <div className={ui.calloutCyan} aria-live="polite">
          <div className={ui.row}>
            <span className={ui.calloutLabel}>{mode.name}</span>
            <span className={mode.basis === 'species' ? ui.tag : ui.tagAmber}>
              {mode.basis === 'species' ? 'Described for this species' : 'Generalised from other octopuses'}
            </span>
          </div>
          <p className={ui.text}>{mode.summary}</p>
          <Refs ids={mode.references} />
        </div>
      )}
    </div>
  );
}

const CHANNELS: { id: keyof MimicryChannelToggles; label: string; note: string }[] = [
  { id: 'arms', label: 'Arm configuration', note: 'All eight arms swept back into a flat wedge.' },
  { id: 'body', label: 'Body posture', note: 'Mantle flattened and trailing, eyes raised.' },
  { id: 'skin', label: 'Skin pattern', note: 'Banding faded to a pale, sandy mottle.' },
  { id: 'movement', label: 'Movement', note: 'Gliding just above the sand with an undulating body.' },
];

function Channels() {
  const on = useAppStore((s) => s.mimicryChannels);
  const count = CHANNELS.filter((c) => on[c.id]).length;
  return (
    <div className={styles.controls}>
      <ul className={styles.channels}>
        {CHANNELS.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              role="switch"
              aria-checked={on[c.id]}
              className={styles.channel}
              data-testid={`channel-${c.id}`}
              onClick={() => useAppStore.getState().toggleMimicryChannel(c.id)}
            >
              <span className={styles.switch} aria-hidden="true" />
              <span className={styles.channelText}>
                <strong>{c.label}</strong>
                <span>{c.note}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className={ui.small} aria-live="polite">
        {count === 4
          ? 'All four components on: together they give the flatfish resemblance.'
          : count === 0
            ? 'All components off: an ordinary resting octopus.'
            : `${count} of 4 components on. The resemblance is incomplete: no single component produces it alone.`}
      </p>
    </div>
  );
}

function Panel() {
  const id = useAppStore((s) => s.mechanism);
  const mechanism = getMechanism(id);
  return (
    <>
      <div className={ui.panelHeader}>
        <p className={ui.eyebrow}>02 · Mechanism lab</p>
        <h2 className={ui.title}>How the body does it</h2>
      </div>
      <div className={ui.tabs} role="tablist" aria-label="Mechanisms">
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
            title={m.title}
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
            {SHORT[m.id]}
          </button>
        ))}
      </div>
      <div className={ui.panelBody} role="tabpanel" id="mech-panel" aria-labelledby={`mech-tab-${id}`} data-testid="mech-panel">
        <h3 className={ui.subtitle}>{mechanism.title}</h3>
        <p className={ui.lead}>{mechanism.lead}</p>
        {mechanism.steps.length > 0 && <Stepper mechanism={mechanism} />}
        {id === 'arms' && <ArmRig />}
        {id === 'locomotion' && <Locomotion />}
        {id === 'mimicry' && <Channels />}
        <div className={ui.field}>
          <span className={ui.fieldLabel}>Key points</span>
          <ul className={ui.bullets}>
            {mechanism.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        {mechanism.diagram && <Diagram id={mechanism.diagram} />}
        {mechanism.caution && (
          <div className={ui.callout}>
            <span className={ui.calloutLabel}>Common misconception</span>
            <p className={ui.text}>
              <strong>{mechanism.caution.claim}</strong>
            </p>
            <p className={ui.text}>{mechanism.caution.correction}</p>
          </div>
        )}
        <p className={ui.small}>
          <strong>Basis.</strong> {mechanism.basisNote}
        </p>
        <Refs ids={mechanism.references} />
      </div>
    </>
  );
}

export function MechanismStage() {
  return (
    <StageFrame
      stage="mechanisms"
      label="Mechanism lab"
      rail={<CameraControls />}
      viewport={<p className={`${ui.hint} ${styles.hint}`}>Drag to rotate · Ctrl + scroll to zoom</p>}
      panel={<Panel />}
    />
  );
}
