import * as THREE from 'three';
import { bands, Kit, Loft, TAU, type ReferenceModel } from './kit';

const bump = (t: number, a: number, b: number) => Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - a) / (b - a)))));

/** A banded sole: a flat, oval, strongly banded flatfish that swims by undulating its body. */
export function buildFlatfish(): ReferenceModel {
  const kit = new Kit(11);
  const dark = new THREE.Color(0x2a1a10);
  const light = new THREE.Color(0xd8c7a0);
  const body = new Loft(
    kit,
    2.4,
    44,
    14,
    (t) => ({ w: 0.02 + 0.62 * Math.pow(bump(t, -0.04, 1.04), 0.62) * (1 - 0.25 * t), h: 0.012 + 0.055 * bump(t, 0, 1), y: 0 }),
    (t, a, out) => {
      bands(t + Math.cos(a) * 0.012, 13, dark, light, out, 0.55);
      if (Math.sin(a) < -0.3) out.set(0xe8e2d2); // blind (under) side is pale
    },
  );
  const eyeMat = kit.mat({ color: 0x0b0b0b, roughness: 0.15 });
  for (const x of [0.06, -0.05]) {
    const eye = kit.mesh(new THREE.SphereGeometry(0.035, 10, 8), eyeMat);
    eye.position.set(x, 0.07, 0.95 + x);
  }
  kit.group.position.y = 0.2;
  return {
    group: kit.group,
    focus: { y: 0.2, scale: 0.55 },
    update(time) {
      body.deform((t, _x, _y, out) => {
        out[1] = 0.085 * (0.25 + t) * Math.sin(TAU * (1.4 * t - time * 1.3));
      });
      kit.group.children.slice(1).forEach((eye) => (eye.position.y = 0.07 + 0.02 * Math.sin(TAU * (0.1 - time * 1.3))));
      kit.group.position.y = 0.2 + 0.03 * Math.sin(time * 0.9);
    },
    dispose: () => kit.dispose(),
  };
}

