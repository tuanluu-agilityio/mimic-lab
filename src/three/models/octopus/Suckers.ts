import * as THREE from 'three';
import type { ArmCurve } from '../../animation/armCurve';
import { ARM_COUNT } from '../../animation/types';

/** Cup-shaped sucker profile (radius, height), revolved around Y. Y points out of the arm. */
function suckerGeometry(radialSegments: number): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(0.62, -0.25),
    new THREE.Vector2(0.9, 0.05),
    new THREE.Vector2(1.0, 0.32),
    new THREE.Vector2(0.86, 0.5),
    new THREE.Vector2(0.56, 0.44),
    new THREE.Vector2(0.34, 0.2),
    new THREE.Vector2(0.0, 0.12),
  ];
  const g = new THREE.LatheGeometry(pts, radialSegments);
  g.computeVertexNormals();
  return g;
}

/**
 * Two rows of suckers along the oral side of every arm, drawn as one instanced mesh.
 * Instance matrices are rebuilt from the arm curves each frame.
 */
export class Suckers {
  readonly mesh: THREE.InstancedMesh;
  readonly material: THREE.MeshStandardMaterial;
  private readonly matrix = new THREE.Matrix4();
  /** Normalised arm position of each sucker pair. */
  private readonly stations: Float32Array;

  constructor(readonly pairsPerArm: number, radialSegments: number) {
    this.material = new THREE.MeshStandardMaterial({ color: 0xd9c4ad, roughness: 0.5, metalness: 0 });
    const geometry = suckerGeometry(radialSegments);
    this.mesh = new THREE.InstancedMesh(geometry, this.material, pairsPerArm * 2 * ARM_COUNT);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.name = 'octopus-suckers';
    // Spacing shrinks toward the tip together with the sucker size.
    this.stations = new Float32Array(pairsPerArm);
    for (let k = 0; k < pairsPerArm; k++) {
      const t = (k + 0.5) / pairsPerArm;
      this.stations[k] = 0.035 + 0.94 * (1 - Math.pow(1 - t, 1.55));
    }
  }

  writeArm(i: number, curve: ArmCurve): void {
    const m = this.matrix.elements;
    const last = curve.count - 1;
    for (let k = 0; k < this.pairsPerArm; k++) {
      const f = this.stations[k] * last;
      const j = Math.min(last - 1, Math.floor(f));
      const t = f - j;
      const a = j * 3;
      const b = a + 3;
      const px = curve.pos[a] + (curve.pos[b] - curve.pos[a]) * t;
      const py = curve.pos[a + 1] + (curve.pos[b + 1] - curve.pos[a + 1]) * t;
      const pz = curve.pos[a + 2] + (curve.pos[b + 2] - curve.pos[a + 2]) * t;
      const r = curve.rad[j] + (curve.rad[j + 1] - curve.rad[j]) * t;
      const nx = curve.nor[a];
      const ny = curve.nor[a + 1];
      const nz = curve.nor[a + 2];
      const bx = curve.bin[a];
      const by = curve.bin[a + 1];
      const bz = curve.bin[a + 2];
      const tx = curve.tan[a];
      const ty = curve.tan[a + 1];
      const tz = curve.tan[a + 2];
      const size = r * 0.46;
      for (let row = 0; row < 2; row++) {
        const side = row === 0 ? 1 : -1;
        // Staggered rows: offset sideways, and seated on the flattened oral surface.
        const ox = bx * side * r * 0.42 + nx * r * 0.74;
        const oy = by * side * r * 0.42 + ny * r * 0.74;
        const oz = bz * side * r * 0.42 + nz * r * 0.74;
        const stagger = side * r * 0.35;
        // Basis: X = binormal, Y = oral normal (cup axis), Z = tangent.
        m[0] = bx * size;
        m[1] = by * size;
        m[2] = bz * size;
        m[3] = 0;
        m[4] = nx * size;
        m[5] = ny * size;
        m[6] = nz * size;
        m[7] = 0;
        m[8] = tx * size;
        m[9] = ty * size;
        m[10] = tz * size;
        m[11] = 0;
        m[12] = px + ox + tx * stagger;
        m[13] = py + oy + ty * stagger;
        m[14] = pz + oz + tz * stagger;
        m[15] = 1;
        this.mesh.setMatrixAt((i * this.pairsPerArm + k) * 2 + row, this.matrix);
      }
    }
  }

  commit(): void {
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Fade with the X-ray shell so suckers do not float in front of the organs. */
  setOpacity(opacity: number): void {
    const transparent = opacity < 0.995;
    if (this.material.transparent !== transparent) {
      this.material.transparent = transparent;
      this.material.depthWrite = !transparent;
      this.material.needsUpdate = true;
    }
    this.material.opacity = opacity;
    this.mesh.visible = opacity > 0.01;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
