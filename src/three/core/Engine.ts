import * as THREE from 'three';
import { INTERNAL_STRUCTURE_IDS, useAppStore, type AppState } from '@/stores/appStore';
import type { QualityLevel, ReferenceModelId } from '@/types/app';
import { PoseController } from '../animation/PoseController';
import { ARM_HOME_YAW, REST_POSE } from '../animation/restPose';
import { ARM_COUNT, type PoseDefinition } from '../animation/types';
import { Environment } from '../environment/Environment';
import { PART } from '../materials/skinMaterial';
import { ANCHOR_FOCUS_DISTANCE, type AnchorId } from '../models/anatomy/anchors';
import { Organs, type OrgansState } from '../models/anatomy/Organs';
import { Octopus } from '../models/octopus/Octopus';
import { loadReferenceModel, type ReferenceModel } from '../models/reference';
import { SKIN_ORIGIN, SkinPatch } from '../models/skin/SkinPatch';
import { CameraRig } from './CameraRig';
import { direct, type Directive } from './director';
import { FrameMonitor, initialQuality, QUALITY_TIERS, stepQuality } from './quality';

/** Where the reference animal is placed: far enough to be hidden from the main view by the water. */
const REF_ORIGIN = new THREE.Vector3(-90, 0, 0);
const THUMB_ORIGIN = new THREE.Vector3(90, 0, 40);

const EXTERNAL_PART: Record<string, number> = {
  mantle: PART.MANTLE,
  head: PART.HEAD,
  eyes: PART.HEAD,
  funnel: PART.HEAD,
  arms: PART.ARM,
  suckers: PART.ARM,
  web: PART.WEB,
};

export interface ScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}

export interface EngineDebug {
  armCount: number;
  armsFinite: boolean;
  armMinY: number;
  armMaxReach: number;
  poseKey: string;
  progress: number;
  phase: string;
  playing: boolean;
  mode: string;
  xray: number;
  section: number;
  explode: number;
  isolatePart: number;
  highlightPart: number;
  nerveOpacity: number;
  visibleOrgans: string[];
  skinPatchVisible: boolean;
  bandExpansion: number;
  camera: { azimuth: number; polar: number; distance: number; target: [number, number, number] };
  referenceModel: string | null;
  referenceViewport: boolean;
  quality: QualityLevel;
  fps: number;
  running: boolean;
  renderer: { geometries: number; textures: number; calls: number; triangles: number };
  bodyHeight: number;
  skinBandContrast: number;
  armHighlights: number[];
}

type ProgressFn = (progress: number, label: string) => void;
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const damp = (current: number, target: number, k: number) => current + (target - current) * k;

/**
 * Owns the WebGL renderer, the scene and the single animation loop. It reads the Zustand
 * store (never React) and writes back only playback progress, measured fps and quality.
 */
export class Engine {
  static async create(canvas: HTMLCanvasElement, onProgress: ProgressFn): Promise<Engine> {
    const engine = new Engine(canvas);
    await engine.build(onProgress);
    return engine;
  }

  readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private rig!: CameraRig;
  private env!: Environment;
  private octopus!: Octopus;
  private organs!: Organs;
  private skinPatch!: SkinPatch;
  private readonly controller = new PoseController();
  private readonly monitor = new FrameMonitor();
  private readonly refCamera = new THREE.PerspectiveCamera(38, 1, 0.05, 400);

  private directive: Directive;
  private quality: QualityLevel;
  private raf = 0;
  private running = false;
  private disposed = false;
  private last = 0;
  private time = 0;
  private frame = 0;
  private lastProgressWrite = 0;
  private width = 1;
  private height = 1;

  // Smoothed render state.
  private xray = 0;
  private explode = 0;
  private sandAlpha = 1;
  private readonly armHighlight = new Array<number>(ARM_COUNT).fill(0);
  private readonly rigWeight = new Array<number>(ARM_COUNT).fill(0);
  private readonly rigValues = { extend: 0.9, lift: 0.5, sweep: 0, curl: 0.6 };
  private eyeGlow = 0;
  private readonly organsState: OrgansState = {
    visibility: 0,
    explode: 0,
    selected: null,
    isolate: false,
    neuralOnly: false,
    nerves: 0,
  };
  private skinView = false;