/** A lionfish: banded body with long, separate dorsal spines and fan-like pectoral fin rays. */
export function buildLionfish(): ReferenceModel {
  const kit = new Kit(23);
  const dark = new THREE.Color(0x5a1f14);
  const light = new THREE.Color(0xe9dcc6);
  const body = new Loft(
    kit,
    1.5,
    30,
    14,
    (t) => {
      const b = Math.pow(bump(t, -0.05, 1.12), 0.7);
      return { w: 0.02 + 0.15 * b, h: 0.03 + 0.27 * b * (1 - 0.45 * t), y: 0 };
    },
    (t, _a, out) => bands(t, 11, dark, light, out, 0.5),
  );
  const rayMat = kit.mat({ color: 0xffffff, vertexColors: true, roughness: 0.6, side: THREE.DoubleSide });
  const rayGeo = (len: number) => {
    const g = new THREE.CylinderGeometry(0.004, 0.014, len, 5, 8);
    g.translate(0, len / 2, 0);
    const col = new Float32Array(g.attributes.position.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) {
      bands(g.attributes.position.getY(i) / len, 6, dark, light, c, 0.5);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  };
  const rays: { mesh: THREE.Mesh; base: THREE.Euler; phase: number }[] = [];
  // Dorsal spines.
  for (let i = 0; i < 12; i++) {
    const m = kit.mesh(rayGeo(0.55 - Math.abs(i - 4) * 0.025), rayMat);
    m.position.set(0, 0.22, 0.5 - i * 0.075);
    m.rotation.set(-0.25 - i * 0.03, 0, (i % 2 ? 1 : -1) * 0.1);
    rays.push({ mesh: m, base: m.rotation.clone(), phase: i * 0.5 });
  }
  // Pectoral fin rays fanning out on each side.
  for (const side of [1, -1]) {
    for (let i = 0; i < 12; i++) {
      const m = kit.mesh(rayGeo(0.85 - Math.abs(i - 5) * 0.03), rayMat);
      m.position.set(side * 0.12, -0.02, 0.32);
      const fan = -0.9 + (i / 11) * 1.9;
      m.rotation.set(fan, 0, -side * (1.15 + 0.1 * Math.sin(i)));
      rays.push({ mesh: m, base: m.rotation.clone(), phase: i * 0.4 + side });
    }
  }
  // Tail fin.
  const tail = kit.mesh(new THREE.CircleGeometry(0.3, 12, -0.8, 1.6), kit.mat({ color: 0xcdb9a0, side: THREE.DoubleSide, transparent: true, opacity: 0.8 }));
  tail.rotation.y = Math.PI / 2;
  tail.position.set(0, 0, -0.72);
  const eyeMat = kit.mat({ color: 0x0b0b0b, roughness: 0.15 });
  for (const s of [1, -1]) kit.mesh(new THREE.SphereGeometry(0.03, 10, 8), eyeMat).position.set(s * 0.1, 0.07, 0.52);
  kit.group.position.y = 1.0;
  return {
    group: kit.group,
    focus: { y: 1.0, scale: 0.6 },
    update(time) {
      body.deform((t, _x, _y, out) => {
        out[0] = 0.04 * t * Math.sin(TAU * (0.8 * t - time * 0.45));
      });
      for (const r of rays) {
        r.mesh.rotation.x = r.base.x + 0.06 * Math.sin(time * 1.1 + r.phase);
        r.mesh.rotation.z = r.base.z + 0.05 * Math.sin(time * 0.8 + r.phase * 1.3);
      }
      tail.rotation.y = Math.PI / 2 + 0.25 * Math.sin(time * 1.6);
      kit.group.position.y = 1.0 + 0.06 * Math.sin(time * 0.6);
    },
    dispose: () => kit.dispose(),
  };
}

function elongate(
  seed: number,
  length: number,
  radius: number,
  colour: (t: number, a: number, out: THREE.Color) => void,
  paddleTail: boolean,
  wave: { amp: number; count: number; speed: number },
): ReferenceModel {
  const kit = new Kit(seed);
  const body = new Loft(
    kit,
    length,
    90,
    10,
    (t) => {
      const head = 0.55 + 0.45 * Math.min(1, t / 0.035);
      const taper = Math.pow(Math.max(0, 1 - Math.pow(t, 6)), 0.5);
      // Sea kraits have a vertically flattened, paddle-like tail.
      const paddle = paddleTail ? bump(t, 0.86, 1.02) : 0;
      return { w: radius * head * taper * (1 - 0.65 * paddle) + 0.004, h: radius * head * taper * (1 + 0.7 * paddle) + 0.004, y: 0 };
    },
    colour,
  );
  const eyeMat = kit.mat({ color: 0x080808, roughness: 0.2 });
  const eyes = [1, -1].map((s) => {
    const e = kit.mesh(new THREE.SphereGeometry(radius * 0.22, 8, 6), eyeMat);
    e.position.set(s * radius * 0.5, radius * 0.35, length / 2 - radius * 0.9);
    return e;
  });
  kit.group.position.y = radius + 0.02;
  const lateral = (t: number, time: number) => wave.amp * (0.25 + 0.75 * t) * Math.sin(TAU * (wave.count * t - time * wave.speed));
  return {
    group: kit.group,
    focus: { y: 0.2, scale: 0.75 },
    update(time) {
      body.deform((t, _x, _y, out) => {
        out[0] = lateral(t, time);
      });
      const headX = lateral(0.02, time);
      eyes.forEach((e, i) => (e.position.x = headX + (i ? -1 : 1) * radius * 0.5));
    },
    dispose: () => kit.dispose(),
  };
}

/** A banded sea krait: black and pale blue-grey bands, paddle tail, sinuous swimming. */
export function buildSeaSnake(): ReferenceModel {
  const dark = new THREE.Color(0x0c0c10);
  const light = new THREE.Color(0xa9bccb);
  return elongate(31, 4.4, 0.075, (t, a, out) => {
    bands(t, 30, dark, light, out, 0.48);
    if (t < 0.03) out.set(0xd9c36a); // pale snout
    if (Math.sin(a) < -0.6) out.lerp(new THREE.Color(0xe6dfc8), 0.5);
  }, true, { amp: 0.34, count: 2.1, speed: 0.6 });
}

/** A snake eel: a long, finless-looking, pointed fish. Pale with dark saddles in this illustration. */
export function buildSnakeEel(): ReferenceModel {
  const dark = new THREE.Color(0x3a2a1c);
  const light = new THREE.Color(0xd9cba6);
  return elongate(37, 3.8, 0.06, (t, a, out) => {
    bands(t + 0.012 * Math.sin(a * 2), 22, dark, light, out, 0.34);
    if (Math.sin(a) < -0.5) out.copy(light);
  }, false, { amp: 0.26, count: 2.6, speed: 0.5 });
}

/** A stingray: a flat disc with wing-like pectoral fins that ripple, and a thin tail. */
export function buildStingray(): ReferenceModel {
  const kit = new Kit(41);
  const top = new THREE.Color(0x6a5a44);
  const spot = new THREE.Color(0x3d86a8);
  const under = new THREE.Color(0xe6dfd0);
  const disc = new Loft(
    kit,
    2.0,
    40,
    20,
    (t) => {
      const d = Math.pow(bump(t, -0.02, 1.02), 0.75);
      return { w: 0.03 + 0.95 * d * (1 - 0.25 * Math.abs(t - 0.45)), h: 0.02 + 0.1 * Math.pow(bump(t, 0.0, 0.9), 1.5), y: 0 };
    },
    (t, a, out) => {
      out.copy(Math.sin(a) < -0.2 ? under : top);
      // Blue spots, as on a blue-spotted stingray.
      if (Math.sin(a) > 0 && Math.sin(t * 43) * Math.sin(a * 7 + t * 9) > 0.72) out.copy(spot);
    },
  );
  const tailMat = kit.mat({ color: 0x5a4c3a });
  const tailGeo = new THREE.CylinderGeometry(0.035, 0.004, 2.2, 8, 12);
  tailGeo.rotateX(-Math.PI / 2);
  tailGeo.translate(0, 0, -2.0);
  const tail = kit.mesh(tailGeo, tailMat);
  const eyeMat = kit.mat({ color: 0x0a0a0a, roughness: 0.2 });
  for (const s of [1, -1]) kit.mesh(new THREE.SphereGeometry(0.05, 10, 8), eyeMat).position.set(s * 0.16, 0.1, 0.55);
  kit.group.position.y = 0.35;
  return {
    group: kit.group,
    focus: { y: 0.3, scale: 0.7 },
    update(time) {
      disc.deform((t, x, _y, out) => {
        const edge = Math.pow(Math.abs(x), 1.6);
        out[1] = 0.28 * edge * Math.sin(TAU * (1.1 * t - time * 0.7));
      });
      tail.rotation.y = 0.08 * Math.sin(time * 0.9);
      kit.group.position.y = 0.35 + 0.05 * Math.sin(time * 0.7);
    },
    dispose: () => kit.dispose(),
  };
}
