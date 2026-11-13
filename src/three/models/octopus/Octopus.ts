import * as THREE from 'three';
import { armBase, computeArmCurve, createArmCurve, type ArmCurve } from '../../animation/armCurve';
import type { PoseController } from '../../animation/PoseController';
import { ARM_HOME_YAW } from '../../animation/restPose';
import { ARM_COUNT, type PoseDefinition } from '../../animation/types';
import type { QualityTier } from '../../core/quality';
import {
  addSkinAttributes,
  applySkinPattern,
  createSkinMaterial,
  PART,
  syncSkinRenderState,
  type SkinMaterial,
} from '../../materials/skinMaterial';
import { ArmsMesh } from './ArmsMesh';
import { BodyMesh } from './BodyMesh';
import { Suckers } from './Suckers';
import { WebMesh } from './WebMesh';

const TAU = Math.PI * 2;

/**
 * The procedural mimic octopus. One instance, one rig: every posture is produced by feeding
 * a PoseDefinition into `update`. Nothing is swapped or hidden to change identity.
 *
 * Scene graph:
 *   root (rig space, sand at y = 0)
 *   ├─ bodyGroup (head centre; yaw / pitch / roll)  → body skin, eyes, funnel, organ mounts
 *   ├─ arms (rig space)
 *   ├─ suckers (rig space, instanced)
 *   └─ web (rig space)
 */
export class Octopus {
  readonly root = new THREE.Group();
  readonly bodyGroup = new THREE.Group();
  /** Mount for organs that live in the mantle; follows mantle pitch and scale. */
  readonly mantleMount = new THREE.Group();
  /** Mount for organs that live in the head. */
  readonly headMount = new THREE.Group();
  readonly skin: SkinMaterial;
  private readonly webSkin: SkinMaterial;
  readonly body: BodyMesh;
  readonly curves: ArmCurve[] = [];
  private arms!: ArmsMesh;
  private suckers!: Suckers;
  private readonly web: WebMesh;
  private readonly eyes: THREE.Group[] = [];
  private readonly eyeMaterials: THREE.Material[] = [];
  private readonly funnel: THREE.Mesh;
  private readonly staticGeometries: THREE.BufferGeometry[] = [];
  private readonly base = { x: 0, y: 0, z: 0 };
  private readonly tmp = new THREE.Vector3();
  private breathPhase = 0;
  /** Extra glow on the eyes for the nervous-system demonstration (0..1). */
  eyeGlow = 0;
  private irisMaterial!: THREE.MeshStandardMaterial;

  constructor(tier: QualityTier) {
    this.root.name = 'octopus';
    this.bodyGroup.rotation.order = 'YXZ';
    this.root.add(this.bodyGroup);
    this.skin = createSkinMaterial();
    this.webSkin = createSkinMaterial(this.skin.skin, true);

    this.body = new BodyMesh(this.skin);
    this.bodyGroup.add(this.body.mesh, this.mantleMount, this.headMount);

    this.buildEyes();
    this.funnel = this.buildFunnel();

    this.web = new WebMesh(this.webSkin);
    this.web.mesh.castShadow = true;
    this.root.add(this.web.mesh);

    this.setDetail(tier);
  }

  /** (Re)build tessellation-dependent parts for a quality tier. */
  setDetail(tier: QualityTier): void {
    if (this.arms) {
      this.root.remove(this.arms.mesh, this.suckers.mesh);
      this.arms.dispose();
      this.suckers.dispose();
    }
    this.curves.length = 0;
    for (let i = 0; i < ARM_COUNT; i++) this.curves.push(createArmCurve(tier.armSegments));
    this.arms = new ArmsMesh(this.skin, tier.armSegments, tier.armRadial);
    this.arms.mesh.castShadow = true;
    this.arms.mesh.receiveShadow = true;
    this.suckers = new Suckers(tier.suckerPairs, tier.suckerRadial);
    this.root.add(this.arms.mesh, this.suckers.mesh);
  }

