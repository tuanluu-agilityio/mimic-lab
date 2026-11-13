import { useTranslation } from 'react-i18next';
import { Refs } from '@/components/Refs';
import { Slider } from '@/components/Slider';
import { StageFrame } from '@/components/StageFrame';
import ui from '@/components/ui.module.css';
import { ANATOMY_STRUCTURES, getStructure } from '@/data/anatomy/structures';
import { SKIN_LAYERS_INFO } from '@/data/skin/layers';
import { CameraControls } from '@/features/camera/CameraControls';
import { useContent } from '@/i18n/content';
import { useAppStore } from '@/stores/appStore';
import { VIEW_MODES, type SkinLayer } from '@/types/app';
import styles from './AnatomyStage.module.css';

function ModeBar() {
  const mode = useAppStore((s) => s.viewMode);
  const { t } = useTranslation(['anatomy', 'common']);
  return (
    <div className={styles.modeBar} role="group" aria-label={t('modeGroup')}>
      {VIEW_MODES.map((id) => (
        <button
          key={id}
          type="button"
          className={ui.btnSmall}
          aria-pressed={mode === id}
          title={t(`modes.${id}.hint`)}
          data-testid={`mode-${id}`}
          onClick={() => useAppStore.getState().setViewMode(id)}
        >
          {t(`modes.${id}.label`)}
        </button>
      ))}
    </div>
  );
}

function StructureList() {
  const selected = useAppStore((s) => s.selectedStructure);
  const select = useAppStore.getState().selectStructure;
  const { t } = useTranslation(['anatomy', 'common']);
  const content = useContent();
  return (
    <>
      {(['external', 'internal'] as const).map((group) => (
        <div className={ui.field} key={group}>
          <span className={ui.fieldLabel}>{t(`groups.${group}`)}</span>
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
                {content.structure(s.id).name}
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
  const { t } = useTranslation(['anatomy', 'common']);
  const content = useContent();
  if (!structure) {
    return (
      <p className={ui.small} data-testid="structure-empty">
        {t('empty')}
      </p>
    );
  }
  const text = content.structure(structure.id);
  return (
    <article className={styles.card} data-testid="structure-card" aria-live="polite">
      <div className={ui.row}>
        <span className={ui.tagCyan}>{t(`systems.${structure.system}`)}</span>
        <span className={structure.basis === 'species' ? ui.tag : ui.tagAmber}>{t(`basis.${structure.basis}`)}</span>
      </div>
      <h3 className={ui.subtitle}>{text.name}</h3>
      <p className={ui.lead}>{text.summary}</p>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>{t('fields.function')}</span>
        <p className={ui.text}>{text.func}</p>
      </div>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>{t('fields.connections')}</span>
        <p className={ui.text}>{text.relations}</p>
      </div>
      <details className={ui.more}>
        <summary>{t('fields.more')}</summary>
        <p className={ui.text}>{text.deeper}</p>
      </details>
      <div className={ui.callout}>
        <span className={ui.calloutLabel}>{t('common:aboutModel')}</span>
        <p className={ui.small}>{text.approximation}</p>
      </div>
      <Refs ids={structure.references} />
    </article>
  );
}

function SkinControls() {
  const layer = useAppStore((s) => s.skinLayer);
  const activation = useAppStore((s) => s.skinActivation);
  const act = useAppStore.getState();
  const { t } = useTranslation(['anatomy', 'common']);
  const content = useContent();
  const info = SKIN_LAYERS_INFO.find((l) => l.id === layer);
  const text = info && content.skinLayer(info.id);
  return (
    <>
      <div className={ui.field}>
        <span className={ui.fieldLabel}>{t('skinLayer')}</span>
        <div className={ui.segmented}>
          <button type="button" className={ui.btnSmall} aria-pressed={layer === 'all'} data-testid="skin-all" onClick={() => act.setSkinLayer('all')}>
            {t('allLayers')}
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
              {content.skinLayer(l.id).name}
            </button>
          ))}
        </div>
      </div>
      <Slider
        label={t('sliders.nerveSignal')}
        value={activation}
        onChange={act.setSkinActivation}
        testId="skin-activation"
        format={(v) => (v < 0.2 ? t('sliders.relaxed') : v > 0.75 ? t('sliders.contracted') : `${Math.round(v * 100)}%`)}
      />
      {info && text ? (
        <article className={styles.card} data-testid="skin-card">
          <h3 className={ui.subtitle}>{text.name}</h3>
          <p className={ui.lead}>{text.summary}</p>
          <p className={ui.text}>{text.detail}</p>
          <div className={ui.field}>
            <span className={ui.fieldLabel}>{t('fields.control')}</span>
            <p className={ui.text}>{text.control}</p>
          </div>
          <Refs ids={info.references} />
        </article>
      ) : (
        <p className={ui.text}>{t('skinIntro')}</p>
      )}
      <div className={ui.callout}>
        <span className={ui.calloutLabel}>{t('common:aboutModel')}</span>
        <p className={ui.small}>{t('skinModelNote')}</p>
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
  const { t } = useTranslation(['anatomy', 'common']);
  return (
    <>
      <div className={ui.panelHeader}>
        <p className={ui.eyebrow}>{t('eyebrow')}</p>
        <h2 className={ui.title}>{t('title')}</h2>
      </div>
      <div className={ui.panelBody}>
        {mode === 'exploded' && <Slider label={t('sliders.separation')} value={explode} onChange={act.setExplodeProgress} testId="explode" />}
        {mode === 'section' && (
          <Slider
            label={t('sliders.cuttingPlane')}
            value={section}
            min={-1}
            max={1}
            onChange={act.setSectionOffset}
            testId="section"
            format={(v) =>
              Math.abs(v) < 0.05
                ? t('sliders.midline')
                : v < 0
                  ? t('sliders.left', { percent: Math.round(-v * 100) })
                  : t('sliders.right', { percent: Math.round(v * 100) })
            }
          />
        )}
        {mode === 'isolated' && !hasSelection && (
          <div className={ui.calloutCyan}>
            <span className={ui.calloutLabel}>{t('isolate.label')}</span>
            <p className={ui.small}>{t('isolate.text')}</p>
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
  const { t } = useTranslation(['anatomy', 'common']);
  return (
    <StageFrame
      stage="anatomy"
      label={t('sectionLabel')}
      rail={<CameraControls below />}
      viewport={
        <>
          <ModeBar />
          <p className={`${ui.hint} ${styles.hint}`}>{t('common:dragHint')}</p>
        </>
      }
      panel={<Panel />}
    />
  );
}
