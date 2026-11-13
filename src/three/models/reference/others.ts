import * as THREE from 'three';
import { bands, Kit, TAU, type ReferenceModel } from './kit';

/** Displace a geometry's vertices along their normals with a smooth pseudo-random field. */
function lumpy(g: THREE.BufferGeometry, amount: number, freq: number, seed: number): THREE.BufferGeometry {
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n =
      Math.sin(v.x * freq + seed) * Math.cos(v.y * freq * 1.3 + seed * 2) +
      Math.sin(v.z * freq * 0.9 + seed * 3) * 0.7 +
      Math.sin((v.x + v.z) * freq * 2.1 + seed) * 0.35;
    v.multiplyScalar(1 + amount * n);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/** A jellyfish: a pulsing translucent bell with trailing tentacles. */
export function buildJellyfish(): ReferenceModel {
  const kit = new Kit(53);
  const bellMat = kit.track(
    new THREE.MeshPhysicalMaterial({ color: 0xbfe3ea, roughness: 0.25, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
  );
  const profile: THREE.Vector2[] = [];
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 0.58;
    profile.push(new THREE.Vector2(Math.sin(a) * 0.62 + (i > 11 ? -(i - 11) * 0.02 : 0), Math.cos(a) * 0.45));
  }
  const bell = kit.mesh(new THREE.LatheGeometry(profile, 28), bellMat);
  const armMat = kit.mat({ color: 0xe9d7e4, transparent: true, opacity: 0.75 });
  const oral: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.CylinderGeometry(0.05, 0.012, 1.0, 6, 6);
    g.translate(0, -0.5, 0);
    const m = kit.mesh(g, armMat);
    m.position.set(Math.cos(i * 1.57) * 0.1, 0.05, Math.sin(i * 1.57) * 0.1);
    oral.push(m);
  }
  const SEG = 12;
  const COUNT = 18;
  const pos = new Float32Array(COUNT * SEG * 6);
  const lineGeo = kit.geo(new THREE.BufferGeometry());
  lineGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(lineGeo, kit.track(new THREE.LineBasicMaterial({ color: 0xd6eef2, transparent: true, opacity: 0.7 })));
  lines.frustumCulled = false;
  kit.group.add(lines);
  kit.group.position.y = 2.6;
  return {
    group: kit.group,
    focus: { y: 2.0, scale: 0.75 },
    update(time) {
      const beat = Math.sin(time * 1.9);
      const squeeze = 1 - 0.13 * Math.max(0, beat);
      bell.scale.set(squeeze, 1 + 0.1 * Math.max(0, beat), squeeze);
      oral.forEach((m, i) => (m.rotation.set(0.12 * Math.sin(time * 1.2 + i), 0, 0.12 * Math.cos(time * 1.1 + i))));
      for (let t = 0; t < COUNT; t++) {
        const a = (t / COUNT) * TAU;
        const r0 = 0.56 * squeeze;
        let px = Math.cos(a) * r0;
        let py = 0.1;
        let pz = Math.sin(a) * r0;
        for (let s = 0; s < SEG; s++) {
          const f = (s + 1) / SEG;
          const nx = Math.cos(a) * r0 * (1 - 0.35 * f) + 0.12 * f * Math.sin(time * 1.3 - f * 4 + t);
          const ny = 0.1 - f * 1.9;
          const nz = Math.sin(a) * r0 * (1 - 0.35 * f) + 0.12 * f * Math.cos(time * 1.1 - f * 4 + t * 1.7);
          pos.set([px, py, pz, nx, ny, nz], (t * SEG + s) * 6);
          px = nx;
          py = ny;
          pz = nz;
        }
      }
      lineGeo.attributes.position.needsUpdate = true;
      kit.group.position.y = 2.6 + 0.12 * Math.sin(time * 1.9 - 1.2);
    },
    dispose: () => kit.dispose(),
  };
}

/** A sand-dwelling sea anemone with long, banded, branch-tipped tentacles around an oral disc. */
export function buildAnemone(): ReferenceModel {
  const kit = new Kit(61);
  const column = kit.mesh(lumpy(new THREE.CylinderGeometry(0.34, 0.42, 0.35, 20, 3), 0.03, 6, 2), kit.mat({ color: 0x6d5847 }));
  column.position.y = 0.17;
  const disc = kit.mesh(new THREE.CircleGeometry(0.34, 24), kit.mat({ color: 0xcdbb9c }));
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.352;
  const dark = new THREE.Color(0x4a3222);
  const light = new THREE.Color(0xe2d5b8);
  const tentMat = kit.mat({ vertexColors: true });
  const tentacles: { mesh: THREE.Mesh; lean: number; az: number; phase: number }[] = [];
  const COUNT = 14;
  for (let i = 0; i < COUNT; i++) {
    const len = 1.25 + kit.rnd() * 0.5;
    const g = new THREE.CylinderGeometry(0.012, 0.05, len, 7, 14);
    g.translate(0, len / 2, 0);
    const p = g.attributes.position;
    const col = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    for (let v = 0; v < p.count; v++) {
      const f = p.getY(v) / len;
      // A gentle zig-zag along each tentacle.
      p.setX(v, p.getX(v) + 0.06 * Math.sin(f * 16) * f);
      bands(f, 9, dark, light, c, 0.45);
      col.set([c.r, c.g, c.b], v * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = kit.mesh(g, tentMat);
    const az = (i / COUNT) * TAU;
    m.position.set(Math.cos(az) * 0.27, 0.33, Math.sin(az) * 0.27);
    m.rotation.order = 'YXZ';
    tentacles.push({ mesh: m, lean: 0.55 + kit.rnd() * 0.35, az, phase: kit.rnd() * 6 });
  }
  return {
    group: kit.group,
    focus: { y: 0.8, scale: 0.6 },
    update(time) {
      for (const t of tentacles) {
        t.mesh.rotation.y = -t.az + Math.PI / 2 + 0.12 * Math.sin(time * 0.5 + t.phase);
        t.mesh.rotation.x = t.lean + 0.1 * Math.sin(time * 0.7 + t.phase);
      }
    },
    dispose: () => kit.dispose(),
  };
}

/** A sponge: an irregular cluster of lumpy vase and mound shapes with openings (oscula). */
export function buildSponge(): ReferenceModel {
  const kit = new Kit(71);
  const mat = kit.mat({ color: 0xa5663a, roughness: 0.95 });
  const inner = kit.mat({ color: 0x2a160c, roughness: 1 });
  const lobes: [number, number, number, number][] = [
    [0, 0, 0.42, 0.95],
    [0.42, 0.18, 0.3, 0.62],
    [-0.38, 0.22, 0.27, 0.74],
    [0.1, -0.42, 0.24, 0.45],
    [-0.2, -0.28, 0.2, 0.36],
  ];
  lobes.forEach(([x, z, r, h], i) => {
    const g = lumpy(new THREE.CylinderGeometry(r * 0.72, r, h, 18, 8, false), 0.09, 7, i * 3 + 1);
    const m = kit.mesh(g, mat);
    m.position.set(x, h / 2, z);
    m.rotation.set((kit.rnd() - 0.5) * 0.25, kit.rnd() * 3, (kit.rnd() - 0.5) * 0.25);
    const osc = kit.mesh(new THREE.CircleGeometry(r * 0.45, 14), inner);
    osc.rotation.x = -Math.PI / 2;
    osc.position.set(0, h / 2 + 0.006, 0);
    m.add(osc);
  });
  return { group: kit.group, focus: { y: 0.45, scale: 0.5 }, update() {}, dispose: () => kit.dispose() };
}

/** A colonial tunicate (sea squirt): a cluster of small translucent zooids, each with two siphons. */
export function buildTunicate(): ReferenceModel {
  const kit = new Kit(83);
  const body = kit.track(
    new THREE.MeshPhysicalMaterial({ color: 0xc9d8e6, roughness: 0.3, transparent: true, opacity: 0.82, clearcoat: 0.6 }),
  );
  const rim = kit.mat({ color: 0x6b3fa0, roughness: 0.4 });
  const base = kit.mesh(lumpy(new THREE.SphereGeometry(0.5, 18, 10), 0.08, 5, 4), kit.mat({ color: 0x7a7468, roughness: 1 }));
  base.scale.set(1, 0.3, 1);
  base.position.y = 0.06;
  const zooids: THREE.Mesh[] = [];
  for (let i = 0; i < 17; i++) {
    const a = kit.rnd() * TAU;
    const r = Math.sqrt(kit.rnd()) * 0.42;
    const h = 0.26 + kit.rnd() * 0.22;
    const z = kit.mesh(new THREE.CapsuleGeometry(0.075, h, 6, 12), body);
    z.position.set(Math.cos(a) * r, 0.12 + h / 2, Math.sin(a) * r);
    z.rotation.set(Math.cos(a) * r * 0.9, 0, -Math.sin(a) * r * 0.9 + Math.cos(a) * r * 0.5);
    for (const [dx, dy] of [[0, h / 2 + 0.07], [0.055, h / 2 + 0.02]] as const) {
      const ring = kit.mesh(new THREE.TorusGeometry(0.028, 0.009, 6, 12), rim, z);
      ring.position.set(dx, dy, 0);
      ring.rotation.x = Math.PI / 2;
    }
    zooids.push(z);
  }
  return {
    group: kit.group,
    focus: { y: 0.3, scale: 0.42 },
    update(time) {
      // Sessile: only a faint breathing of the zooids.
      zooids.forEach((z, i) => z.scale.setScalar(1 + 0.02 * Math.sin(time * 0.8 + i)));
    },
    dispose: () => kit.dispose(),
  };
}

/** The tube of a tube-dwelling polychaete worm: a parchment-like tube standing out of the sand. */
export function buildTubeWorm(): ReferenceModel {
  const kit = new Kit(97);
  const mat = kit.mat({ color: 0x9b8f7a, roughness: 1 });
  const dark = kit.mat({ color: 0x120f0c, roughness: 1 });
  const tubes: [number, number, number, number][] = [
    [0, 0, 1.25, 0.07],
    [0.3, 0.15, 0.8, 0.055],
    [-0.24, 0.2, 0.55, 0.05],
  ];
  tubes.forEach(([x, z, h, r], i) => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, -0.1, z),
      new THREE.Vector3(x + 0.04, h * 0.4, z - 0.02),
      new THREE.Vector3(x + 0.1 * (i - 1), h * 0.8, z + 0.05),
      new THREE.Vector3(x + 0.16 * (i - 1), h, z + 0.07),
    ]);
    const g = lumpy(new THREE.TubeGeometry(path, 24, r, 10, false), 0.012, 14, i + 2);
    kit.mesh(g, mat);
    const end = path.getPoint(1);
    const tan = path.getTangent(1);
    const mouth = kit.mesh(new THREE.CircleGeometry(r * 0.78, 12), dark);
    mouth.position.copy(end).addScaledVector(tan, 0.004);
    mouth.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
  });
  return { group: kit.group, focus: { y: 0.55, scale: 0.5 }, update() {}, dispose: () => kit.dispose() };
}
