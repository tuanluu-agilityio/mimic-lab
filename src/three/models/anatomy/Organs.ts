import * as THREE from 'three';
import { RIG } from '../../animation/armCurve';
import { ARM_COUNT } from '../../animation/types';
import { createNerveMaterial } from '../../materials/nerveMaterial';
import { ArmsMesh } from '../octopus/ArmsMesh';
import type { Octopus } from '../octopus/Octopus';

type Mount = 'head' | 'mantle';
type V3 = [number, number, number];

interface OrganDef {
  id: string;
  /** Anatomy structure id (src/data/anatomy) this organ belongs to. */
  structure: string;
  mount: Mount;
  color: number;
  /** Direction and distance the organ travels at full exploded view, in mount-local units. */
  explode: V3;
  /** True for parts of the nervous system (kept visible in the neural view). */
  neural?: boolean;
  /** Beats with the heart cycle; value is the phase offset (0..1). */
  beat?: number;
  build(add: (geometry: THREE.BufferGeometry, position?: V3, scale?: V3, rotation?: V3) => void): void;
}

const tube = (points: V3[], radius: number, segments = 20) =>
  new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    segments,
    radius,
    8,
    false,
  );
const sphere = (r: number) => new THREE.SphereGeometry(r, 18, 12);

/** One gill: a central axis carrying a series of lamellae that shrink toward both ends. */
function buildGill(side: number): OrganDef['build'] {
  return (add) => {
    const x = side * 0.128;
    add(tube([[x, -0.02, -0.16], [x * 1.04, -0.03, -0.34], [x, -0.035, -0.54]], 0.008, 12));
    const n = 13;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const size = 0.018 + 0.03 * Math.sin(Math.PI * (0.12 + 0.82 * t));
      add(sphere(1), [x - side * 0.012, -0.03, -0.18 - t * 0.34], [size * 1.25, size * 1.5, 0.008], [0, side * 0.35, 0]);
    }
  };
}

function buildStellate(side: number): OrganDef['build'] {
  return (add) => {
    const c: V3 = [side * 0.145, 0.075, -0.1];
    add(new THREE.IcosahedronGeometry(0.02, 1), c);
    // Stellar nerves radiating over the inner mantle wall.
    for (let i = 0; i < 6; i++) {
      const a = -0.3 - i * 0.2;
      add(tube([c, [side * (0.17 + 0.015 * i), 0.075 + Math.sin(a) * 0.08, -0.16 - i * 0.075]], 0.0035, 4));
    }
    // Pallial nerve back to the brain.
    add(tube([c, [side * 0.1, 0.07, -0.02], [side * 0.05, 0.05, 0.08]], 0.005, 8));
  };
}

/**
 * Schematic organ layout. Positions follow general octopod anatomy (see docs/research/anatomy-research.md);
 * shapes are simplified solids, not reconstructions of a dissected specimen.
 */
