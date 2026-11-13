import type { DiagramId } from '@/data/mechanisms';
import styles from './Diagrams.module.css';

const INK = '#f1ead9';
const DIM = '#a9b6bd';
const CYAN = '#62e6e0';
const AMBER = '#e6a756';

function NeuronShare() {
  return (
    <figure className={styles.figure}>
      <svg viewBox="0 0 340 96" role="img" aria-labelledby="dg-neuron-title dg-neuron-desc">
        <title id="dg-neuron-title">Where an octopus keeps its neurons</title>
        <desc id="dg-neuron-desc">
          A bar divided in two. Of roughly 500 million neurons, about two thirds are in the eight arm nerve cords and
          about one third are in the central brain and optic lobes.
        </desc>
        <rect x="1" y="30" width="225" height="26" fill={CYAN} opacity="0.85" />
        <rect x="228" y="30" width="111" height="26" fill={AMBER} opacity="0.85" />
        <text x="1" y="20" fill={INK} fontSize="12">Eight arm nerve cords</text>
        <text x="339" y="20" fill={INK} fontSize="12" textAnchor="end">Brain + optic lobes</text>
        <text x="113" y="48" fill="#03202a" fontSize="12.5" fontWeight="700" textAnchor="middle">about 2/3</text>
        <text x="283" y="48" fill="#03202a" fontSize="12.5" fontWeight="700" textAnchor="middle">about 1/3</text>
        <text x="1" y="76" fill={DIM} fontSize="11.5">Total about 500 million neurons</text>
        <text x="1" y="91" fill={DIM} fontSize="11.5">Estimates for the common octopus, Octopus vulgaris</text>
      </svg>
      <figcaption>
        Roughly two thirds of the neurons lie in the arms and one third in the brain and optic lobes. Figures are for
        the common octopus; none exist for the mimic octopus.
      </figcaption>
    </figure>
  );
}

function Chromatophore() {
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
        <title id="dg-chrom-title">A chromatophore relaxed and expanded</title>
        <desc id="dg-chrom-desc">
          Left: radial muscles relaxed, the pigment sac is a small dot. Right: the muscles have contracted and pulled
          the sac out into a wide flat disc, so the pigment is visible.
        </desc>
        {muscles(85, 8, 46)}
        <circle cx="85" cy="62" r="7" fill={AMBER} />
        {muscles(255, 34, 46)}
        <circle cx="255" cy="62" r="33" fill={AMBER} opacity="0.9" />
        <path d="M150 62h36m-8-6 8 6-8 6" stroke={DIM} strokeWidth="1.5" fill="none" />
        <text x="168" y="50" fill={DIM} fontSize="11.5" textAnchor="middle">nerve fires</text>
        <text x="85" y="128" fill={INK} fontSize="12" textAnchor="middle">Muscles relaxed · pale</text>
        <text x="255" y="128" fill={INK} fontSize="12" textAnchor="middle">Muscles contracted · dark</text>
      </svg>
      <figcaption>
        Orange: elastic pigment sac. Cyan lines: radial muscles. Contracting the muscles stretches the sac into a disc.
        Schematic, not to scale.
      </figcaption>
    </figure>
  );
}

function ArmSection() {
  return (
    <figure className={styles.figure}>
      <svg viewBox="0 0 340 190" role="img" aria-labelledby="dg-arm-title dg-arm-desc">
        <title id="dg-arm-title">Cross-section of an octopus arm</title>
        <desc id="dg-arm-desc">
          From the centre outward: the axial nerve cord, a core of transverse muscle, bundles of longitudinal muscle,
          thin oblique muscle layers, and skin. A sucker is attached on the lower, oral side.
        </desc>
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
          <text x="208" y="88">Axial nerve cord</text>
          <text x="208" y="70" fill={AMBER}>Transverse muscle</text>
          <text x="208" y="48" fill={CYAN}>Longitudinal muscle</text>
          <text x="208" y="122">Oblique muscle, skin</text>
          <text x="208" y="170">Sucker</text>
        </g>
      </svg>
      <figcaption>
        No bone anywhere: muscles running in three directions work against each other. Schematic, generalised from
        other octopus species.
      </figcaption>
    </figure>
  );
}

export function Diagram({ id }: { id: DiagramId }) {
  if (id === 'neuron-share') return <NeuronShare />;
  if (id === 'chromatophore') return <Chromatophore />;
  return <ArmSection />;
}
