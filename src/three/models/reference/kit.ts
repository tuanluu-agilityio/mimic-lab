import * as THREE from 'three';

/**
 * A simplified reference model of an animal (or object) the octopus is reported to resemble.
 * These are illustrative, low-detail models for comparing silhouette, colour and movement.
 * They are not anatomical reconstructions.
 */
export interface ReferenceModel {
  group: THREE.Group;
  /** Animate. `time` is the shared motion clock in seconds. */
  update(time: number): void;
  dispose(): void;
  /** Camera framing: point to look at (model-local) and a distance multiplier relative to the octopus view. */
  focus: { y: number; scale: number };
}

/** Collects everything a model allocates so it can be released in one call. */
export class Kit {
  readonly group = new THREE.Group();
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private seed: number;

  constructor(seed = 7) {
    this.seed = seed;
  }

  rnd = (): number => ((this.seed = (this.seed * 16807) % 2147483647) - 1) / 2147483646;

  geo<T extends THREE.BufferGeometry>(g: T): T {
    this.geometries.push(g);
    return g;
  }

  mat(params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
    const m = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0, ...params });
    this.materials.push(m);
    return m;
  }

  track<T extends THREE.Material>(m: T): T {
    this.materials.push(m);
    return m;
  }

  mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = this.group): THREE.Mesh {
    const mesh = new THREE.Mesh(this.geo(geometry), material);
    parent.add(mesh);
    return mesh;
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    this.group.removeFromParent();
  }
}

export interface LoftSection {
  /** Half width (x) and half height (y) of the cross-section, and its centre height. */
  w: number;
  h: number;
  y?: number;
}

/**
 * A body lofted along the Z axis (head at +Z) from elliptical cross-sections, with per-vertex
 * colour and a per-frame deformation callback (for undulation and fin beats).
 */
export class Loft {
  readonly mesh: THREE.Mesh;
  private readonly base: Float32Array;
  private readonly along: Float32Array;
  private readonly positions: Float32Array;

  constructor(
    kit: Kit,
    readonly length: number,
    rings: number,
    radial: number,
    section: (t: number) => LoftSection,
    colour: (t: number, angle: number, out: THREE.Color) => void,
    material?: THREE.MeshStandardMaterial,
  ) {
    const stride = radial + 1;
    const count = rings * stride;
    this.base = new Float32Array(count * 3);
    this.positions = new Float32Array(count * 3);
    this.along = new Float32Array(count);
    const colours = new Float32Array(count * 3);
    const index: number[] = [];
    const c = new THREE.Color();
    for (let j = 0; j < rings; j++) {
      const t = j / (rings - 1);
      const s = section(t);
      const z = length / 2 - t * length;
      for (let k = 0; k <= radial; k++) {
        const a = (k / radial) * Math.PI * 2;
        const v = j * stride + k;
        this.base[v * 3] = Math.cos(a) * s.w;
        this.base[v * 3 + 1] = (s.y ?? 0) + Math.sin(a) * s.h;
        this.base[v * 3 + 2] = z;
        this.along[v] = t;
        colour(t, a, c);
        colours[v * 3] = c.r;
        colours[v * 3 + 1] = c.g;
        colours[v * 3 + 2] = c.b;
      }
    }
    for (let j = 0; j < rings - 1; j++) {
      for (let k = 0; k < radial; k++) {
        const a = j * stride + k;
        const b = a + 1;
        const d = a + stride;
        const e = d + 1;
        index.push(a, d, b, b, d, e);
      }
    }
    this.positions.set(this.base);
    const g = kit.geo(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('color', new THREE.BufferAttribute(colours, 3));
    g.setIndex(index);
    g.computeVertexNormals();
    this.mesh = new THREE.Mesh(g, material ?? kit.mat({ vertexColors: true, roughness: 0.5 }));
    this.mesh.frustumCulled = false;
    kit.group.add(this.mesh);
  }

  /** Offset every vertex: fn(t along body, base x, base y) → [dx, dy] written into `out`. */
  deform(fn: (t: number, x: number, y: number, out: [number, number]) => void): void {
    const out: [number, number] = [0, 0];
    const n = this.along.length;
    for (let v = 0; v < n; v++) {
      out[0] = 0;
      out[1] = 0;
      fn(this.along[v], this.base[v * 3], this.base[v * 3 + 1], out);
      this.positions[v * 3] = this.base[v * 3] + out[0];
      this.positions[v * 3 + 1] = this.base[v * 3 + 1] + out[1];
    }
    const g = this.mesh.geometry;
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
  }
}

/** Alternating dark / light bands along a body. */
export function bands(t: number, count: number, dark: THREE.Color, light: THREE.Color, out: THREE.Color, duty = 0.5): void {
  const f = (t * count) % 1;
  out.copy(f < duty ? dark : light);
}

export const TAU = Math.PI * 2;
