import * as THREE from 'three';
import type { ArmCurve } from '../../animation/armCurve';
import { ARM_COUNT } from '../../animation/types';
import { PART } from '../../materials/skinMaterial';

/** Neighbouring arms around the crown: L1 → L2 → L3 → L4 → R4 → R3 → R2 → R1 → L1. */
const RING_ORDER = [0, 2, 4, 6, 7, 5, 3, 1];
const ALONG = 7;
const ACROSS = 6;

/**
 * The interbrachial web: a thin membrane joining the bases of neighbouring arms.
 * In this species the web is shallow, so it only spans a short distance from the crown.
 */
export class WebMesh {
  readonly mesh: THREE.Mesh;
  readonly geometry: THREE.BufferGeometry;
  private readonly positions: Float32Array;

  constructor(material: THREE.Material) {
    const perSector = (ALONG + 1) * (ACROSS + 1);
    const total = perSector * ARM_COUNT;
    this.positions = new Float32Array(total * 3);
    const skin = new Float32Array(total * 2);
    const part = new Float32Array(total).fill(PART.WEB);
    const arm = new Float32Array(total).fill(-1);
    const index: number[] = [];
    for (let s = 0; s < ARM_COUNT; s++) {
      const off = s * perSector;
      for (let j = 0; j <= ALONG; j++) {
        for (let k = 0; k <= ACROSS; k++) {
          const v = off + j * (ACROSS + 1) + k;
          skin[v * 2] = (j / ALONG) * 0.1;
          skin[v * 2 + 1] = 0.75;
          arm[v] = RING_ORDER[s];
        }
      }
      for (let j = 0; j < ALONG; j++) {
        for (let k = 0; k < ACROSS; k++) {
          const a = off + j * (ACROSS + 1) + k;
          const b = a + 1;
          const c = a + (ACROSS + 1);
          const d = c + 1;
          index.push(a, c, b, b, c, d);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(total * 3), 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSkin', new THREE.BufferAttribute(skin, 2));
    g.setAttribute('aPart', new THREE.BufferAttribute(part, 1));
    g.setAttribute('aArm', new THREE.BufferAttribute(arm, 1));
    g.setIndex(index);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    this.geometry = g;
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.frustumCulled = false;
    this.mesh.name = 'octopus-web';
  }

  /** depth: fraction of the arm length covered by the web (roughly 0.04..0.16). */
  update(curves: ArmCurve[], depth: number): void {
    const p = this.positions;
    const perSector = (ALONG + 1) * (ACROSS + 1);
    for (let s = 0; s < ARM_COUNT; s++) {
      const ca = curves[RING_ORDER[s]];
      const cb = curves[RING_ORDER[(s + 1) % ARM_COUNT]];
      const last = ca.count - 1;
      for (let j = 0; j <= ALONG; j++) {
        const f = (j / ALONG) * depth * last;
        const i0 = Math.min(last - 1, Math.floor(f));
        const t = f - i0;
        const o = i0 * 3;
        // Points on the aboral (upper) flank of each arm.
        const ra = ca.rad[i0] * 0.55;
        const rb = cb.rad[i0] * 0.55;
        const ax = ca.pos[o] + (ca.pos[o + 3] - ca.pos[o]) * t - ca.nor[o] * ra;
        const ay = ca.pos[o + 1] + (ca.pos[o + 4] - ca.pos[o + 1]) * t - ca.nor[o + 1] * ra;
        const az = ca.pos[o + 2] + (ca.pos[o + 5] - ca.pos[o + 2]) * t - ca.nor[o + 2] * ra;
        const bx = cb.pos[o] + (cb.pos[o + 3] - cb.pos[o]) * t - cb.nor[o] * rb;
        const by = cb.pos[o + 1] + (cb.pos[o + 4] - cb.pos[o + 1]) * t - cb.nor[o + 1] * rb;
        const bz = cb.pos[o + 2] + (cb.pos[o + 5] - cb.pos[o + 2]) * t - cb.nor[o + 2] * rb;
        const gap = Math.hypot(bx - ax, by - ay, bz - az);
        // The free edge of the web is concave between the arms.
        const edge = j / ALONG;
        for (let k = 0; k <= ACROSS; k++) {
          const v = k / ACROSS;
          const sag = Math.sin(Math.PI * v);
          const idx = (s * perSector + j * (ACROSS + 1) + k) * 3;
          p[idx] = ax + (bx - ax) * v;
          p[idx + 1] = ay + (by - ay) * v - sag * gap * 0.12 * edge;
          p[idx + 2] = az + (bz - az) * v;
        }
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  dispose(): void {
    this.geometry.dispose();
  }
}
