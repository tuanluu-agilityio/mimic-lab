import * as THREE from 'three';
import type { QualityTier } from '../core/quality';
import { createSandMaterial, type SandMaterial } from '../materials/sandMaterial';

const WATER_DEEP = new THREE.Color(0x020b14);
const WATER_MID = new THREE.Color(0x05283a);
const WATER_TOP = new THREE.Color(0x0d5466);

/** Seabed, water volume (fog + gradient dome), lights and drifting marine snow. */
export class Environment {
  readonly group = new THREE.Group();
  readonly sand: SandMaterial;
  readonly keyLight: THREE.DirectionalLight;
  private readonly seabed: THREE.Mesh;
  private readonly dome: THREE.Mesh;
  private particles: THREE.Points | null = null;
  private readonly particleMaterial: THREE.ShaderMaterial;
  private readonly hemi: THREE.HemisphereLight;
  private readonly fill: THREE.DirectionalLight;

  constructor(private readonly scene: THREE.Scene, tier: QualityTier) {
    scene.fog = new THREE.FogExp2(0x041c2a, 0.06);
    scene.background = WATER_DEEP.clone();

    // Gradient dome: lighter water above, darkness below the horizon.
    const domeMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uTop: { value: WATER_TOP }, uMid: { value: WATER_MID }, uDeep: { value: WATER_DEEP } },
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uDeep; varying vec3 vDir;
        void main(){
          float h = vDir.y;
          vec3 c = mix(uMid, uTop, smoothstep(0.0, 0.9, h));
          c = mix(c, uDeep, smoothstep(0.02, -0.35, h));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(150, 24, 16), domeMat);
    this.dome.renderOrder = -10;
    this.group.add(this.dome);

    this.sand = createSandMaterial();
    this.seabed = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 1, 1), this.sand);
    this.seabed.rotation.x = -Math.PI / 2;
    this.seabed.receiveShadow = true;
    this.seabed.name = 'seabed';
    this.group.add(this.seabed);

    this.hemi = new THREE.HemisphereLight(0x58b8cc, 0x14100a, 0.8);
    this.keyLight = new THREE.DirectionalLight(0xcfeeff, 1.9);
    this.keyLight.position.set(2.2, 9, 3.4);
    this.keyLight.castShadow = true;
    const cam = this.keyLight.shadow.camera;
    cam.left = -7.5;
    cam.right = 7.5;
    cam.top = 7.5;
    cam.bottom = -7.5;
    cam.near = 1;
    cam.far = 24;
    this.keyLight.shadow.bias = -0.0006;
    this.keyLight.shadow.normalBias = 0.025;
    this.keyLight.shadow.radius = 5;
    this.fill = new THREE.DirectionalLight(0x4fd0d6, 0.38);
    this.fill.position.set(-4, 2.5, -3);
    this.group.add(this.hemi, this.keyLight, this.keyLight.target, this.fill);

    this.particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uTravel: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uTravel; uniform float uPixelRatio;
        attribute float aSeed;
        varying float vAlpha;
        void main(){
          vec3 p = position;
          // Slow sinking drift, wrapped inside a box around the origin.
          p.y = mod(p.y - uTime * (0.03 + aSeed * 0.05), 9.0) - 0.2;
          p.x += sin(uTime * 0.21 + aSeed * 40.0) * 0.35;
          p.z = mod(p.z - uTravel + 11.0, 22.0) - 11.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float dist = -mv.z;
          gl_PointSize = (1.2 + aSeed * 2.6) * uPixelRatio * (9.0 / max(1.0, dist));
          vAlpha = (0.16 + aSeed * 0.34) * smoothstep(26.0, 6.0, dist) * smoothstep(0.15, 1.2, dist);
        }`,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d) * vAlpha;
          gl_FragColor = vec4(vec3(0.72, 0.9, 0.92), a);
        }`,
    });
    this.setDetail(tier);
    scene.add(this.group);
  }

  setDetail(tier: QualityTier): void {
    if (this.particles) {
      this.group.remove(this.particles);
      this.particles.geometry.dispose();
    }
    const n = tier.particles;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    // Deterministic pseudo-random placement so screenshots are stable.
    let s = 1337;
    const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (rnd() - 0.5) * 22;
      pos[i * 3 + 1] = rnd() * 9;
      pos[i * 3 + 2] = (rnd() - 0.5) * 22;
      seed[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 4, 0), 20);
    this.particles = new THREE.Points(g, this.particleMaterial);
    this.particles.frustumCulled = false;
    this.group.add(this.particles);

    this.keyLight.castShadow = tier.shadows;
    if (this.keyLight.shadow.mapSize.x !== tier.shadowMapSize) {
      this.keyLight.shadow.mapSize.set(tier.shadowMapSize, tier.shadowMapSize);
      this.keyLight.shadow.map?.dispose();
      this.keyLight.shadow.map = null;
    }
  }

  update(time: number, travel: number, burrow: number, sandAlpha: number, pixelRatio: number): void {
    this.sand.sand.uTime.value = time;
    this.sand.sand.uTravel.value = travel;
    this.sand.sand.uBurrow.value = burrow;
    this.sand.sand.uAlpha.value = sandAlpha;
    const transparent = sandAlpha < 0.995;
    if (this.sand.transparent !== transparent) {
      this.sand.transparent = transparent;
      this.sand.depthWrite = !transparent;
      this.sand.needsUpdate = true;
    }
    this.particleMaterial.uniforms.uTime.value = time;
    this.particleMaterial.uniforms.uTravel.value = travel;
    this.particleMaterial.uniforms.uPixelRatio.value = pixelRatio;
  }

  /** The skin-structure view is a lab close-up: hide the seabed and snow. */
  setSeabedVisible(visible: boolean): void {
    this.seabed.visible = visible;
    if (this.particles) this.particles.visible = visible;
  }

  dispose(): void {
    this.scene.remove(this.group);
    this.seabed.geometry.dispose();
    this.sand.dispose();
    this.dome.geometry.dispose();
    (this.dome.material as THREE.Material).dispose();
    this.particles?.geometry.dispose();
    this.particleMaterial.dispose();
    this.keyLight.shadow.map?.dispose();
    this.scene.fog = null;
  }
}
