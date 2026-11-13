import * as THREE from 'three';
import type { BodyPose } from '../../animation/types';
import { PART } from '../../materials/skinMaterial';

const HEAD_LENGTH = 0.3;
const HEAD_FRACTION = 0.24;
/** Resting mantle length in model units. */
export const MANTLE_LENGTH = 1.0;
/** Spine parameter at which the mantle frame (used for organs) is anchored. */
const NECK_U = 0.27;

/** Radius profile along the spine: (u, radius). Head bulge, neck, ovoid mantle. */
const PROFILE: [number, number][] = [
  [0, 0],
  [0.012, 0.05],
  [0.045, 0.1],
  [0.11, 0.148],
  [0.19, 0.142],
  [0.26, 0.128],
  [0.36, 0.165],
  [0.5, 0.215],
  [0.64, 0.228],
  [0.78, 0.2],
  [0.9, 0.135],
  [0.97, 0.065],
  [1, 0],
];

function buildProfileTable(size: number): Float32Array {
  const curve = new THREE.SplineCurve(PROFILE.map(([u, r]) => new THREE.Vector2(u, r)));
  const pts = curve.getPoints(600);
  const table = new Float32Array(size);
  let k = 0;
  for (let i = 0; i < size; i++) {
    const u = i / (size - 1);
    while (k < pts.length - 2 && pts[k + 1].x < u) k++;
    const a = pts[k];
    const b = pts[k + 1];
    const t = b.x > a.x ? (u - a.x) / (b.x - a.x) : 0;
    table[i] = Math.max(0, a.y + (b.y - a.y) * Math.min(1, Math.max(0, t)));
  }
  table[0] = 0;
  table[size - 1] = 0;
  return table;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Head and mantle as one lofted skin: rings of vertices along a bending spine.
 * Local frame: origin at the head centre, +Z forward, +Y up. Rebuilt every frame on the CPU.
 */
export class BodyMesh {
  readonly mesh: THREE.Mesh;
  readonly geometry: THREE.BufferGeometry;
  private readonly rings: number;
  private readonly radial: number;
  private readonly profile = buildProfileTable(256);
  private readonly positions: Float32Array;
  private readonly normals: Float32Array;
  /** Spine centre per ring (local), and the bend angle per ring. */
  private readonly spine: Float32Array;
  private readonly spineAngle: Float32Array;
  private readonly ringRx: Float32Array;
  private readonly ringRy: Float32Array;
  /** Mantle frame in body-local space, for attaching organs. */
  readonly mantleOrigin = new THREE.Vector3();
  mantleAngle = 0;

  constructor(material: THREE.Material, rings = 46, radial = 24) {
    this.rings = rings;
    this.radial = radial;
    const vertCount = rings * (radial + 1);
    this.positions = new Float32Array(vertCount * 3);
    this.normals = new Float32Array(vertCount * 3);
    this.spine = new Float32Array(rings * 3);
    this.spineAngle = new Float32Array(rings);
    this.ringRx = new Float32Array(rings);
    this.ringRy = new Float32Array(rings);

    const skin = new Float32Array(vertCount * 2);
    const part = new Float32Array(vertCount);
    const arm = new Float32Array(vertCount).fill(-1);
    for (let j = 0; j < rings; j++) {
      const u = j / (rings - 1);
      for (let k = 0; k <= radial; k++) {
        const v = j * (radial + 1) + k;
        skin[v * 2] = u;
        skin[v * 2 + 1] = k / radial;
        part[v] = u < NECK_U ? PART.HEAD : PART.MANTLE;
      }
    }
    const index: number[] = [];
    for (let j = 0; j < rings - 1; j++) {
      for (let k = 0; k < radial; k++) {
        const a = j * (radial + 1) + k;
        const b = a + 1;
        const c = a + (radial + 1);
        const d = c + 1;
        index.push(a, b, c, b, d, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('normal', new THREE.BufferAttribute(this.normals, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSkin', new THREE.BufferAttribute(skin, 2));
    g.setAttribute('aPart', new THREE.BufferAttribute(part, 1));
    g.setAttribute('aArm', new THREE.BufferAttribute(arm, 1));
    g.setIndex(index);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -0.5), 3);
    this.geometry = g;
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    this.mesh.name = 'octopus-body';
  }

  private radiusAt(u: number): number {
    const f = Math.min(1, Math.max(0, u)) * (this.profile.length - 1);
    const i = Math.floor(f);
    const t = f - i;
    const a = this.profile[i];
    const b = this.profile[Math.min(this.profile.length - 1, i + 1)];
    return a + (b - a) * t;
  }

  /** breath: -1..1 mantle breathing signal; pulse: extra mantle expansion. */
  update(pose: BodyPose, breath: number, pulse: number): void {
    const { rings, radial, positions, normals, spine, spineAngle, ringRx, ringRy } = this;
    const mantleLen = MANTLE_LENGTH * pose.mantleLength;
    let py = 0;
    let pz = HEAD_LENGTH / 2;
    let prevS = 0;
    for (let j = 0; j < rings; j++) {
      const u = j / (rings - 1);
      const s = u < HEAD_FRACTION ? (u / HEAD_FRACTION) * HEAD_LENGTH : HEAD_LENGTH + ((u - HEAD_FRACTION) / (1 - HEAD_FRACTION)) * mantleLen;
      const phi = pose.mantlePitch * smoothstep(0.16, 0.44, u);
      const dl = s - prevS;
      prevS = s;
      py += Math.sin(phi) * dl;
      pz -= Math.cos(phi) * dl;
      spine[j * 3] = 0;
      spine[j * 3 + 1] = py;
      spine[j * 3 + 2] = pz;
      spineAngle[j] = phi;

      const m = smoothstep(0.22, 0.36, u);
      const breathe = 1 + m * (0.028 * breath + pulse);
      const r = this.radiusAt(u);
      ringRx[j] = r * (1 + m * (pose.mantleWidth - 1)) * breathe;
      ringRy[j] = r * 0.9 * (1 + m * (pose.mantleHeight - 1)) * breathe;

      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      for (let k = 0; k <= radial; k++) {
        const a = (k / radial) * Math.PI * 2;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        // a = PI/2 is the ventral side, which is slightly flattened.
        const ry = ringRy[j] * (sa > 0 ? 0.84 : 1);
        const lx = ringRx[j] * ca;
        const lu = -ry * sa;
        const v = (j * (radial + 1) + k) * 3;
        positions[v] = lx;
        positions[v + 1] = py + lu * cosP;
        positions[v + 2] = pz + lu * sinP;
      }
      if (u <= NECK_U || j === 0) {
        this.mantleOrigin.set(0, py, pz);
      }
    }
    this.mantleAngle = pose.mantlePitch;

    // Normals from the grid neighbours.
    const stride = radial + 1;
    for (let j = 0; j < rings; j++) {
      const j0 = Math.max(0, j - 1);
      const j1 = Math.min(rings - 1, j + 1);
      for (let k = 0; k <= radial; k++) {
        const k0 = (k - 1 + radial) % radial;
        const k1 = (k + 1) % radial;
        const pu0 = (j0 * stride + k) * 3;
        const pu1 = (j1 * stride + k) * 3;
        const pv0 = (j * stride + k0) * 3;
        const pv1 = (j * stride + k1) * 3;
        const ux = positions[pu1] - positions[pu0];
        const uy = positions[pu1 + 1] - positions[pu0 + 1];
        const uz = positions[pu1 + 2] - positions[pu0 + 2];
        const vx = positions[pv1] - positions[pv0];
        const vy = positions[pv1 + 1] - positions[pv0 + 1];
        const vz = positions[pv1 + 2] - positions[pv0 + 2];
        let nx = vy * uz - vz * uy;
        let ny = vz * ux - vx * uz;
        let nz = vx * uy - vy * ux;
        let l = Math.hypot(nx, ny, nz);
        const v = (j * stride + k) * 3;
        if (l < 1e-9) {
          // Pole rings: point along the spine.
          const phi = spineAngle[j];
          const sign = j === 0 ? -1 : 1;
          nx = 0;
          ny = sign * Math.sin(phi);
          nz = -sign * Math.cos(phi);
          void sign;
          l = 1;
        }
        normals[v] = nx / l;
        normals[v + 1] = ny / l;
        normals[v + 2] = nz / l;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
  }

  /** Point on the skin surface in body-local space. `around`: 0 = animal's left, 0.25 = ventral, 0.75 = dorsal. */
  surfacePoint(u: number, around: number, out: THREE.Vector3, lift = 1): THREE.Vector3 {
    const j = Math.round(Math.min(1, Math.max(0, u)) * (this.rings - 1));
    const a = around * Math.PI * 2;
    const phi = this.spineAngle[j];
    const lu = -this.ringRy[j] * Math.sin(a) * lift;
    return out.set(
      this.ringRx[j] * Math.cos(a) * lift,
      this.spine[j * 3 + 1] + lu * Math.cos(phi),
      this.spine[j * 3 + 2] + lu * Math.sin(phi),
    );
  }

  dispose(): void {
    this.geometry.dispose();
  }
}
