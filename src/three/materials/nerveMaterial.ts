import * as THREE from 'three';

export interface NerveUniforms {
  uTime: { value: number };
  uOpacity: { value: number };
  uColor: { value: THREE.Color };
  /** Steady glow. */
  uGlow: { value: number };
  /** Pulses travelling from the brain out along the arms (descending commands). */
  uPulseOut: { value: number };
  /** Pulses travelling from the arms toward the brain (sensory input). */
  uPulseIn: { value: number };
  /** Flickering activity that stays within the arm cords (local processing). */
  uLocal: { value: number };
  [key: string]: { value: unknown };
}

/**
 * Emissive material for nerve cords. Expects `aSkin.x` = position along the cord (0 at the
 * brain end) and `aArm` = arm index (used only to de-synchronise the pulses).
 */
export function createNerveMaterial(): THREE.ShaderMaterial & { nerve: NerveUniforms } {
  const uniforms: NerveUniforms = {
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uColor: { value: new THREE.Color(0xffe6a3) },
    uGlow: { value: 0.35 },
    uPulseOut: { value: 0 },
    uPulseIn: { value: 0 },
    uLocal: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute vec2 aSkin;
      attribute float aArm;
      varying float vS;
      varying float vArm;
      varying vec3 vN;
      varying vec3 vV;
      void main(){
        vS = aSkin.x;
        vArm = aArm;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uOpacity; uniform vec3 uColor;
      uniform float uGlow; uniform float uPulseOut; uniform float uPulseIn; uniform float uLocal;
      varying float vS; varying float vArm; varying vec3 vN; varying vec3 vV;
      float hash(float n){ return fract(sin(n) * 43758.5453); }
      void main(){
        float o = pow(max(0.0, sin(6.2831853 * (vS * 2.5 - uTime * 0.9 + vArm * 0.137))), 14.0) * uPulseOut;
        float i = pow(max(0.0, sin(6.2831853 * (vS * 2.5 + uTime * 0.9 + vArm * 0.311))), 14.0) * uPulseIn;
        float cell = floor(vS * 46.0);
        float l = step(0.8, hash(cell + vArm * 17.0 + floor(uTime * 7.0) * 3.1)) * uLocal;
        float rim = 0.55 + 0.45 * abs(dot(normalize(vN), normalize(vV)));
        float e = uGlow + o * 2.2 + i * 2.2 + l * 1.4;
        vec3 c = uColor * rim * (0.35 + e);
        c += vec3(0.38, 0.9, 0.88) * (o + i) * 0.9;
        gl_FragColor = vec4(c, uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }) as THREE.ShaderMaterial & { nerve: NerveUniforms };
  material.nerve = uniforms;
  return material;
}
