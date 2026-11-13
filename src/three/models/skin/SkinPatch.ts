import * as THREE from 'three';
import type { SkinLayer } from '@/types/app';

/** Where the magnified skin block lives in the scene (far above the seabed, out of the fog). */
export const SKIN_ORIGIN = new THREE.Vector3(0, 60, 0);

const SIZE = 4;
const LAYER_Y = { epidermis: 1.72, chromatophores: 1.3, iridophores: 0.86, leucophores: 0.46, dermis: 0.0 } as const;
type LayerId = keyof typeof LAYER_Y;

const PIGMENTS = [new THREE.Color(0xd9a12c), new THREE.Color(0xa6401f), new THREE.Color(0x2b1408)];
const MUSCLES_PER_CELL = 14;

interface Chromatophore {
  x: number;
  z: number;
  /** 0..1: how strongly this cell is driven when the "band" pattern is activated. */
  drive: number;
  pigment: number;
  size: number;
  current: number;
}

/**
 * A magnified, layered block of cephalopod skin (schematic, not to scale):
 * epidermis → chromatophore organs (pigment sac + radial muscles + nerve) → iridophores →
 * leucophores → dermis and muscle.
 *
 * `activation` drives the radial muscles of the chromatophores that form one dark band, so
 * expanding them shows how a pattern appears on the animal.
 */