const ORGANS: OrganDef[] = [
  {
    id: 'brain',
    structure: 'brain',
    mount: 'head',
    color: 0xead9a2,
    explode: [0, 0.5, 0],
    neural: true,
    build(add) {
      add(sphere(0.043), [0, 0.032, -0.012], [1.25, 0.85, 1.15]); // supra-oesophageal mass
      add(sphere(0.036), [0, -0.022, -0.004], [1.15, 0.8, 1.1]); // sub-oesophageal mass
      add(sphere(0.02), [0, 0.03, 0.04], [1.2, 0.9, 1]); // anterior lobes
    },
  },
  {
    id: 'optic-lobes',
    structure: 'optic-lobes',
    mount: 'head',
    color: 0xf2bf6c,
    explode: [0, 0.3, 0.42],
    neural: true,
    build(add) {
      for (const s of [1, -1]) {
        add(sphere(1), [s * 0.086, 0.036, 0.006], [0.034, 0.031, 0.045]);
        add(tube([[s * 0.058, 0.034, 0.002], [s * 0.04, 0.032, -0.004]], 0.011, 4));
      }
    },
  },
  {
    id: 'stellate-l',
    structure: 'nervous-system',
    mount: 'mantle',
    color: 0xffe6a3,
    explode: [0.32, 0.25, 0],
    neural: true,
    build: buildStellate(1),
  },
  {
    id: 'stellate-r',
    structure: 'nervous-system',
    mount: 'mantle',
    color: 0xffe6a3,
    explode: [-0.32, 0.25, 0],
    neural: true,
    build: buildStellate(-1),
  },
  { id: 'gill-l', structure: 'gills', mount: 'mantle', color: 0xdc8fa6, explode: [0.5, -0.05, 0], build: buildGill(1) },
  { id: 'gill-r', structure: 'gills', mount: 'mantle', color: 0xdc8fa6, explode: [-0.5, -0.05, 0], build: buildGill(-1) },
  {
    id: 'systemic-heart',
    structure: 'hearts',
    mount: 'mantle',
    color: 0xc7384a,
    explode: [0, -0.5, -0.1],
    beat: 0.18,
    build(add) {
      add(sphere(0.044), [0, -0.045, -0.57], [1.35, 0.9, 1]);
      add(tube([[0, -0.03, -0.55], [0, 0.0, -0.4], [0, 0.03, -0.2], [0, 0.04, -0.04]], 0.009, 14)); // dorsal aorta
    },
  },
  {
    id: 'branchial-heart-l',
    structure: 'hearts',
    mount: 'mantle',
    color: 0x8f55ad,
    explode: [0.42, -0.42, -0.1],
    beat: 0,
    build(add) {
      add(sphere(0.031), [0.108, -0.06, -0.6]);
      add(tube([[0.1, -0.055, -0.59], [0.06, -0.05, -0.58], [0.03, -0.047, -0.575]], 0.007, 6));
    },
  },
  {
    id: 'branchial-heart-r',
    structure: 'hearts',
    mount: 'mantle',
    color: 0x8f55ad,
    explode: [-0.42, -0.42, -0.1],
    beat: 0,
    build(add) {
      add(sphere(0.031), [-0.108, -0.06, -0.6]);
      add(tube([[-0.1, -0.055, -0.59], [-0.06, -0.05, -0.58], [-0.03, -0.047, -0.575]], 0.007, 6));
    },
  },
  {
    id: 'buccal-mass',
    structure: 'digestive-system',
    mount: 'head',
    color: 0xc98a78,
    explode: [0, -0.34, 0.3],
    build(add) {
      add(sphere(0.046), [0, -0.085, 0.03], [1, 0.95, 1]);
      // Oesophagus: from the buccal mass up through the brain toward the mantle.
      add(tube([[0, -0.06, 0.02], [0, -0.005, -0.005], [0, 0.012, -0.08], [0, 0.03, -0.17]], 0.008, 12));
    },
  },
  {
    id: 'beak',
    structure: 'beak',
    mount: 'head',
    color: 0x24160f,
    explode: [0, -0.62, 0.3],
    build(add) {
      const cone = new THREE.ConeGeometry(0.021, 0.05, 10);
      add(cone, [0, -0.118, 0.04], [0.8, 1, 1.15], [Math.PI - 0.35, 0, 0]); // upper beak
      add(cone, [0, -0.114, 0.018], [0.95, 0.85, 1.2], [Math.PI + 0.45, 0, 0]); // lower beak
    },
  },
  {
    id: 'radula',
    structure: 'radula',
    mount: 'head',
    color: 0xf3ecd6,
    explode: [0.3, -0.45, 0.42],
    build(add) {
      add(new THREE.TorusGeometry(0.017, 0.0055, 6, 14, Math.PI * 1.1), [0, -0.094, 0.034], [1, 1, 1], [0, Math.PI / 2, 0.3]);
      // Rows of teeth along the ribbon.
      for (let i = 0; i < 7; i++) {
        const a = 0.3 + (i / 6) * Math.PI * 1.0;
        add(new THREE.ConeGeometry(0.0035, 0.009, 4), [0, -0.094 + Math.sin(a) * 0.021, 0.034 - Math.cos(a) * 0.021]);
      }
    },
  },
  {
    id: 'crop',
    structure: 'digestive-system',
    mount: 'mantle',
    color: 0xd9a67c,
    explode: [0, 0.75, 0.05],
    build(add) {
      add(tube([[0, 0.05, 0.0], [0, 0.095, -0.12], [0.005, 0.1, -0.3], [0.02, 0.07, -0.5], [0.03, 0.04, -0.58]], 0.017, 18));
    },
  },
  {
    id: 'digestive-gland',
    structure: 'digestive-system',
    mount: 'mantle',
    color: 0x7a4a2a,
    explode: [0, 0.48, -0.1],
    build(add) {
      add(sphere(1), [0, 0.012, -0.34], [0.088, 0.066, 0.17]);
    },
  },
  {
    id: 'stomach-caecum',
    structure: 'digestive-system',
    mount: 'mantle',
    color: 0xc47a5c,
    explode: [0.12, 0.35, -0.38],
    build(add) {
      add(sphere(0.05), [0.04, 0.03, -0.66], [1, 0.9, 1.1]); // stomach
      add(new THREE.TorusGeometry(0.027, 0.017, 8, 14), [-0.04, 0.012, -0.66], [1, 1, 1], [0.4, 0.5, 0]); // spiral caecum
    },
  },
  {
    id: 'intestine',
    structure: 'digestive-system',
    mount: 'mantle',
    color: 0xb08a6a,
    explode: [-0.14, -0.3, -0.2],
    build(add) {
      add(tube([[-0.03, -0.01, -0.63], [-0.02, -0.07, -0.5], [0.0, -0.1, -0.32], [0.0, -0.105, -0.12]], 0.011, 18));
    },
  },
  {
    id: 'ink-sac',
    structure: 'ink-sac',
    mount: 'mantle',
    color: 0x16121c,
    explode: [0.26, -0.55, 0.05],
    build(add) {
      add(sphere(1), [0.022, -0.065, -0.31], [0.027, 0.025, 0.062]);
      add(tube([[0.022, -0.07, -0.26], [0.012, -0.095, -0.17], [0.004, -0.1, -0.12]], 0.005, 8)); // ink duct
    },
  },
];