  private buildEyes(): void {
    const stalkGeo = addSkinAttributes(new THREE.SphereGeometry(0.066, 20, 14), PART.HEAD, 0.12);
    const papillaGeo = addSkinAttributes(new THREE.ConeGeometry(0.016, 0.1, 10, 3), PART.HEAD, 0.1);
    const ballGeo = new THREE.SphereGeometry(0.046, 20, 14);
    const pupilGeo = new THREE.SphereGeometry(0.046, 16, 10);
    this.staticGeometries.push(stalkGeo, papillaGeo, ballGeo, pupilGeo);
    this.irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a6a2c,
      roughness: 0.18,
      metalness: 0.1,
      emissive: 0x62e6e0,
      emissiveIntensity: 0,
    });
    const pupil = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.1 });
    this.eyeMaterials.push(this.irisMaterial, pupil);
    for (const side of [1, -1]) {
      const eye = new THREE.Group();
      const stalk = new THREE.Mesh(stalkGeo, this.skin);
      stalk.scale.set(1, 1.25, 1.05);
      stalk.castShadow = true;
      const ball = new THREE.Mesh(ballGeo, this.irisMaterial);
      ball.position.set(side * 0.034, 0.012, 0.004);
      // Horizontal slit pupil, characteristic of octopuses.
      const slit = new THREE.Mesh(pupilGeo, pupil);
      slit.position.set(side * 0.044, 0.012, 0.004);
      slit.scale.set(0.62, 0.2, 0.78);
      const papilla = new THREE.Mesh(papillaGeo, this.skin);
      papilla.position.set(side * 0.004, 0.105, -0.004);
      papilla.rotation.z = -side * 0.18;
      eye.add(stalk, ball, slit, papilla);
      eye.userData.side = side;
      this.eyes.push(eye);
      this.bodyGroup.add(eye);
    }
  }

  private buildFunnel(): THREE.Mesh {
    const geo = addSkinAttributes(new THREE.CylinderGeometry(0.03, 0.05, 0.19, 14, 2, true), PART.HEAD, 0.2);
    this.staticGeometries.push(geo);
    const funnelSkin = createSkinMaterial(this.skin.skin, true);
    this.eyeMaterials.push(funnelSkin);
    const mesh = new THREE.Mesh(geo, funnelSkin);
    mesh.name = 'octopus-funnel';
    // The funnel opens beside the head on the animal's ventral-left side, pointing forward.
    mesh.position.set(0.105, -0.085, -0.13);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.45, -0.25, 0.85).normalize());
    this.bodyGroup.add(mesh);
    return mesh;
  }

  /** Apply a pose. `dt` only advances the breathing clock. */
  update(pose: PoseDefinition, clocks: PoseController, dt: number, motionScale = 1): void {
    const m = pose.movement;
    this.breathPhase += dt * 0.28 * (clocks.playing ? clocks.speed : 0);
    const breath = Math.sin(this.breathPhase * TAU);
    const pulse = m.pulseAmp * Math.max(0, Math.sin(clocks.pulsePhase * TAU));
    const bob = m.bobAmp * Math.sin(clocks.bobPhase * TAU) * motionScale;
    const yaw = m.swayAmp * Math.sin(clocks.swayPhase * TAU) * motionScale;
    const roll = m.rollAmp * Math.sin(clocks.swayPhase * TAU + Math.PI / 2) * motionScale;
    const headY = pose.body.height + bob;

    this.bodyGroup.position.set(0, headY, 0);
    this.bodyGroup.rotation.set(pose.body.headPitch, yaw, roll);
    this.body.update(pose.body, breath, pulse);

    this.mantleMount.position.copy(this.body.mantleOrigin);
    this.mantleMount.rotation.set(this.body.mantleAngle, 0, 0);
    this.mantleMount.scale.set(
      pose.body.mantleWidth * (1 + 0.02 * breath + pulse),
      pose.body.mantleHeight * (1 + 0.02 * breath + pulse),
      pose.body.mantleLength,
    );

    for (const eye of this.eyes) {
      const side = eye.userData.side as number;
      eye.position.set(side * 0.088, 0.075 + 0.075 * pose.body.eyeRaise, 0.035);
    }
    this.irisMaterial.emissiveIntensity = this.eyeGlow * 1.6;
    // The funnel flares with each mantle pulse (jetting).
    const flare = 1 + pulse * 3 + 0.04 * breath;
    this.funnel.scale.set(flare, 1, flare);

    for (let i = 0; i < ARM_COUNT; i++) {
      armBase(this.base, 0, headY, 0, ARM_HOME_YAW[i], yaw);
      const arm = pose.arms[i];
      const curve = this.curves[i];
      if (motionScale === 1) {
        computeArmCurve(curve, arm, this.base, { homeYaw: ARM_HOME_YAW[i], phase: clocks.armPhase[i], bodyYaw: yaw });
      } else {
        const amp = arm.waveAmp;
        arm.waveAmp = amp * motionScale;
        computeArmCurve(curve, arm, this.base, { homeYaw: ARM_HOME_YAW[i], phase: clocks.armPhase[i], bodyYaw: yaw });
        arm.waveAmp = amp;
      }
      this.arms.writeArm(i, curve);
      this.suckers.writeArm(i, curve);
    }
    this.arms.commit();
    this.suckers.commit();
    this.web.update(this.curves, 0.03 + 0.085 * pose.body.webSpread);

    applySkinPattern(this.skin, pose.skin);
  }

  /** Call after changing x-ray / isolate / section uniforms. */
  syncRenderState(): void {
    syncSkinRenderState(this.skin);
    syncSkinRenderState(this.webSkin);
    const u = this.skin.skin;
    const armsGhost = u.uIsolatePart.value > -0.5 && u.uIsolatePart.value !== PART.ARM ? 0.97 : u.uXray.value;
    this.suckers.setOpacity(1 - Math.min(1, armsGhost * 1.15));
    const eyeVisible = u.uXray.value < 0.6 && (u.uIsolatePart.value < -0.5 || u.uIsolatePart.value === PART.HEAD);
    for (const eye of this.eyes) {
      eye.children[1].visible = eyeVisible;
      eye.children[2].visible = eyeVisible;
    }
  }

  /** World position of a point along an arm. `oral` offsets toward the sucker side by that many radii. */
  armPoint(arm: number, t: number, out: THREE.Vector3, oral = 0): THREE.Vector3 {
    const c = this.curves[arm];
    const j = Math.min(c.count - 1, Math.max(0, Math.round(t * (c.count - 1))));
    const o = j * 3;
    out.set(
      c.pos[o] + c.nor[o] * c.rad[j] * oral,
      c.pos[o + 1] + c.nor[o + 1] * c.rad[j] * oral,
      c.pos[o + 2] + c.nor[o + 2] * c.rad[j] * oral,
    );
    return this.root.localToWorld(out);
  }

  /** World position of a point on the head / mantle skin. */
  bodyPoint(u: number, around: number, out: THREE.Vector3, lift = 1): THREE.Vector3 {
    this.body.surfacePoint(u, around, out, lift);
    return this.bodyGroup.localToWorld(out);
  }

  eyePoint(out: THREE.Vector3): THREE.Vector3 {
    return this.eyes[0].localToWorld(out.set(0.05, 0.02, 0));
  }

  funnelPoint(out: THREE.Vector3): THREE.Vector3 {
    return this.funnel.localToWorld(out.set(0, 0.1, 0));
  }

  /** Lowest and highest finite y over all arm curve points (used by tests / debug). */
  armStats(): { finite: boolean; minY: number; maxReach: number } {
    let finite = true;
    let minY = Infinity;
    let maxReach = 0;
    for (const c of this.curves) {
      for (let i = 0; i < c.count; i++) {
        const x = c.pos[i * 3];
        const y = c.pos[i * 3 + 1];
        const z = c.pos[i * 3 + 2];
        if (!Number.isFinite(x + y + z)) finite = false;
        minY = Math.min(minY, y);
        maxReach = Math.max(maxReach, Math.hypot(x, z));
      }
    }
    return { finite, minY, maxReach };
  }

  dispose(): void {
    this.body.dispose();
    this.arms.dispose();
    this.suckers.dispose();
    this.web.dispose();
    for (const g of this.staticGeometries) g.dispose();
    for (const m of this.eyeMaterials) m.dispose();
    this.skin.dispose();
    this.webSkin.dispose();
    void this.tmp;
  }
}
