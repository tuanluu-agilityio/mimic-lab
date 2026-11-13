import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ArmControl,
  CameraPresetName,
  MechanismId,
  MimicryChannelToggles,
  QualityLevel,
  QualitySetting,
  SkinLayer,
  Stage,
  ViewMode,
} from '@/types/app';

/** Anatomy structure ids that live inside the body; picking one from Normal view switches to X-Ray. */
export const INTERNAL_STRUCTURE_IDS = new Set([
  'brain',
  'optic-lobes',
  'nervous-system',
  'gills',
  'hearts',
  'digestive-system',
  'beak',
  'radula',
  'ink-sac',
]);

export const DEFAULT_ARM_CONTROL: ArmControl = { arm: 0, extend: 0.9, lift: 0.5, sweep: 0, curl: 0.6 };

export interface AppState {
  stage: Stage;

  // Anatomy
  viewMode: ViewMode;
  selectedStructure: string | null;
  explodeProgress: number;
  sectionOffset: number;
  skinLayer: SkinLayer;
  skinActivation: number;

  // Mechanism lab
  mechanism: MechanismId;
  mechanismStep: number;
  locomotion: string;
  armControl: ArmControl;
  mimicryChannels: MimicryChannelToggles;

  // Mimicry
  mimicryTarget: string | null;
  playback: { playing: boolean; speed: number; progress: number; phaseId: string; phaseLabel: string };
  /** Incremented to ask the engine to replay; seek carries a value. */
  replayNonce: number;
  seekRequest: { value: number; nonce: number };
  comparison: boolean;
  showBuried: boolean;

  // Camera
  cameraPreset: { name: CameraPresetName; nonce: number };
  zoomRequest: { direction: 1 | -1; nonce: number };

  // Engine / performance
  quality: QualitySetting;
  effectiveQuality: QualityLevel;
  fps: number;
  engineStatus: 'loading' | 'ready' | 'unsupported' | 'error';
  loadProgress: number;
  loadLabel: string;
  reducedMotion: boolean;

  setStage(stage: Stage): void;
  setViewMode(mode: ViewMode): void;
  selectStructure(id: string | null): void;
  setExplodeProgress(v: number): void;
  setSectionOffset(v: number): void;
  setSkinLayer(layer: SkinLayer): void;
  setSkinActivation(v: number): void;
  setMechanism(id: MechanismId): void;
  setMechanismStep(step: number): void;
  setLocomotion(id: string): void;
  setArmControl(patch: Partial<ArmControl>): void;
  toggleMimicryChannel(channel: keyof MimicryChannelToggles): void;
  selectTarget(id: string | null): void;
  setPlaying(playing: boolean): void;
  setSpeed(speed: number): void;
  replay(): void;
  seek(value: number): void;
  setComparison(on: boolean): void;
  setShowBuried(on: boolean): void;
  requestCameraPreset(name: CameraPresetName): void;
  requestZoom(direction: 1 | -1): void;
  setQuality(q: QualitySetting): void;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    stage: 'intro',

    viewMode: 'normal',
    selectedStructure: null,
    explodeProgress: 0.6,
    sectionOffset: 0,
    skinLayer: 'all',
    skinActivation: 0.15,

    mechanism: 'nervous',
    mechanismStep: 0,
    locomotion: 'crawl',
    armControl: { ...DEFAULT_ARM_CONTROL },
    mimicryChannels: { arms: true, body: true, skin: true, movement: true },

    mimicryTarget: null,
    playback: { playing: true, speed: 1, progress: 0, phaseId: 'rest', phaseLabel: 'Resting octopus' },
    replayNonce: 0,
    seekRequest: { value: 0, nonce: 0 },
    comparison: false,
    showBuried: false,

    cameraPreset: { name: 'reset', nonce: 0 },
    zoomRequest: { direction: 1, nonce: 0 },

    quality: 'auto',
    effectiveQuality: 'high',
    fps: 0,
    engineStatus: 'loading',
    loadProgress: 0,
    loadLabel: 'Preparing the laboratory',
    reducedMotion: false,

    setStage: (stage) => {
      if (get().stage !== stage) set({ stage });
    },
    setViewMode: (viewMode) => set({ viewMode }),
    selectStructure: (id) => {
      const { viewMode } = get();
      const patch: Partial<AppState> = { selectedStructure: id };
      // An internal structure cannot be seen through opaque skin.
      if (id && INTERNAL_STRUCTURE_IDS.has(id) && (viewMode === 'normal' || viewMode === 'skin')) patch.viewMode = 'xray';
      if (id === 'skin' && viewMode === 'normal') patch.viewMode = 'skin';
      if (id && id !== 'skin' && viewMode === 'skin') patch.viewMode = INTERNAL_STRUCTURE_IDS.has(id) ? 'xray' : 'normal';
      set(patch);
    },
    setExplodeProgress: (v) => set({ explodeProgress: clamp(v, 0, 1) }),
    setSectionOffset: (v) => set({ sectionOffset: clamp(v, -1, 1) }),
    setSkinLayer: (skinLayer) => set({ skinLayer }),
    setSkinActivation: (v) => set({ skinActivation: clamp(v, 0, 1) }),
    setMechanism: (mechanism) => set({ mechanism, mechanismStep: 0 }),
    setMechanismStep: (mechanismStep) => set({ mechanismStep: Math.max(0, mechanismStep) }),
    setLocomotion: (locomotion) => set({ locomotion }),
    setArmControl: (patch) => set({ armControl: { ...get().armControl, ...patch } }),
    toggleMimicryChannel: (channel) =>
      set({ mimicryChannels: { ...get().mimicryChannels, [channel]: !get().mimicryChannels[channel] } }),
    selectTarget: (id) =>
      set({
        mimicryTarget: id,
        comparison: id ? get().comparison : false,
        playback: { ...get().playback, playing: true, progress: 0, phaseId: 'rest', phaseLabel: 'Resting octopus' },
      }),
    setPlaying: (playing) => set({ playback: { ...get().playback, playing } }),
    setSpeed: (speed) => set({ playback: { ...get().playback, speed } }),
    replay: () =>
      set({ replayNonce: get().replayNonce + 1, playback: { ...get().playback, playing: true, progress: 0 } }),
    seek: (value) => set({ seekRequest: { value: clamp(value, 0, 1), nonce: get().seekRequest.nonce + 1 } }),
    setComparison: (comparison) => set({ comparison }),
    setShowBuried: (showBuried) => set({ showBuried }),
    requestCameraPreset: (name) => set({ cameraPreset: { name, nonce: get().cameraPreset.nonce + 1 } }),
    requestZoom: (direction) => set({ zoomRequest: { direction, nonce: get().zoomRequest.nonce + 1 } }),
    setQuality: (quality) => set({ quality }),
  })),
);
