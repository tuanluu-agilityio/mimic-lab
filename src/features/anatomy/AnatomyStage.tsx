import { Refs } from '@/components/Refs';
import { Slider } from '@/components/Slider';
import { StageFrame } from '@/components/StageFrame';
import ui from '@/components/ui.module.css';
import { ANATOMY_STRUCTURES, BASIS_LABELS, getStructure, SYSTEM_LABELS } from '@/data/anatomy/structures';
import { SKIN_LAYERS_INFO, SKIN_MODEL_NOTE } from '@/data/skin/layers';
import { CameraControls } from '@/features/camera/CameraControls';
import { useAppStore } from '@/stores/appStore';
import type { SkinLayer, ViewMode } from '@/types/app';
import styles from './AnatomyStage.module.css';

const MODES: { id: ViewMode; label: string; hint: string }[] = [
  { id: 'normal', label: 'Normal', hint: 'The animal as it appears from outside.' },
  { id: 'xray', label: 'X-ray', hint: 'The skin turns translucent so the organs show through.' },
  { id: 'exploded', label: 'Exploded', hint: 'Organs are drawn apart from the body along a slider.' },
  { id: 'section', label: 'Section', hint: 'A cutting plane slices through the body.' },
  { id: 'isolated', label: 'Isolate', hint: 'Only the selected structure stays solid.' },
  { id: 'neural', label: 'Nerves', hint: 'Brain, optic lobes and the eight arm nerve cords.' },
  { id: 'skin', label: 'Skin', hint: 'A magnified, schematic block of skin.' },
];

