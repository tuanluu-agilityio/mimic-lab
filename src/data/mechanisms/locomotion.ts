import { flatfish } from '@/data/mimicry/targets/01-flatfish';
import { makeArms, makeBody, makeMovement, makeSkin, REST_POSE } from '@/three/animation/restPose';
import type { PoseDefinition } from '@/three/animation/types';

export interface LocomotionMode {
  id: string;
  name: string;
  summary: string;
  /** Known for this species, or generalised from other octopuses. */
  basis: 'species' | 'octopod-general';
  pose: PoseDefinition;
  camera: { azimuth: number; polar: number; distance: number; targetY: number };
  references: string[];
}

export const LOCOMOTION_MODES: LocomotionMode[] = [
  {
    id: 'crawl',
    name: 'Crawling',
    summary:
      'The usual way of getting around. Arms reach out, suckers grip the bottom, and the arms shorten to pull the body along. Any arm can lead, so the animal can set off in any direction without turning. While foraging, the arm tips probe into holes in the sand.',
    basis: 'octopod-general',
    pose: {
      body: makeBody({ height: 0.3, mantlePitch: 0.2, eyeRaise: 0.75 }),
      arms: makeArms((i, side, pair) => ({
        pitch0: -0.42,
        pitch1: 0,
        pitchBias: 0.35,
        bend: side * (0.25 + pair * 0.12) * (i % 2 ? 1 : -0.6),
        coil: side * 1.1,
        length: 0.92,
        waveAxis: 0.05,
        waveAmp: 0.26,
        waveFreq: 1.1,
        waveSpeed: 0.34,
        wavePhase: i * 0.8,
      })),
      skin: makeSkin(),
      movement: makeMovement({ bobAmp: 0.012, bobFreq: 0.7, swayAmp: 0.05, swayFreq: 0.34, travel: 0.22 }),
    },
    camera: { azimuth: 0.7, polar: 1.05, distance: 9, targetY: 0.3 },
    references: ['hanlon2008', 'hanlon2018'],
  },
  {
    id: 'jet',
    name: 'Jet propulsion',
    summary:
      'The mantle fills with water and then contracts, forcing it out through the funnel. The animal shoots off in the opposite direction, usually mantle first with the arms trailing. Because the funnel can be aimed, the same jet can drive the animal in other directions too. It is fast but tiring: each mantle contraction also interrupts the flow of blood through the gills.',
    basis: 'octopod-general',
    pose: {
      body: makeBody({ height: 1.0, mantlePitch: 0.03, mantleLength: 1.06, mantleWidth: 0.94, eyeRaise: 0.3, webSpread: 0.1 }),
      arms: makeArms((_i, side, pair) => ({
        yaw: side * 0.035 * (pair + 1),
        bend: -side * 0.02 * (pair + 1),
        pitch0: 0,
        pitch1: -0.05,
        length: 0.95,
        waveAxis: 0.5,
        waveAmp: 0.05,
        waveFreq: 1.2,
        waveSpeed: 1.1,
      })),
      skin: makeSkin({ pale: 0.3, bandContrast: 0.4 }),
      movement: makeMovement({ bobAmp: 0.02, bobFreq: 1.1, pulseAmp: 0.075, pulseFreq: 1.1, travel: -1.3 }),
    },
    camera: { azimuth: 1.2, polar: 1.3, distance: 10, targetY: 0.9 },
    references: ['wells1978', 'hanlon2018'],
  },
  {
    id: 'flatfish-swim',
    name: 'Flatfish swimming',
    summary:
      'The swimming style this species is known for. The arms are drawn into a flat, leaf-shaped wedge, the mantle trails behind the head, and the animal jets forward just above the sand while its body undulates. Published accounts describe the posture but give no measured speed.',
    basis: 'species',
    pose: flatfish.pose,
    camera: { azimuth: 0.95, polar: 1.02, distance: 8.6, targetY: 0.4 },
    references: ['norman2001', 'hanlon2008', 'huffard2010'],
  },
];

export function getLocomotion(id: string): LocomotionMode | undefined {
  return LOCOMOTION_MODES.find((m) => m.id === id);
}

/** Pose used by the nervous-system demonstration when the animal reacts to a visual stimulus. */
export const ALERT_POSE: PoseDefinition = {
  body: makeBody({ height: 0.4, mantlePitch: 0.5, eyeRaise: 1, webSpread: 0.7 }),
  arms: makeArms((i, side, pair) => ({
    pitch0: -0.3,
    pitch1: 0,
    pitchBias: 0.35,
    bend: side * (1.1 + pair * 0.15),
    coil: REST_POSE.arms[i].coil * 1.5,
    curl: 0.4,
    length: 0.6,
    waveAmp: 0.03,
    waveFreq: 1.2,
    waveSpeed: 0.2,
    wavePhase: i,
  })),
  skin: makeSkin({ bandContrast: 0.95, bandSharpness: 0.7, pale: 0.05 }),
  movement: makeMovement(),
};