export class SkinPatch {
  readonly group = new THREE.Group();
  private readonly layers: Record<LayerId, THREE.Group>;
  private readonly materials: THREE.Material[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly cells: Chromatophore[] = [];
  private readonly sacs: THREE.InstancedMesh;
  private readonly muscles: THREE.LineSegments;
  private readonly musclePositions: Float32Array;
  private readonly nerves: THREE.LineSegments;
  private readonly nerveMaterial: THREE.LineBasicMaterial;
  private readonly layerMaterials: Record<LayerId, THREE.Material[]>;
  private readonly matrix = new THREE.Matrix4();
  private readonly quat = new THREE.Quaternion();
  private readonly scale = new THREE.Vector3();
  private readonly pos = new THREE.Vector3();
  private activation = 0;
  private readonly layerOpacity: Record<LayerId, number> = {
    epidermis: 1,
    chromatophores: 1,
    iridophores: 1,
    leucophores: 1,
    dermis: 1,
  };

  constructor() {
    this.group.position.copy(SKIN_ORIGIN);
    this.group.name = 'skin-patch';
    this.group.visible = false;
    const mk = (id: LayerId) => {
      const g = new THREE.Group();
      g.position.y = LAYER_Y[id];
      g.name = `skin-${id}`;
      this.group.add(g);
      return g;
    };
    this.layers = {
      dermis: mk('dermis'),
      leucophores: mk('leucophores'),
      iridophores: mk('iridophores'),
      chromatophores: mk('chromatophores'),
      epidermis: mk('epidermis'),
    };
    const track = <T extends THREE.Material>(m: T) => {
      this.materials.push(m);
      return m;
    };
    const geo = <T extends THREE.BufferGeometry>(g: T) => {
      this.geometries.push(g);
      return g;
    };
    let seed = 4242;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    // Own lighting: the block floats far from the seabed lights' shadow frustum.
    const lamp = new THREE.PointLight(0xffffff, 60, 30);
    lamp.position.set(3, 7, 4);
    this.group.add(lamp);

    // Dermis and muscle base.
    const dermisMat = track(new THREE.MeshStandardMaterial({ color: 0x9c5a52, roughness: 0.8, transparent: true }));
    const base = new THREE.Mesh(geo(new THREE.BoxGeometry(SIZE, 0.34, SIZE)), dermisMat);
    base.position.y = -0.17;
    this.layers.dermis.add(base);
    const fibreMat = track(new THREE.MeshStandardMaterial({ color: 0xc27c70, roughness: 0.7, transparent: true }));
    const fibreGeo = geo(new THREE.CylinderGeometry(0.035, 0.035, SIZE, 6));
    for (let i = 0; i < 16; i++) {
      const f = new THREE.Mesh(fibreGeo, fibreMat);
      f.rotation.z = Math.PI / 2;
      f.position.set(0, 0.03, -SIZE / 2 + 0.14 + i * ((SIZE - 0.28) / 15));
      this.layers.dermis.add(f);
    }

    // Leucophores: matte white, diffusely scattering cells.
    const leucoMat = track(new THREE.MeshStandardMaterial({ color: 0xf4f1e6, roughness: 1, transparent: true }));
    const leuco = new THREE.InstancedMesh(geo(new THREE.SphereGeometry(0.15, 10, 8)), leucoMat, 260);
    for (let i = 0; i < 260; i++) {
      this.pos.set((rnd() - 0.5) * (SIZE - 0.3), (rnd() - 0.5) * 0.12, (rnd() - 0.5) * (SIZE - 0.3));
      this.scale.set(0.8 + rnd() * 0.6, 0.45 + rnd() * 0.2, 0.8 + rnd() * 0.6);
      leuco.setMatrixAt(i, this.matrix.compose(this.pos, this.quat.identity(), this.scale));
    }
    this.layers.leucophores.add(leuco);

    // Iridophores: stacks of thin reflective platelets, tilted at varying angles.
    const iridoMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0x7fd6c8,
        metalness: 0.75,
        roughness: 0.22,
        iridescence: 1,
        iridescenceIOR: 1.6,
        iridescenceThicknessMinimum: 180,
        iridescenceThicknessMaximum: 520,
        transparent: true,
      }),
    );
    const irido = new THREE.InstancedMesh(geo(new THREE.BoxGeometry(0.2, 0.012, 0.09)), iridoMat, 520);
    const euler = new THREE.Euler();
    let n = 0;
    for (let c = 0; c < 104; c++) {
      const cx = (rnd() - 0.5) * (SIZE - 0.4);
      const cz = (rnd() - 0.5) * (SIZE - 0.4);
      euler.set((rnd() - 0.5) * 0.9, rnd() * Math.PI, (rnd() - 0.5) * 0.9);
      this.quat.setFromEuler(euler);
      for (let p = 0; p < 5; p++) {
        this.pos.set(cx, (p - 2) * 0.028, cz);
        this.scale.set(1, 1, 1);
        irido.setMatrixAt(n++, this.matrix.compose(this.pos, this.quat, this.scale));
      }
    }
    this.layers.iridophores.add(irido);

    // Chromatophores.
    const grid = 9;
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const x = ((i + 0.5) / grid - 0.5) * (SIZE - 0.2) + (rnd() - 0.5) * 0.16;
        const z = ((j + 0.5) / grid - 0.5) * (SIZE - 0.2) + (rnd() - 0.5) * 0.16;
        // A band across the block (along z) is strongly driven; the rest only weakly.
        const band = Math.exp(-Math.pow(x / 0.72, 2));
        const pigment = band > 0.5 ? (rnd() < 0.75 ? 2 : 1) : rnd() < 0.5 ? 0 : 1;
        this.cells.push({ x, z, drive: 0.12 + 0.88 * band, pigment, size: 0.85 + rnd() * 0.3, current: 0 });
      }
    }
    const sacMat = track(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, transparent: true }));
    this.sacs = new THREE.InstancedMesh(geo(new THREE.SphereGeometry(1, 20, 12)), sacMat, this.cells.length);
    this.sacs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.cells.forEach((c, i) => this.sacs.setColorAt(i, PIGMENTS[c.pigment]));
    this.layers.chromatophores.add(this.sacs);

    this.musclePositions = new Float32Array(this.cells.length * MUSCLES_PER_CELL * 6);
    const muscleGeo = geo(new THREE.BufferGeometry());
    muscleGeo.setAttribute('position', new THREE.BufferAttribute(this.musclePositions, 3).setUsage(THREE.DynamicDrawUsage));
    const muscleMat = track(new THREE.LineBasicMaterial({ color: 0xe9a5a0, transparent: true, opacity: 0.85 }));
    this.muscles = new THREE.LineSegments(muscleGeo, muscleMat);
    this.muscles.frustumCulled = false;
    this.layers.chromatophores.add(this.muscles);

    // One motor nerve branch per chromatophore, rising from the dermis.
    const nervePos = new Float32Array(this.cells.length * 6);
    this.cells.forEach((c, i) => {
      nervePos.set([c.x * 0.86, -1.0, c.z * 0.86, c.x, -0.03, c.z], i * 6);
    });
    const nerveGeo = geo(new THREE.BufferGeometry());
    nerveGeo.setAttribute('position', new THREE.BufferAttribute(nervePos, 3));
    this.nerveMaterial = track(new THREE.LineBasicMaterial({ color: 0xffe6a3, transparent: true, opacity: 0.25 }));
    this.nerves = new THREE.LineSegments(nerveGeo, this.nerveMaterial);
    this.layers.chromatophores.add(this.nerves);

    // Epidermis: a thin transparent sheet.
    const epiMat = track(
      new THREE.MeshPhysicalMaterial({
        color: 0xdfeee8,
        roughness: 0.2,
        transmission: 0,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const epi = new THREE.Mesh(geo(new THREE.BoxGeometry(SIZE, 0.07, SIZE)), epiMat);
    epi.renderOrder = 5;
    this.layers.epidermis.add(epi);

    this.layerMaterials = {
      epidermis: [epiMat],
      chromatophores: [sacMat, muscleMat, this.nerveMaterial],
      iridophores: [iridoMat],
      leucophores: [leucoMat],
      dermis: [dermisMat, fibreMat],
    };
    this.writeChromatophores(1, true);
  }

  private writeChromatophores(k: number, force = false): void {
    const mp = this.musclePositions;
    let changed = force;
    this.cells.forEach((c, i) => {
      const target = Math.min(1, this.activation * c.drive * 1.15);
      const next = c.current + (target - c.current) * k;
      if (Math.abs(next - c.current) > 1e-4) changed = true;
      c.current = next;
      // The elastic sac is a tiny dot at rest; the radial muscles pull it out into a thin disc.
      const r = (0.045 + 0.175 * c.current) * c.size;
      const thickness = 0.06 * (1 - 0.72 * c.current);
      this.pos.set(c.x, 0, c.z);
      this.scale.set(r, thickness, r);
      this.sacs.setMatrixAt(i, this.matrix.compose(this.pos, this.quat.identity(), this.scale));
      const anchor = 0.24 * c.size;
      for (let m = 0; m < MUSCLES_PER_CELL; m++) {
        const a = (m / MUSCLES_PER_CELL) * Math.PI * 2;
        const o = (i * MUSCLES_PER_CELL + m) * 6;
        mp[o] = c.x + Math.cos(a) * r;
        mp[o + 1] = 0;
        mp[o + 2] = c.z + Math.sin(a) * r;
        mp[o + 3] = c.x + Math.cos(a) * anchor;
        mp[o + 4] = 0;
        mp[o + 5] = c.z + Math.sin(a) * anchor;
      }
    });
    if (changed) {
      this.sacs.instanceMatrix.needsUpdate = true;
      this.muscles.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * @param activation 0..1 neural drive to the chromatophore muscles
   * @param layer selected layer ('all' shows everything)
   */
  update(dt: number, time: number, activation: number, layer: SkinLayer): void {
    this.activation = activation;
    // Chromatophores respond within a fraction of a second.
    this.writeChromatophores(1 - Math.exp(-dt * 9));
    this.nerveMaterial.opacity = 0.18 + 0.75 * activation * (0.75 + 0.25 * Math.sin(time * 9));
    const k = 1 - Math.exp(-dt * 8);
    (Object.keys(this.layers) as LayerId[]).forEach((id) => {
      const target = layer === 'all' || layer === id ? 1 : 0.07;
      const o = (this.layerOpacity[id] += (target - this.layerOpacity[id]) * k);
      for (const m of this.layerMaterials[id]) {
        if (m === this.nerveMaterial) m.opacity *= o;
        else m.opacity = id === 'epidermis' ? 0.22 * o + (layer === 'epidermis' ? 0.3 : 0) : o;
      }
    });
  }

  /** Mean expansion of the band chromatophores, 0..1 (debug / tests). */
  bandExpansion(): number {
    let sum = 0;
    let n = 0;
    for (const c of this.cells) {
      if (c.drive > 0.6) {
        sum += c.current;
        n++;
      }
    }
    return n ? sum / n : 0;
  }

  /** World position for a layer label, at the front-left edge of the block. */
  anchor(layer: string, out: THREE.Vector3): boolean {
    if (!(layer in LAYER_Y)) return false;
    out.set(-SIZE / 2, LAYER_Y[layer as LayerId], SIZE / 2);
    this.group.localToWorld(out);
    return true;
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    this.sacs.dispose();
    this.group.removeFromParent();
  }
}