  // Reference animal.
  private reference: { id: ReferenceModelId; model: ReferenceModel } | null = null;
  private referenceLoading: ReferenceModelId | null = null;
  private referenceEl: HTMLElement | null = null;
  private readonly refRect = { x: 0, y: 0, w: 0, h: 0, visible: false };
  private thumbQueue: Promise<unknown> = Promise.resolve();
  private readonly thumbCache = new Map<ReferenceModelId, Promise<string>>();

  private readonly frameListeners = new Set<() => void>();
  private readonly unsubscribers: (() => void)[] = [];
  private readonly tmp = new THREE.Vector3();
  private readonly tmp2 = new THREE.Vector3();
  private readonly resizeObserver: ResizeObserver;
  private readonly onVisibility = () => this.syncRunning();

  private constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.autoClear = false;

    const state = useAppStore.getState();
    this.quality = state.quality === 'auto' ? initialQuality(navigator, window.innerWidth) : state.quality;
    this.directive = direct(state);
    this.resizeObserver = new ResizeObserver(() => this.resize());
  }

  private async build(onProgress: ProgressFn): Promise<void> {
    const tier = QUALITY_TIERS[this.quality];
    onProgress(0.2, 'Filling the tank: seabed, water and light');
    await nextFrame();
    this.env = new Environment(this.scene, tier);
    this.rig = new CameraRig(this.canvas);

    onProgress(0.4, 'Growing the mantle and eight arms');
    await nextFrame();
    this.octopus = new Octopus(tier);
    this.scene.add(this.octopus.root);

    onProgress(0.6, 'Placing organs and nerve cords');
    await nextFrame();
    this.organs = new Organs(this.octopus, tier.armSegments);

    onProgress(0.75, 'Seeding chromatophores');
    await nextFrame();
    this.skinPatch = new SkinPatch();
    this.scene.add(this.skinPatch.group);

    this.controller.reset();
    this.resize();
    this.resizeObserver.observe(this.canvas);
    this.applyDirective(this.directive, null, true);
    this.subscribe();

    onProgress(0.9, 'Compiling shaders');
    await nextFrame();
    this.step(1 / 60);
    this.renderer.compile(this.scene, this.rig.camera);
    await nextFrame();

    useAppStore.setState({ effectiveQuality: this.quality });
    document.addEventListener('visibilitychange', this.onVisibility);
    onProgress(1, 'Ready');
    this.syncRunning();
  }

  // ───────────────────────────────────────────────────────── store wiring

  private subscribe(): void {
    const store = useAppStore;
    const sub = <T>(selector: (s: AppState) => T, fn: (value: T, prev: T) => void) =>
      this.unsubscribers.push(store.subscribe(selector, fn));

    // Anything that changes what should be on screen.
    sub(
      (s) =>
        `${s.stage}|${s.viewMode}|${s.mechanism}|${s.mechanismStep}|${s.locomotion}|${s.mimicryTarget}|` +
        `${+s.mimicryChannels.arms}${+s.mimicryChannels.body}${+s.mimicryChannels.skin}${+s.mimicryChannels.movement}`,
      () => {
        const prev = this.directive;
        this.directive = direct(store.getState());
        this.applyDirective(this.directive, prev, false);
      },
    );
    sub((s) => s.selectedStructure, (id) => this.focusStructure(id));
    sub((s) => s.cameraPreset.nonce, () => this.rig.preset(store.getState().cameraPreset.name));
    sub((s) => s.zoomRequest.nonce, () => this.rig.zoomBy(store.getState().zoomRequest.direction > 0 ? 0.8 : 1.25));
    sub((s) => s.replayNonce, () => this.controller.replay());
    sub((s) => s.seekRequest.nonce, () => this.controller.seek(store.getState().seekRequest.value));
    sub((s) => s.quality, (q) => {
      if (q !== 'auto') this.setQuality(q);
    });
    sub((s) => s.reducedMotion, (r) => {
      this.rig.reducedMotion = r;
      this.rig.setAutoRotate(this.directive.autoRotate);
    });
    this.rig.reducedMotion = store.getState().reducedMotion;
  }

  private applyDirective(d: Directive, prev: Directive | null, immediate: boolean): void {
    if (!prev || prev.poseKey !== d.poseKey) {
      this.controller.setTarget(d.pose, d.sequence);
      if (immediate) this.controller.seek(1);
    }
    const skinView = d.mode === 'skin';
    const viewChanged = skinView !== this.skinView;
    this.skinView = skinView;
    if (!prev || prev.cameraKey !== d.cameraKey || viewChanged) {
      const origin = skinView ? SKIN_ORIGIN : new THREE.Vector3();
      const home = {
        azimuth: d.camera.azimuth,
        polar: d.camera.polar,
        distance: d.camera.distance,
        target: new THREE.Vector3(origin.x, origin.y + d.camera.targetY, origin.z),
      };
      // Travelling between the animal and the magnified skin block would fly through 60 units
      // of water, so that change is a cut.
      this.rig.setHome(home, !(immediate || viewChanged));
      if (immediate || viewChanged) this.rig.jumpTo(home);
    }
    this.rig.setInteractive(d.interactive, d.allowBelow);
    this.rig.setAutoRotate(d.autoRotate);
    this.octopus.root.visible = !skinView;
    this.skinPatch.group.visible = skinView;
    this.env.setSeabedVisible(!skinView);
    this.ensureReference(d.referenceModel);
    this.syncRunning();
  }

  private focusStructure(id: string | null): void {
    if (this.directive.mode === 'skin' || useAppStore.getState().stage !== 'anatomy') return;
    if (!id || !(id in ANCHOR_FOCUS_DISTANCE)) return;
    // Let the mode change (e.g. to X-Ray) settle for a frame so anchors are current.
    requestAnimationFrame(() => {
      if (this.disposed || !this.anchorWorld(id, this.tmp)) return;
      this.rig.flyTo({ target: this.tmp.clone(), distance: ANCHOR_FOCUS_DISTANCE[id as AnchorId] });
    });
  }

  // ───────────────────────────────────────────────────────── loop

  private syncRunning(): void {
    const shouldRun = !this.disposed && !document.hidden && !this.directive.idle;
    if (shouldRun && !this.running) {
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.step(dt);
    this.render();

    const state = useAppStore.getState();
    const change = this.monitor.sample(dt);
    if (change !== 0 && state.quality === 'auto') this.setQuality(stepQuality(this.quality, change));
    if (now - this.lastProgressWrite > 120) {
      this.lastProgressWrite = now;
      this.writeBack(state);
    }
    for (const fn of this.frameListeners) fn();
  };

  /** Advance simulation state by dt seconds (no rendering). */
  private step(dt: number): void {
    const state = useAppStore.getState();
    const d = this.directive;
    this.time += dt;
    this.frame++;
    const k = 1 - Math.exp(-dt * 6);

    // Playback.
    const c = this.controller;
    if (d.userPlayback) {
      c.playing = state.playback.playing;
      c.setSpeed(state.playback.speed);
    } else {
      c.playing = true;
      c.setSpeed(state.stage === 'mechanisms' ? state.playback.speed : 1);
    }
    const pose = c.update(dt);
    this.applyArmRig(pose, state, dt);

    const atRest = d.pose === null && !d.armRig;
    const motionScale = state.reducedMotion && atRest ? 0.25 : 1;

    if (!this.skinView) {
      this.octopus.update(pose, c, dt, motionScale);
      this.updateViewState(state, d, pose, dt, k);
    } else {
      this.skinPatch.update(dt, this.time, state.skinActivation, state.skinLayer);
    }

    const showBuried = state.stage === 'mimicry' && state.showBuried;
    this.sandAlpha = damp(this.sandAlpha, showBuried ? 0.3 : 1, k);
    this.env.update(this.time, c.travelDistance, pose.body.burrow, this.sandAlpha, this.renderer.getPixelRatio());

    this.reference?.model.update(c.motionTime);
    if (this.frame % 6 === 1) this.measureLayout(state);
    this.rig.update(dt);
  }

  /** Mechanism 3: let the visitor pose one arm by hand on top of the current pose. */
  private applyArmRig(pose: PoseDefinition, state: AppState, dt: number): void {
    const k = 1 - Math.exp(-dt * 5);
    const ctl = state.armControl;
    const v = this.rigValues;
    v.extend = damp(v.extend, ctl.extend, k);
    v.lift = damp(v.lift, ctl.lift, k);
    v.sweep = damp(v.sweep, ctl.sweep, k);
    v.curl = damp(v.curl, ctl.curl, k);
    for (let i = 0; i < ARM_COUNT; i++) {
      const w = (this.rigWeight[i] = damp(this.rigWeight[i], this.directive.armRig && ctl.arm === i ? 1 : 0, k));
      if (w < 0.002) continue;
      const arm = pose.arms[i];
      const mix = (a: number, b: number) => a + (b - a) * w;
      arm.yaw = mix(arm.yaw, ARM_HOME_YAW[i] + v.sweep);
      arm.pitch0 = mix(arm.pitch0, v.lift);
      arm.pitch1 = mix(arm.pitch1, v.lift * 0.55);
      arm.pitchBias = mix(arm.pitchBias, 1);
      arm.length = mix(arm.length, v.extend);
      arm.bend = mix(arm.bend, 0);
      arm.coil = mix(arm.coil, 0);
      arm.curl = mix(arm.curl, v.curl);
      arm.waveAmp = mix(arm.waveAmp, 0.02);
    }
  }

  private updateViewState(state: AppState, d: Directive, pose: PoseDefinition, dt: number, k: number): void {
    const u = this.octopus.skin.skin;
    const o = this.organsState;
    const selected = state.stage === 'anatomy' ? state.selectedStructure : null;
    const selectedInternal = !!selected && INTERNAL_STRUCTURE_IDS.has(selected);
    const selectedPart = selected && selected in EXTERNAL_PART ? EXTERNAL_PART[selected] : -1;

    let xray = 0;
    let explode = 0;
    let section = 0;
    let isolatePart = -1;
    let highlightPart = selectedPart;
    o.visibility = 0;
    o.nerves = 0;
    o.isolate = false;
    o.neuralOnly = false;
    o.selected = selected;

    switch (d.mode) {
      case 'xray':
        xray = 0.86;
        o.visibility = 1;
        o.nerves = 0.9;
        break;
      case 'exploded':
        explode = state.explodeProgress;
        xray = 0.5 + 0.42 * explode;
        o.visibility = 1;
        o.nerves = 0.6;
        break;
      case 'section':
        section = 1;
        o.visibility = 1;
        o.nerves = 1;
        break;
      case 'isolated':
        if (selectedInternal) {
          xray = 0.965;
          o.visibility = 1;
          o.isolate = true;
          o.nerves = selected === 'nervous-system' ? 1 : 0.04;
        } else if (selectedPart >= 0) {
          isolatePart = selectedPart;
          highlightPart = -1;
        }
        break;
      case 'neural':
        xray = 0.93;
        o.visibility = 1;
        o.neuralOnly = true;
        o.nerves = 1;
        break;
      default:
        break;
    }

    this.xray = damp(this.xray, xray, k);
    this.explode = damp(this.explode, explode, k);
    o.explode = this.explode;
    u.uTime.value = this.time;
    u.uXray.value = this.xray < 0.003 ? 0 : this.xray;
    u.uSection.value = section;
    u.uSectionX.value = state.sectionOffset * 0.2;
    u.uIsolatePart.value = isolatePart;
    u.uHighlightPart.value = highlightPart;

    // Arm highlights: arms involved in a mimicry transition glow during the arm phase;
    // the manually rigged arm glows in mechanism 3.
    const phase = this.controller.phase.id;
    const armPhase = d.involvedArms.length > 0 && (phase === 'prepare' || phase === 'arms') && !this.controller.finished;
    const hl = u.uArmHighlight.value;
    for (let i = 0; i < ARM_COUNT; i++) {
      let target = 0;
      if (armPhase && d.involvedArms.includes(i)) target = 0.85;
      if (d.armRig && state.armControl.arm === i) target = 0.9;
      this.armHighlight[i] = damp(this.armHighlight[i], target, k);
      hl[i] = this.armHighlight[i] < 0.003 ? 0 : this.armHighlight[i];
    }
    this.octopus.syncRenderState();

    // Nervous-system activity.
    const n = this.organs.nerveMaterial.nerve;
    let eye = 0;
    let optic = 0;
    let brain = 0;
    let out = 0;
    let inward = 0;
    let local = 0;
    if (d.nervousStep >= 0) {
      const s = d.nervousStep;
      eye = s === 0 ? 1 : 0;
      optic = s === 1 ? 1 : s === 2 ? 0.35 : 0;
      brain = s === 2 ? 1 : s === 3 || s === 5 ? 0.5 : 0;
      out = s === 3 ? 1 : s === 4 ? 0.45 : 0;
      local = s === 4 ? 1 : 0;
      inward = s === 5 ? 1 : 0;
    } else if (d.mode === 'neural') {
      out = 0.45;
      inward = 0.3;
      local = 0.25;
    }
    n.uPulseOut.value = damp(n.uPulseOut.value, out, k);
    n.uPulseIn.value = damp(n.uPulseIn.value, inward, k);
    n.uLocal.value = damp(n.uLocal.value, local, k);
    this.eyeGlow = damp(this.eyeGlow, eye, k);
    this.octopus.eyeGlow = this.eyeGlow;
    this.organs.setGlow('optic-lobes', optic);
    this.organs.setGlow('brain', brain);
    this.organs.update(dt, this.time, o, this.controller.playing);
    void pose;
  }

  // ───────────────────────────────────────────────────────── layout and rendering

  private resize(): void {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, QUALITY_TIERS[this.quality].pixelRatio));
    this.renderer.setSize(w, h, false);
    this.rig.setSize(w, h);
    if (!this.running && !this.disposed && this.octopus) this.render();
  }

  /** Read the DOM rectangles the layout reserves for the subject and for the reference animal. */
  private measureLayout(state: AppState): void {
    const canvasRect = this.canvas.getBoundingClientRect();
    const main = document.querySelector<HTMLElement>(`#stage-${state.stage} [data-viewport="main"]`);
    if (main) {
      const r = main.getBoundingClientRect();
      const x0 = Math.max(0, r.left - canvasRect.left);
      const y0 = Math.max(0, r.top - canvasRect.top);
      const x1 = Math.min(this.width, r.right - canvasRect.left);
      const y1 = Math.min(this.height, r.bottom - canvasRect.top);
      this.rig.setFreeRect(x0, y0, x1 - x0, y1 - y0);
    } else {
      this.rig.setFreeRect(0, 0, this.width, this.height);
    }
    if (!this.referenceEl || !this.referenceEl.isConnected) {
      this.referenceEl = document.querySelector<HTMLElement>('[data-viewport="reference"]');
    }
    const rr = this.refRect;
    rr.visible = false;
    if (this.referenceEl && this.directive.referenceModel) {
      const r = this.referenceEl.getBoundingClientRect();
      rr.x = Math.max(0, Math.round(r.left - canvasRect.left));
      rr.y = Math.max(0, Math.round(r.top - canvasRect.top));
      rr.w = Math.round(Math.min(this.width, r.right - canvasRect.left) - rr.x);
      rr.h = Math.round(Math.min(this.height, r.bottom - canvasRect.top) - rr.y);
      rr.visible = rr.w > 24 && rr.h > 24;
    }
  }

  private render(): void {
    const r = this.renderer;
    r.setScissorTest(false);
    r.setViewport(0, 0, this.width, this.height);
    r.clear();
    r.render(this.scene, this.rig.camera);

    const rr = this.refRect;
    if (rr.visible && this.reference && this.reference.id === this.directive.referenceModel) {
      const model = this.reference.model;
      const cam = this.rig.camera;
      // Same viewing angle as the main camera, scaled to the size of the reference animal.
      this.tmp.copy(cam.position).sub(this.rig.controls.target).multiplyScalar(model.focus.scale);
      this.tmp2.copy(REF_ORIGIN);
      this.tmp2.y += model.focus.y;
      this.refCamera.position.copy(this.tmp2).add(this.tmp);
      if (this.refCamera.position.y < 0.08) this.refCamera.position.y = 0.08;
      this.refCamera.lookAt(this.tmp2);
      this.refCamera.aspect = rr.w / rr.h;
      this.refCamera.updateProjectionMatrix();
      const y = this.height - rr.y - rr.h;
      r.setViewport(rr.x, y, rr.w, rr.h);
      r.setScissor(rr.x, y, rr.w, rr.h);
      r.setScissorTest(true);
      r.clear();
      r.render(this.scene, this.refCamera);
      r.setScissorTest(false);
    }
  }

  private writeBack(state: AppState): void {
    const c = this.controller;
    const patch: Partial<AppState> = {};
    const fps = Math.round(this.monitor.fps);
    if (fps !== state.fps) patch.fps = fps;
    if (this.directive.userPlayback) {
      const progress = Math.round(c.progress * 1000) / 1000;
      const phase = c.phase;
      if (progress !== state.playback.progress || phase.id !== state.playback.phaseId) {
        patch.playback = { ...state.playback, progress, phaseId: phase.id, phaseLabel: phase.label };
      }
    }
    if (Object.keys(patch).length) useAppStore.setState(patch);
  }

  // ───────────────────────────────────────────────────────── reference animals

  private ensureReference(id: ReferenceModelId | null): void {
    if (this.reference && this.reference.id !== id) {
      this.reference.model.dispose();
      this.reference = null;
    }
    if (!id || this.reference?.id === id || this.referenceLoading === id) return;
    this.referenceLoading = id;
    void loadReferenceModel(id).then((model) => {
      if (this.referenceLoading === id) this.referenceLoading = null;
      if (this.disposed || this.directive.referenceModel !== id || this.reference) {
        model.dispose();
        return;
      }
      model.group.position.add(REF_ORIGIN);
      this.scene.add(model.group);
      this.reference = { id, model };
    });
  }

  /**
   * Render a small still of a reference animal and return it as a data URL. Models are built
   * one at a time and disposed straight away, so thumbnails never hold all ten in memory.
   */
  renderThumbnail(id: ReferenceModelId, width = 320, height = 220): Promise<string> {
    const cached = this.thumbCache.get(id);
    if (cached) return cached;
    const job = this.thumbQueue.then(async () => {
      if (this.disposed) return '';
      const model = await loadReferenceModel(id);
      if (this.disposed) {
        model.dispose();
        return '';
      }
      model.group.position.add(THUMB_ORIGIN);
      model.update(1.3);
      this.scene.add(model.group);
      const target = new THREE.WebGLRenderTarget(width, height, { samples: 4 });
      const cam = new THREE.PerspectiveCamera(32, width / height, 0.05, 100);
      const look = this.tmp.copy(THUMB_ORIGIN);
      look.y += model.focus.y;
      const dist = 9.5 * model.focus.scale;
      cam.position.set(look.x + dist * 0.62, look.y + dist * 0.42, look.z + dist * 0.66);
      cam.lookAt(look);
      const r = this.renderer;
      r.setRenderTarget(target);
      r.setScissorTest(false);
      r.setViewport(0, 0, width, height);
      r.clear();
      r.render(this.scene, cam);
      const pixels = new Uint8Array(width * height * 4);
      r.readRenderTargetPixels(target, 0, 0, width, height, pixels);
      r.setRenderTarget(null);
      target.dispose();
      model.dispose();

      const out = document.createElement('canvas');
      out.width = width;
      out.height = height;
      const ctx = out.getContext('2d');
      if (!ctx) return '';
      const image = ctx.createImageData(width, height);
      // Render targets hold linear colour and are bottom-up: tone-map, gamma-encode and flip.
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const src = ((height - 1 - y) * width + x) * 4;
          const dst = (y * width + x) * 4;
          for (let ch = 0; ch < 3; ch++) {
            const v = (pixels[src + ch] / 255) * 1.25;
            image.data[dst + ch] = Math.round(255 * Math.pow(v / (1 + v * 0.25), 1 / 2.2));
          }
          image.data[dst + 3] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);
      return out.toDataURL('image/jpeg', 0.86);
    });
    this.thumbQueue = job.catch(() => undefined);
    this.thumbCache.set(id, job);
    return job;
  }

  // ───────────────────────────────────────────────────────── anchors

  /** World position of a named anchor. Returns false if the anchor is unknown. */
  private anchorWorld(id: string, out: THREE.Vector3): boolean {
    if (id.startsWith('skin:')) return this.skinPatch.anchor(id.slice(5), out);
    const oct = this.octopus;
    switch (id) {
      case 'mantle':
        oct.bodyPoint(0.62, 0.75, out);
        return true;
      case 'head':
        oct.bodyPoint(0.09, 0.78, out);
        return true;
      case 'eyes':
        oct.eyePoint(out);
        return true;
      case 'arms':
        oct.armPoint(2, 0.38, out);
        return true;
      case 'web':
        oct.armPoint(0, 0.05, out);
        oct.armPoint(2, 0.05, this.tmp2);
        out.lerp(this.tmp2, 0.5);
        return true;
      case 'suckers':
        oct.armPoint(1, 0.2, out, 1.1);
        return true;
      case 'funnel':
        oct.funnelPoint(out);
        return true;
      case 'skin':
        oct.bodyPoint(0.48, 0.02, out);
        return true;
      default:
        return this.organs.anchor(id, out);
    }
  }

  /** Project an anchor to CSS pixel coordinates in the canvas. */
  getAnchorScreen(id: string, out: ScreenPoint): ScreenPoint {
    out.visible = false;
    const isSkinAnchor = id.startsWith('skin:');
    if (isSkinAnchor !== this.skinView) return out;
    if (!this.anchorWorld(id, this.tmp)) return out;
    this.tmp.project(this.rig.camera);
    out.x = (this.tmp.x * 0.5 + 0.5) * this.width;
    out.y = (-this.tmp.y * 0.5 + 0.5) * this.height;
    out.visible = this.tmp.z > -1 && this.tmp.z < 1 && out.x > 0 && out.y > 0 && out.x < this.width && out.y < this.height;
    return out;
  }

  /** Subscribe to "a frame was rendered" (used to reposition HTML hotspots). */
  onFrame(fn: () => void): () => void {
    this.frameListeners.add(fn);
    return () => this.frameListeners.delete(fn);
  }

  // ───────────────────────────────────────────────────────── quality and lifecycle

  setQuality(level: QualityLevel): void {
    if (level === this.quality) return;
    this.quality = level;
    const tier = QUALITY_TIERS[level];
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.pixelRatio));
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.shadowMap.enabled = tier.shadows;
    this.octopus.setDetail(tier);
    this.organs.setDetail(tier.armSegments);
    this.env.setDetail(tier);
    this.scene.traverse((obj) => {
      const mat = (obj as THREE.Mesh).material as THREE.Material | undefined;
      if (mat && 'needsUpdate' in mat) mat.needsUpdate = true;
    });
    useAppStore.setState({ effectiveQuality: level });
  }

  debug(): EngineDebug {
    const stats = this.octopus.armStats();
    const u = this.octopus.skin.skin;
    const c = this.controller;
    const info = this.renderer.info;
    return {
      armCount: this.octopus.curves.length,
      armsFinite: stats.finite,
      armMinY: stats.minY,
      armMaxReach: stats.maxReach,
      poseKey: this.directive.poseKey,
      progress: c.progress,
      phase: c.phase.id,
      playing: c.playing,
      mode: this.directive.mode,
      xray: u.uXray.value,
      section: u.uSection.value,
      explode: this.explode,
      isolatePart: u.uIsolatePart.value,
      highlightPart: u.uHighlightPart.value,
      nerveOpacity: this.organs.nerveMaterial.nerve.uOpacity.value,
      visibleOrgans: this.organs.visibleIds(),
      skinPatchVisible: this.skinPatch.group.visible,
      bandExpansion: this.skinPatch.bandExpansion(),
      camera: this.rig.state(),
      referenceModel: this.reference?.id ?? null,
      referenceViewport: this.refRect.visible,
      quality: this.quality,
      fps: this.monitor.fps,
      running: this.running,
      renderer: {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        calls: info.render.calls,
        triangles: info.render.triangles,
      },
      bodyHeight: c.current.body.height,
      skinBandContrast: c.current.skin.bandContrast,
      armHighlights: [...u.uArmHighlight.value],
    };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.running = false;
    cancelAnimationFrame(this.raf);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.resizeObserver.disconnect();
    for (const un of this.unsubscribers) un();
    this.frameListeners.clear();
    this.reference?.model.dispose();
    this.reference = null;
    this.organs.dispose();
    this.octopus.dispose();
    this.octopus.root.removeFromParent();
    this.skinPatch.dispose();
    this.env.dispose();
    this.rig.dispose();
    this.renderer.renderLists.dispose();
    this.renderer.dispose();
    void REST_POSE;
  }
}
