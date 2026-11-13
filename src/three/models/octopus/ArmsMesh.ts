import * as THREE from 'three';
import type { ArmCurve } from '../../animation/armCurve';
import { ARM_COUNT } from '../../animation/types';
import { PART } from '../../materials/skinMaterial';

/**
 * All eight arms as one skinned-by-curve tube mesh (a single draw call).
 * Each arm is a tube swept along its ArmCurve; vertices are rewritten every frame.
 */
export class ArmsMesh {
  readonly mesh: THREE.Mesh;
  readonly geometry: THREE.BufferGeometry;
  private readonly positions: Float32Array;
  private readonly normals: Float32Array;
  private readonly cosTable: Float32Array;
  private readonly sinTable: Float32Array;

  /**
   * @param radiusScale multiplies the curve radius (1 for the skin, small for the axial nerve cords)
   * @param fixedRadius if set, use this constant radius instead of the curve radius
   */
  constructor(
    material: THREE.Material,
    readonly segments: number,
    readonly radial: number,
    private readonly radiusScale = 1,
    private readonly fixedRadius: number | null = null,
  ) {
    const ringVerts = radial + 1;
    const armVerts = (segments + 1) * ringVerts;
    const total = armVerts * ARM_COUNT;
    this.positions = new Float32Array(total * 3);
    this.normals = new Float32Array(total * 3);
    const skin = new Float32Array(total * 2);
    const part = new Float32Array(total).fill(PART.ARM);
    const arm = new Float32Array(total);
    const index: number[] = [];
    this.cosTable = new Float32Array(ringVerts);
    this.sinTable = new Float32Array(ringVerts);
    for (let k = 0; k <= radial; k++) {
      const a = (k / radial) * Math.PI * 2;
      this.cosTable[k] = Math.cos(a);
      this.sinTable[k] = Math.sin(a);
    }
    for (let i = 0; i < ARM_COUNT; i++) {
      const off = i * armVerts;
      for (let j = 0; j <= segments; j++) {
        for (let k = 0; k <= radial; k++) {
          const v = off + j * ringVerts + k;
          skin[v * 2] = j / segments;
          skin[v * 2 + 1] = k / radial;
          arm[v] = i;
        }
      }
      for (let j = 0; j < segments; j++) {
        for (let k = 0; k < radial; k++) {
          const a = off + j * ringVerts + k;
          const b = a + 1;
          const c = a + ringVerts;
          const d = c + 1;
          index.push(a, c, b, b, c, d);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('normal', new THREE.BufferAttribute(this.normals, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute('aSkin', new THREE.BufferAttribute(skin, 2));
    g.setAttribute('aPart', new THREE.BufferAttribute(part, 1));
    g.setAttribute('aArm', new THREE.BufferAttribute(arm, 1));
    g.setIndex(index);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    this.geometry = g;
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.frustumCulled = false;
    this.mesh.name = 'octopus-arms';
  }

  /** Rewrite the vertices of arm `i` from its curve. The curve must have segments + 1 samples. */
  writeArm(i: number, curve: ArmCurve): void {
    const { segments, radial, positions, normals, cosTable, sinTable } = this;
    const ringVerts = radial + 1;
    const off = i * (segments + 1) * ringVerts;
    for (let j = 0; j <= segments; j++) {
      const o = j * 3;
      const r = this.fixedRadius ?? curve.rad[j] * this.radiusScale;
      const px = curve.pos[o];
      const py = curve.pos[o + 1];
      const pz = curve.pos[o + 2];
      const nx = curve.nor[o];
      const ny = curve.nor[o + 1];
      const nz = curve.nor[o + 2];
      const bx = curve.bin[o];
      const by = curve.bin[o + 1];
      const bz = curve.bin[o + 2];
      for (let k = 0; k <= radial; k++) {
        const c = cosTable[k];
        const s = sinTable[k];
        // Angle 0 = binormal, PI/2 = oral normal. The oral side is slightly flattened.
        const flat = s > 0 ? 0.86 : 1;
        const dx = bx * c + nx * s * flat;
        const dy = by * c + ny * s * flat;
        const dz = bz * c + nz * s * flat;
        const v = (off + j * ringVerts + k) * 3;
        positions[v] = px + dx * r;
        positions[v + 1] = py + dy * r;
        positions[v + 2] = pz + dz * r;
        const l = Math.hypot(dx, dy, dz) || 1;
        normals[v] = dx / l;
        normals[v + 1] = dy / l;
        normals[v + 2] = dz / l;
      }
    }
  }

  commit(): void {
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.normal.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();
  }
}
