import { ALERT_POSE, getLocomotion } from '@/data/mechanisms/locomotion';
import { getTarget } from '@/data/mimicry';
import { flatfish } from '@/data/mimicry/targets/01-flatfish';
import type { AppState } from '@/stores/appStore';
import type { ReferenceModelId, ViewMode } from '@/types/app';
import { clonePose } from '../animation/pose';
import { makeSkin, REST_POSE } from '../animation/restPose';
import { makeSequence, QUICK_SEQUENCE } from '../animation/transition';
import type { PoseDefinition, TransitionSequence } from '../animation/types';

export interface CameraHome {
  azimuth: number;
  polar: number;
  distance: number;
  targetY: number;
}

/** Everything the engine needs to know about what should be on screen, derived from app state. */
export interface Directive {
  /** Changes whenever the pose target changes; the engine starts a transition on change. */
  poseKey: string;
  /** null = resting pose. */
  pose: PoseDefinition | null;
  sequence?: TransitionSequence;
  involvedArms: number[];
  /** Effective visualisation mode (stages other than the anatomy explorer force their own). */
  mode: ViewMode;
  /** Changes whenever the default camera framing should change. */
  cameraKey: string;
  camera: CameraHome;
  interactive: boolean;
  allowBelow: boolean;
  autoRotate: boolean;
  referenceModel: ReferenceModelId | null;
  /** Step of the nervous-system demonstration, or -1 when it is not running. */
  nervousStep: number;
  /** Manual arm rig active (mechanism 3). */
  armRig: boolean;
  /** The transition can be paused / scrubbed by the visitor. */
  userPlayback: boolean;
  /** Rendering can stop entirely. */
  idle: boolean;
}

const HOMES: Record<string, CameraHome> = {
  intro: { azimuth: 0.62, polar: 1.2, distance: 10.5, targetY: 0.5 },
  anatomy: { azimuth: 0.75, polar: 1.12, distance: 6.4, targetY: 0.45 },
  skin: { azimuth: 0.6, polar: 0.98, distance: 9, targetY: 0.75 },
  nervous: { azimuth: 0.5, polar: 0.95, distance: 9, targetY: 0.3 },
  arms: { azimuth: 0.85, polar: 0.98, distance: 9.5, targetY: 0.4 },
  mimicry: { azimuth: 0.75, polar: 1.05, distance: 10.5, targetY: 0.45 },
};

const DEMO_SEQUENCE = makeSequence(5.5, {
  rest: [0, 0.03],
  prepare: [0.03, 0.14],
  arms: [0.1, 0.62],
  body: [0.3, 0.75],
  skin: [0.45, 0.88],
  movement: [0.6, 0.97],
  final: [0.97, 1],
});

const BANDED_REST: PoseDefinition = {
  ...clonePose(REST_POSE),
  skin: makeSkin({ bandContrast: 0.97, bandSharpness: 0.75, pale: 0.03, mottle: 0.2 }),
};

/** Compose a pose that takes each channel from `target` only when its toggle is on. */
function composeChannels(target: PoseDefinition, on: AppState['mimicryChannels']): PoseDefinition {
  return {
    arms: (on.arms ? target : REST_POSE).arms,
    body: (on.body ? target : REST_POSE).body,
    skin: (on.skin ? target : REST_POSE).skin,
    movement: (on.movement ? target : REST_POSE).movement,
  };
}

type DirectorInput = Pick<
  AppState,
  | 'stage'
  | 'viewMode'
  | 'mechanism'
  | 'mechanismStep'
  | 'locomotion'
  | 'mimicryChannels'
  | 'mimicryTarget'
>;

export function direct(s: DirectorInput): Directive {
  const d: Directive = {
    poseKey: 'rest',
    pose: null,
    involvedArms: [],
    mode: 'normal',
    cameraKey: s.stage,
    camera: HOMES.anatomy,
    interactive: true,
    allowBelow: false,
    autoRotate: false,
    referenceModel: null,
    nervousStep: -1,
    armRig: false,
    userPlayback: false,
    idle: false,
  };

  switch (s.stage) {
    case 'intro':
      d.camera = HOMES.intro;
      d.interactive = false;
      d.autoRotate = true;
      break;

    case 'anatomy':
      d.mode = s.viewMode;
      d.allowBelow = true;
      d.camera = s.viewMode === 'skin' ? HOMES.skin : HOMES.anatomy;
      d.cameraKey = s.viewMode === 'skin' ? 'anatomy-skin' : 'anatomy';
      break;

    case 'mechanisms':
      d.cameraKey = `mech-${s.mechanism}`;
      switch (s.mechanism) {
        case 'nervous':
          d.mode = 'neural';
          d.camera = HOMES.nervous;
          d.nervousStep = s.mechanismStep;
          if (s.mechanismStep >= 4) {
            d.poseKey = 'alert';
            d.pose = ALERT_POSE;
            d.sequence = QUICK_SEQUENCE;
          }
          break;
        case 'skin':
          if (s.mechanismStep >= 4) {
            d.poseKey = 'banded-rest';
            d.pose = BANDED_REST;
            d.sequence = QUICK_SEQUENCE;
            d.camera = HOMES.anatomy;
            d.cameraKey = 'mech-skin-result';
          } else {
            d.mode = 'skin';
            d.camera = HOMES.skin;
          }
          break;
        case 'arms':
          d.camera = HOMES.arms;
          d.armRig = true;
          break;
        case 'locomotion': {
          const mode = getLocomotion(s.locomotion);
          if (mode) {
            d.poseKey = `loco-${mode.id}`;
            d.pose = mode.pose;
            d.sequence = DEMO_SEQUENCE;
            d.camera = mode.camera;
            d.cameraKey = `loco-${mode.id}`;
          }
          break;
        }
        case 'mimicry': {
          const on = s.mimicryChannels;
          d.poseKey = `channels-${+on.arms}${+on.body}${+on.skin}${+on.movement}`;
          d.pose = composeChannels(flatfish.pose, on);
          d.sequence = QUICK_SEQUENCE;
          d.camera = flatfish.camera;
          d.cameraKey = 'mech-mimicry';
          break;
        }
      }
      break;

    case 'mimicry': {
      const target = getTarget(s.mimicryTarget);
      d.userPlayback = true;
      if (target) {
        d.poseKey = `target-${target.id}`;
        d.pose = target.pose;
        d.sequence = target.transitionSequence;
        d.involvedArms = target.involvedArms;
        d.camera = target.camera;
        d.cameraKey = `target-${target.id}`;
        d.referenceModel = target.referenceModel;
      } else {
        d.camera = HOMES.mimicry;
      }
      break;
    }

    case 'sources':
      d.interactive = false;
      d.idle = true;
      d.camera = HOMES.intro;
      d.cameraKey = 'intro';
      break;
  }
  return d;
}