function ModeBar() {
  const mode = useAppStore((s) => s.viewMode);
  return (
    <div className={styles.modeBar} role="group" aria-label="Visualisation mode">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          className={ui.btnSmall}
          aria-pressed={mode === m.id}
          title={m.hint}
          data-testid={`mode-${m.id}`}
          onClick={() => useAppStore.getState().setViewMode(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function StructureList() {
  const selected = useAppStore((s) => s.selectedStructure);
  const select = useAppStore.getState().selectStructure;
  return (
    <>
      {(['external', 'internal'] as const).map((group) => (
        <div className={ui.field} key={group}>
          <span className={ui.fieldLabel}>{group === 'external' ? 'External structures' : 'Internal structures'}</span>
          <div className={ui.segmented}>
            {ANATOMY_STRUCTURES.filter((s) => s.group === group).map((s) => (
              <button
                key={s.id}
                type="button"
                className={ui.btnSmall}
                aria-pressed={selected === s.id}
                data-testid={`structure-${s.id}`}
                onClick={() => select(selected === s.id ? null : s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function StructureCard() {
  const structure = useAppStore((s) => getStructure(s.selectedStructure));
  if (!structure) {
    return (
      <p className={ui.small} data-testid="structure-empty">
        Select a structure from the lists above, or click a marker on the model, to read what it is, what it does and
        how it connects to the rest of the body.
      </p>
    );
  }
  return (
    <article className={styles.card} data-testid="structure-card" aria-live="polite">
      <div className={ui.row}>
        <span className={ui.tagCyan}>{SYSTEM_LABELS[structure.system]}</span>
        <span className={structure.basis === 'species' ? ui.tag : ui.tagAmber}>{BASIS_LABELS[structure.basis]}</span>
      </div>
      <h3 className={ui.subtitle}>{structure.name}</h3>
      <p className={ui.lead}>{structure.summary}</p>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>Function</span>
        <p className={ui.text}>{structure.func}</p>
      </div>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>Connections</span>
        <p className={ui.text}>{structure.relations}</p>
      </div>
      <details className={ui.more}>
        <summary>More detail</summary>
        <p className={ui.text}>{structure.deeper}</p>
      </details>
      <div className={ui.callout}>
        <span className={ui.calloutLabel}>About this model</span>
        <p className={ui.small}>{structure.approximation}</p>
      </div>
      <Refs ids={structure.references} />
    </article>
  );
}

function SkinControls() {
  const layer = useAppStore((s) => s.skinLayer);
  const activation = useAppStore((s) => s.skinActivation);
  const act = useAppStore.getState();
  const info = SKIN_LAYERS_INFO.find((l) => l.id === layer);
  return (
    <>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>Skin layer</span>
        <div className={ui.segmented}>
          <button type="button" className={ui.btnSmall} aria-pressed={layer === 'all'} data-testid="skin-all" onClick={() => act.setSkinLayer('all')}>
            All layers
          </button>
          {SKIN_LAYERS_INFO.map((l) => (
            <button
              key={l.id}
              type="button"
              className={ui.btnSmall}
              aria-pressed={layer === l.id}
              data-testid={`skin-${l.id}`}
              onClick={() => act.setSkinLayer(l.id as SkinLayer)}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>
      <Slider
        label="Nerve signal to chromatophores"
        value={activation}
        onChange={act.setSkinActivation}
        testId="skin-activation"
        format={(v) => (v < 0.2 ? 'relaxed · pale' : v > 0.75 ? 'contracted · dark' : `${Math.round(v * 100)}%`)}
      />
      {info ? (
        <article className={styles.card} data-testid="skin-card">
          <h3 className={ui.subtitle}>{info.name}</h3>
          <p className={ui.lead}>{info.summary}</p>
          <p className={ui.text}>{info.detail}</p>
          <div className={ui.field}>
            <span className={ui.fieldLabel}>Control</span>
            <p className={ui.text}>{info.control}</p>
          </div>
          <Refs ids={info.references} />
        </article>
      ) : (
        <p className={ui.text}>
          Octopus skin is a stack of layers. Colour comes from pigment organs near the surface that the brain opens and
          closes through nerves and muscles, working over reflective layers beneath. Move the slider to send a nerve
          signal, or pick a layer to see it alone.
        </p>
      )}
      <div className={ui.callout}>
        <span className={ui.calloutLabel}>About this model</span>
        <p className={ui.small}>{SKIN_MODEL_NOTE}</p>
      </div>
    </>
  );
}

function Panel() {
  const mode = useAppStore((s) => s.viewMode);
  const explode = useAppStore((s) => s.explodeProgress);
  const section = useAppStore((s) => s.sectionOffset);
  const hasSelection = useAppStore((s) => s.selectedStructure !== null);
  const act = useAppStore.getState();
  return (
    <>
      <div className={ui.panelHeader}>
        <p className={ui.eyebrow}>01 · Anatomy explorer</p>
        <h2 className={ui.title}>The body of a mimic</h2>
      </div>
      <div className={ui.panelBody}>
        {mode === 'exploded' && <Slider label="Separation" value={explode} onChange={act.setExplodeProgress} testId="explode" />}
        {mode === 'section' && (
          <Slider
            label="Cutting plane"
            value={section}
            min={-1}
            max={1}
            onChange={act.setSectionOffset}
            testId="section"
            format={(v) => (Math.abs(v) < 0.05 ? 'midline' : v < 0 ? `left ${Math.round(-v * 100)}%` : `right ${Math.round(v * 100)}%`)}
          />
        )}
        {mode === 'isolated' && !hasSelection && (
          <div className={ui.calloutCyan}>
            <span className={ui.calloutLabel}>Isolate</span>
            <p className={ui.small}>Choose a structure below. Everything else will fade so it can be seen alone.</p>
          </div>
        )}
        {mode === 'skin' ? (
          <SkinControls />
        ) : (
          <>
            <StructureList />
            <hr className={ui.rule} />
            <StructureCard />
          </>
        )}
      </div>
    </>
  );
}

export function AnatomyStage() {
  return (
    <StageFrame
      stage="anatomy"
      label="Anatomy explorer"
      rail={<CameraControls below />}
      viewport={
        <>
          <ModeBar />
          <p className={`${ui.hint} ${styles.hint}`}>Drag to rotate · Ctrl + scroll to zoom</p>
        </>
      }
      panel={<Panel />}
    />
  );
}
