import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CameraPresetName } from '@/types/app';

export interface CameraView {
  /** Horizontal angle around the target. 0 = in front of the animal, PI/2 = on its left side. */
  azimuth: number;
  /** Angle from straight above (0) to straight below (PI). */
  polar: number;
  distance: number;
  target: THREE.Vector3;
}

const PRESET_ANGLES: Record<Exclude<CameraPresetName, 'reset'>, { azimuth: number; polar: number }> = {
  front: { azimuth: 0, polar: 1.4 },
  side: { azimuth: Math.PI / 2, polar: 1.4 },
  rear: { azimuth: Math.PI, polar: 1.4 },
  top: { azimuth: 0, polar: 0.02 },
  bottom: { azimuth: 0, polar: Math.PI - 0.02 },
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Orbit camera with tweened presets, keyboard control and an off-centre principal point so the
 * subject sits in the free area of the layout rather than under a panel.
 */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  private readonly spherical = new THREE.Spherical();
  private readonly offset = new THREE.Vector3();
  private tween: { from: CameraView; to: CameraView; t: number; duration: number } | null = null;
  private home: CameraView = { azimuth: 0.6, polar: 1.25, distance: 8, target: new THREE.Vector3(0, 0.4, 0) };
  private readonly inset = { cx: 0.5, cy: 0.5, fit: 1 };
  private readonly insetTarget = { cx: 0.5, cy: 0.5, fit: 1 };
  private width = 1;
  private height = 1;
  reducedMotion = false;
  /** Free orbit below the seabed is only allowed in the anatomy explorer. */
  private allowBelow = false;
  private readonly onWheel: (e: WheelEvent) => void;
  private readonly onKey: (e: KeyboardEvent) => void;

  constructor(private readonly dom: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 400);
    // Plain wheel must scroll the page; only Ctrl/Cmd + wheel zooms. Registered before
    // OrbitControls so it can stop the event reaching the controls.
    this.onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) e.stopImmediatePropagation();
    };
    dom.addEventListener('wheel', this.onWheel, { capture: true });

    this.controls = new OrbitControls(this.camera, dom);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.9;
    this.controls.panSpeed = 0.7;
    this.controls.minDistance = 0.7;
    this.controls.maxDistance = 20;
    this.controls.autoRotateSpeed = 0.35;
    this.controls.addEventListener('start', () => {
      this.tween = null;
      this.controls.autoRotate = false;
    });

    this.onKey = (e) => {
      const step = e.shiftKey ? 0.25 : 0.12;
      switch (e.key) {
        case 'ArrowLeft':
          this.nudge(-step, 0, e.shiftKey);
          break;
        case 'ArrowRight':
          this.nudge(step, 0, e.shiftKey);
          break;
        case 'ArrowUp':
          this.nudge(0, -step, e.shiftKey);
          break;
        case 'ArrowDown':
          this.nudge(0, step, e.shiftKey);
          break;
        case '+':
        case '=':
          this.zoomBy(0.85);
          break;
        case '-':
        case '_':
          this.zoomBy(1 / 0.85);
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    dom.addEventListener('keydown', this.onKey);
    this.jumpTo(this.home);
  }

  /** Enable or disable pointer interaction (the intro lets touches scroll the page). */
  setInteractive(interactive: boolean, allowBelow: boolean): void {
    this.controls.enabled = interactive;
    this.dom.style.touchAction = interactive ? 'none' : 'pan-y';
    this.allowBelow = allowBelow;
    this.controls.maxPolarAngle = allowBelow ? Math.PI - 0.01 : Math.PI * 0.495;
  }

  setAutoRotate(on: boolean): void {
    this.controls.autoRotate = on && !this.reducedMotion;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.applyInset();
  }

  /**
   * Tell the rig which rectangle of the canvas (CSS pixels) is free for the subject.
   * The principal point glides to its centre and the image scales to fit.
   */
  setFreeRect(x: number, y: number, w: number, h: number): void {
    if (w < 40 || h < 40) return;
    this.insetTarget.cx = (x + w / 2) / this.width;
    this.insetTarget.cy = (y + h / 2) / this.height;
    const portrait = this.height > this.width;
    this.insetTarget.fit = Math.min(1, Math.max(0.42, Math.min(w / this.width, (h / this.height) * (portrait ? 1.5 : 1.15))));
  }

  private applyInset(): void {
    const { cx, cy, fit } = this.inset;
    const ox = (0.5 - cx) * this.width;
    const oy = (0.5 - cy) * this.height;
    this.camera.setViewOffset(this.width, this.height, ox, oy, this.width, this.height);
    this.camera.zoom = fit;
    this.camera.updateProjectionMatrix();
  }

  private currentView(): CameraView {
    this.offset.copy(this.camera.position).sub(this.controls.target);
    this.spherical.setFromVector3(this.offset);
    return {
      azimuth: this.spherical.theta,
      polar: this.spherical.phi,
      distance: this.spherical.radius,
      target: this.controls.target.clone(),
    };
  }

  private setView(v: CameraView): void {
    this.spherical.set(v.distance, Math.min(Math.PI - 0.005, Math.max(0.005, v.polar)), v.azimuth);
    this.offset.setFromSpherical(this.spherical);
    this.controls.target.copy(v.target);
    this.camera.position.copy(v.target).add(this.offset);
    this.camera.lookAt(v.target);
  }

  jumpTo(v: CameraView): void {
    this.tween = null;
    this.setView(v);
    this.controls.update();
  }

  /** Smoothly move to a view. The azimuth takes the shortest way round. */
  flyTo(v: Partial<CameraView>, duration = 1.15): void {
    const from = this.currentView();
    const to: CameraView = {
      azimuth: v.azimuth ?? from.azimuth,
      polar: v.polar ?? from.polar,
      distance: v.distance ?? from.distance,
      target: (v.target ?? from.target).clone(),
    };
    let d = (to.azimuth - from.azimuth) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    to.azimuth = from.azimuth + d;
    if (to.polar > Math.PI * 0.5 && !this.allowBelow) to.polar = Math.PI * 0.49;
    if (this.reducedMotion || duration <= 0) {
      this.jumpTo(to);
      return;
    }
    this.tween = { from, to, t: 0, duration };
  }

  setHome(v: CameraView, fly = true): void {
    this.home = { ...v, target: v.target.clone() };
    if (fly) this.flyTo(this.home, 1.4);
  }

  preset(name: CameraPresetName): void {
    if (name === 'reset') {
      this.flyTo(this.home);
      return;
    }
    const a = PRESET_ANGLES[name];
    this.flyTo({ azimuth: a.azimuth, polar: a.polar, distance: this.home.distance, target: this.home.target });
  }

  zoomBy(factor: number): void {
    const v = this.currentView();
    const distance = Math.min(this.controls.maxDistance, Math.max(this.controls.minDistance, v.distance * factor));
    this.flyTo({ distance }, 0.35);
  }

  private nudge(dAzimuth: number, dPolar: number, pan: boolean): void {
    const v = this.currentView();
    this.controls.autoRotate = false;
    if (pan) {
      const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1);
      v.target.addScaledVector(right, dAzimuth * v.distance * 0.4).addScaledVector(up, -dPolar * v.distance * 0.4);
    } else {
      v.azimuth += dAzimuth;
      v.polar = Math.min(this.controls.maxPolarAngle, Math.max(0.02, v.polar + dPolar));
    }
    this.jumpTo(v);
  }

  update(dt: number): void {
    const k = this.reducedMotion ? 1 : 1 - Math.exp(-dt * 4);
    const i = this.inset;
    const t = this.insetTarget;
    if (Math.abs(i.cx - t.cx) + Math.abs(i.cy - t.cy) + Math.abs(i.fit - t.fit) > 1e-4) {
      i.cx += (t.cx - i.cx) * k;
      i.cy += (t.cy - i.cy) * k;
      i.fit += (t.fit - i.fit) * k;
      this.applyInset();
    }
    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, tw.t + dt / tw.duration);
      const e = easeInOut(tw.t);
      this.setView({
        azimuth: tw.from.azimuth + (tw.to.azimuth - tw.from.azimuth) * e,
        polar: tw.from.polar + (tw.to.polar - tw.from.polar) * e,
        distance: tw.from.distance + (tw.to.distance - tw.from.distance) * e,
        target: tw.from.target.clone().lerp(tw.to.target, e),
      });
      if (tw.t >= 1) this.tween = null;
    }
    this.controls.update(dt);
  }

  /** Snapshot for tests and debugging. */
  state(): { azimuth: number; polar: number; distance: number; target: [number, number, number] } {
    const v = this.currentView();
    return { azimuth: v.azimuth, polar: v.polar, distance: v.distance, target: [v.target.x, v.target.y, v.target.z] };
  }

  dispose(): void {
    this.dom.removeEventListener('wheel', this.onWheel, { capture: true });
    this.dom.removeEventListener('keydown', this.onKey);
    this.controls.dispose();
  }
}
