import * as THREE from 'three';
import { NOISE_GLSL } from '../shaders/noise';

export interface SandUniforms {
  uTime: { value: number };
  /** Treadmill offset along Z (the seabed slides backward when the animal travels forward). */
  uTravel: { value: number };
  /** 0..1 visibility of the burrow mouth at the origin. */
  uBurrow: { value: number };
  /** 1 = opaque sand, lower = translucent (to reveal buried arms). */
  uAlpha: { value: number };
  uCaustic: { value: number };
  [key: string]: { value: unknown };
}

export interface SandMaterial extends THREE.MeshStandardMaterial {
  sand: SandUniforms;
}

/** Dark silty sand with ripples, grain, caustics and an optional burrow mouth. */
export function createSandMaterial(): SandMaterial {
  const uniforms: SandUniforms = {
    uTime: { value: 0 },
    uTravel: { value: 0 },
    uBurrow: { value: 0 },
    uAlpha: { value: 1 },
    uCaustic: { value: 0.55 },
  };
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 }) as SandMaterial;
  material.sand = uniforms;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vSandPos;`)
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\nvSandPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        uniform float uTime;
        uniform float uTravel;
        uniform float uBurrow;
        uniform float uAlpha;
        uniform float uCaustic;
        varying vec3 vSandPos;
        float sandHeight = 0.0;
        ${NOISE_GLSL}`,
      )
      .replace(
        '#include <color_fragment>',
        /* glsl */ `#include <color_fragment>
        {
          vec2 p = vSandPos.xz + vec2(0.0, uTravel);
          float big = mlFbm(vec3(p * 0.35, 1.0));
          float ripple = sin(p.y * 5.5 + sin(p.x * 0.9) * 1.4 + big * 6.0);
          ripple = ripple * 0.5 + 0.5;
          float grain = mlNoise(vec3(p * 42.0, 3.0));
          float fine = mlNoise(vec3(p * 9.0, 7.0));
          vec3 silt = mix(vec3(0.05, 0.043, 0.034), vec3(0.17, 0.14, 0.1), big * 0.75 + ripple * 0.18);
          silt *= 0.8 + 0.3 * grain;
          silt = mix(silt, silt * 1.35, step(0.82, grain) * 0.6);
          sandHeight = ripple * 0.5 + fine * 0.35 + grain * 0.1;
          // Burrow mouth: a dark hole with a raised rim at the origin (does not travel).
          float d = length(vSandPos.xz);
          float hole = 1.0 - smoothstep(0.2, 0.46, d);
          float rim = smoothstep(0.4, 0.58, d) * (1.0 - smoothstep(0.62, 0.95, d));
          silt = mix(silt, vec3(0.01, 0.012, 0.014), hole * uBurrow);
          silt *= 1.0 + rim * 0.28 * uBurrow;
          sandHeight += rim * 1.6 * uBurrow - hole * 2.0 * uBurrow;
          diffuseColor.rgb = silt;
          diffuseColor.a = uAlpha;
        }`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        /* glsl */ `#include <normal_fragment_maps>
        {
          vec3 dpdx = dFdx(-vViewPosition);
          vec3 dpdy = dFdy(-vViewPosition);
          float dhx = dFdx(sandHeight);
          float dhy = dFdy(sandHeight);
          vec3 r1 = cross(dpdy, normal);
          vec3 r2 = cross(normal, dpdx);
          float det = dot(dpdx, r1);
          vec3 grad = sign(det) * (dhx * r1 + dhy * r2) * 0.05;
          normal = normalize(abs(det) * normal - grad);
        }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        totalEmissiveRadiance += diffuseColor.rgb * vec3(0.55, 0.9, 1.0) * mlCaustic(vSandPos.xz * 1.9, uTime) * uCaustic;`,
      );
  };
  material.customProgramCacheKey = () => 'mimic-sand-v1';
  return material;
}
