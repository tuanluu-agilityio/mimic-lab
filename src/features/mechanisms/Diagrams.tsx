import { useTranslation } from 'react-i18next';
import type { DiagramId } from '@/data/mechanisms';
import styles from './Diagrams.module.css';

const INK = '#f1ead9';
const DIM = '#a9b6bd';
const CYAN = '#62e6e0';
const AMBER = '#e6a756';

function NeuronShare() {
  const { t } = useTranslation('mechanisms');
  return (
    <figure className={styles.figure}>
      <svg viewBox="0 0 340 96" role="img" aria-labelledby="dg-neuron-title dg-neuron-desc">
        <title id="dg-neuron-title">{t('diagrams.neuron.title')}</title>
        <desc id="dg-neuron-desc">{t('diagrams.neuron.desc')}</desc>
        <rect x="1" y="30" width="225" height="26" fill={CYAN} opacity="0.85" />
        <rect x="228" y="30" width="111" height="26" fill={AMBER} opacity="0.85" />
        <text x="1" y="20" fill={INK} fontSize="12">{t('diagrams.neuron.arms')}</text>
        <text x="339" y="20" fill={INK} fontSize="12" textAnchor="end">{t('diagrams.neuron.brain')}</text>
        <text x="113" y="48" fill="#03202a" fontSize="12.5" fontWeight="700" textAnchor="middle">{t('diagrams.neuron.twoThirds')}</text>
        <text x="283" y="48" fill="#03202a" fontSize="12.5" fontWeight="700" textAnchor="middle">{t('diagrams.neuron.oneThird')}</text>
        <text x="1" y="76" fill={DIM} fontSize="11.5">{t('diagrams.neuron.total')}</text>
        <text x="1" y="91" fill={DIM} fontSize="11.5">{t('diagrams.neuron.source')}</text>
      </svg>
      <figcaption>{t('diagrams.neuron.caption')}</figcaption>
    </figure>
  );
}

function Chromatophore() {
  const { t } = useTranslation('mechanisms');
  const muscles = (cx: number, r0: number, r1: number) =>
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <line
          key={i}
          x1={cx + Math.cos(a) * r0}
          y1={62 + Math.sin(a) * r0}
          x2={cx + Math.cos(a) * r1}
          y2={62 + Math.sin(a) * r1}
          stroke={CYAN}
          strokeWidth={r0 > 20 ? 2.6 : 1.2}
          strokeLinecap="round"
        />
      );
    });
  return (
    <figure className={styles.figure}>
      <svg viewBox="0 0 340 140" role="img" aria-labelledby="dg-chrom-title dg-chrom-desc">
        <title id="dg-chrom-title">{t('diagrams.chromatophore.title')}</title>
        <desc id="dg-chrom-desc">{t('diagrams.chromatophore.desc')}</desc>
        {muscles(85, 8, 46)}
        <circle cx="85" cy="62" r="7" fill={AMBER} />
        {muscles(255, 34, 46)}
        <circle cx="255" cy="62" r="33" fill={AMBER} opacity="0.9" />
        <path d="M150 62h36m-8-6 8 6-8 6" stroke={DIM} strokeWidth="1.5" fill="none" />
        <text x="168" y="50" fill={DIM} fontSize="11.5" textAnchor="middle">{t('diagrams.chromatophore.fires')}</text>
        <text x="85" y="128" fill={INK} fontSize="12" textAnchor="middle">{t('diagrams.chromatophore.relaxed')}</text>
        <text x="255" y="128" fill={INK} fontSize="12" textAnchor="middle">{t('diagrams.chromatophore.contracted')}</text>
      </svg>
      <figcaption>{t('diagrams.chromatophore.caption')}</figcaption>
    </figure>
  );
}

function ArmSection() {
  const { t } = useTranslation('mechanisms');
  return (
    <figure className={styles.figure}>
      <svg viewBox="0 0 340 190" role="img" aria-labelledby="dg-arm-title dg-arm-desc">
        <title id="dg-arm-title">{t('diagrams.arm.title')}</title>
        <desc id="dg-arm-desc">{t('diagrams.arm.desc')}</desc>
        <circle cx="110" cy="84" r="70" fill="none" stroke={INK} strokeWidth="2" />
        <circle cx="110" cy="84" r="62" fill="none" stroke={DIM} strokeWidth="5" strokeDasharray="3 4" />
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return <circle key={i} cx={110 + Math.cos(a) * 47} cy={84 + Math.sin(a) * 47} r="7.5" fill={CYAN} opacity="0.75" />;
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI;
          return (
            <line
              key={i}
              x1={110 + Math.cos(a) * 34}
              y1={84 + Math.sin(a) * 34}
              x2={110 - Math.cos(a) * 34}
              y2={84 - Math.sin(a) * 34}
              stroke={AMBER}
              strokeWidth="1.4"
              opacity="0.8"
            />
          );
        })}
        <circle cx="110" cy="84" r="11" fill="#06182a" stroke={INK} strokeWidth="1.5" />
        <circle cx="110" cy="84" r="4" fill={INK} />
        <path d="M84 150q26 34 52 0" fill="none" stroke={INK} strokeWidth="2" />
        <path d="M96 156q14 14 28 0" fill="none" stroke={DIM} strokeWidth="1.5" />
        <g fontSize="11.5" fill={INK}>
          <path d="M121 84h82M152 66h51M157 44h46M172 118h31M136 166h67" stroke={DIM} strokeWidth="0.8" />
          <text x="208" y="88">{t('diagrams.arm.nerve')}</text>
          <text x="208" y="70" fill={AMBER}>{t('diagrams.arm.transverse')}</text>
          <text x="208" y="48" fill={CYAN}>{t('diagrams.arm.longitudinal')}</text>
          <text x="208" y="122">{t('diagrams.arm.oblique')}</text>
          <text x="208" y="170">{t('diagrams.arm.sucker')}</text>
        </g>
      </svg>
      <figcaption>{t('diagrams.arm.caption')}</figcaption>
    </figure>
  );
}

export function Diagram({ id }: { id: DiagramId }) {
  if (id === 'neuron-share') return <NeuronShare />;
  if (id === 'chromatophore') return <Chromatophore />;
  return <ArmSection />;
}