interface OrganInstance {
  def: OrganDef;
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  opacity: number;
  glow: number;
  explodeVec: THREE.Vector3;
  centre: THREE.Vector3;
}

export interface OrgansState {
  /** 0..1 overall visibility of the organs. */
  visibility: number;
  /** 0..1 exploded-view progress. */
  explode: number;
  /** Selected anatomy structure id, if any. */
  selected: string | null;
  /** Dim everything except the selected structure. */
  isolate: boolean;
  /** Show only the nervous system. */
  neuralOnly: boolean;
  /** 0..1 opacity of the arm nerve cords and nerve ring. */
  nerves: number;
}

const HIGHLIGHT = new THREE.Color(0x62e6e0);

/**
 * Internal anatomy: schematic organs mounted in the head and mantle, plus the arm nerve cords
 * which follow the arm curves every frame.
 */
export class Organs {
  private readonly instances: OrganInstance[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  readonly nerveMaterial = createNerveMaterial();
  private cords: ArmsMesh;
  private readonly ring: THREE.Mesh;
  private readonly glowById = new Map<string, number>();
  private heartPhase = 0;
  readonly includeInkSac: boolean;

  constructor(private readonly octopus: Octopus, armSegments: number, includeInkSac = true) {
    this.includeInkSac = includeInkSac;
    for (const def of ORGANS) {
      if (def.id === 'ink-sac' && !includeInkSac) continue;
      const material = new THREE.MeshStandardMaterial({
        color: def.color,
        roughness: 0.48,
        metalness: 0.02,
        emissive: HIGHLIGHT,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0,
      });
      const group = new THREE.Group();
      group.name = `organ-${def.id}`;
      const box = new THREE.Box3();
      def.build((geometry, position, scale, rotation) => {
        this.geometries.push(geometry);
        const mesh = new THREE.Mesh(geometry, material);
        if (position) mesh.position.set(...position);
        if (scale) mesh.scale.set(...scale);
        if (rotation) mesh.rotation.set(...rotation);
        mesh.updateMatrix();
        geometry.computeBoundingBox();
        box.union(geometry.boundingBox!.clone().applyMatrix4(mesh.matrix));
        group.add(mesh);
      });
      group.visible = false;
      (def.mount === 'head' ? octopus.headMount : octopus.mantleMount).add(group);
      this.instances.push({
        def,
        group,
        material,
        opacity: 0,
        glow: 0,
        explodeVec: new THREE.Vector3(...def.explode),
        centre: box.getCenter(new THREE.Vector3()),
      });
    }

    this.cords = new ArmsMesh(this.nerveMaterial, armSegments, 6, 1, 0.012);
    this.cords.mesh.name = 'nerve-cords';
    this.cords.mesh.visible = false;
    octopus.root.add(this.cords.mesh);

    // Nerve ring linking the eight arm cords around the mouth.
    const ringGeo = new THREE.TorusGeometry(RIG.CROWN_RADIUS * 0.92, 0.011, 8, 48);
    const n = ringGeo.attributes.position.count;
    const skin = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) skin[i * 2] = ringGeo.attributes.uv.getX(i);
    ringGeo.setAttribute('aSkin', new THREE.BufferAttribute(skin, 2));
    ringGeo.setAttribute('aArm', new THREE.BufferAttribute(new Float32Array(n).fill(3), 1));
    this.geometries.push(ringGeo);
    this.ring = new THREE.Mesh(ringGeo, this.nerveMaterial);
    this.ring.rotation.x = Math.PI / 2;
    this.ring.position.y = -RIG.CROWN_DROP;
    this.ring.visible = false;
    octopus.bodyGroup.add(this.ring);
  }

  /** Rebuild the nerve cords after the arm tessellation changed. */
  setDetail(armSegments: number): void {
    this.octopus.root.remove(this.cords.mesh);
    this.cords.dispose();
    this.cords = new ArmsMesh(this.nerveMaterial, armSegments, 6, 1, 0.012);
    this.cords.mesh.name = 'nerve-cords';
    this.octopus.root.add(this.cords.mesh);
  }

  /** Extra emissive glow for one organ id (0..1), used by the nervous-system demonstration. */
  setGlow(id: string, value: number): void {
    this.glowById.set(id, value);
  }

  update(dt: number, time: number, state: OrgansState, playing: boolean): void {
    const k = 1 - Math.exp(-dt * 7);
    if (playing) this.heartPhase += dt * 0.55;
    for (const inst of this.instances) {
      const { def } = inst;
      let target = state.visibility;
      if (state.neuralOnly && !def.neural) target = 0;
      const isSelected = state.selected === def.structure;
      if (state.isolate && state.selected && !isSelected) target *= 0.04;
      inst.opacity += (target - inst.opacity) * k;
      const visible = inst.opacity > 0.012;
      inst.group.visible = visible;
      if (!visible) continue;

      const solid = inst.opacity > 0.985;
      if (inst.material.transparent === solid) {
        inst.material.transparent = !solid;
        inst.material.depthWrite = solid;
        inst.material.needsUpdate = true;
      }
      inst.material.opacity = solid ? 1 : inst.opacity;

      const pulse = 0.6 + 0.4 * Math.sin(time * 3.2);
      const glowTarget = (isSelected ? 0.55 * pulse : 0) + (this.glowById.get(def.id) ?? 0) * 1.3;
      inst.glow += (glowTarget - inst.glow) * k;
      inst.material.emissiveIntensity = inst.glow;

      inst.group.position.copy(inst.explodeVec).multiplyScalar(state.explode);
      if (def.beat !== undefined) {
        // Branchial hearts contract just before the systemic heart.
        const b = Math.pow(Math.max(0, Math.sin((this.heartPhase - def.beat) * Math.PI * 2)), 6);
        const s = 1 - 0.14 * b;
        inst.group.scale.setScalar(1);
        const first = inst.group.children[0];
        first.scale.multiplyScalar(s / (first.userData.beatScale ?? 1));
        first.userData.beatScale = s;
      }
    }

    const u = this.nerveMaterial.nerve;
    u.uTime.value = time;
    u.uOpacity.value += (state.nerves - u.uOpacity.value) * k;
    const nervesVisible = u.uOpacity.value > 0.012;
    this.cords.mesh.visible = nervesVisible;
    this.ring.visible = nervesVisible;
    if (nervesVisible) {
      for (let i = 0; i < ARM_COUNT; i++) this.cords.writeArm(i, this.octopus.curves[i]);
      this.cords.commit();
    }
  }

  /** World position of the visual centre of a structure (first organ that belongs to it). */
  anchor(structure: string, out: THREE.Vector3): boolean {
    if (structure === 'nervous-system') {
      this.octopus.armPoint(3, 0.12, out);
      return true;
    }
    const inst = this.instances.find((i) => i.def.structure === structure || i.def.id === structure);
    if (!inst) return false;
    inst.group.localToWorld(out.copy(inst.centre));
    return true;
  }

  /** Ids of organ groups currently drawn (debug / tests). */
  visibleIds(): string[] {
    return this.instances.filter((i) => i.group.visible).map((i) => i.def.id);
  }

  dispose(): void {
    for (const g of this.geometries) g.dispose();
    for (const inst of this.instances) {
      inst.material.dispose();
      inst.group.removeFromParent();
    }
    this.cords.dispose();
    this.cords.mesh.removeFromParent();
    this.ring.removeFromParent();
    this.nerveMaterial.dispose();
  }
}
