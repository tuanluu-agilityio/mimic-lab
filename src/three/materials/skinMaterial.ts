import * as THREE from 'three';
import type { SkinPattern } from '../animation/types';
import { NOISE_GLSL } from '../shaders/noise';

/** Values of the per-vertex `aPart` attribute. */
export const PART = { MANTLE: 0, HEAD: 1, ARM: 2, WEB: 3 } as const;

export interface SkinUniforms {
  uTime: { value: number };
  uDark: { value: THREE.Color };
  uLight: { value: THREE.Color };
  uBandFreq: { value: number };
  uBandContrast: { value: number };
  uBandSharp: { value: number };
  uMottle: { value: number };
  uPale: { value: number };
  uTexture: { value: number };
  uCaustic: { value: number };
  uXray: { value: number };
  uXrayColor: { value: THREE.Color };
  /** Part index to keep solid while the rest is ghosted, or -1. */
  uIsolatePart: { value: number };
  /** Part index to rim-highlight, or -1. */
  uHighlightPart: { value: number };
  uArmHighlight: { value: number[] };
  uHighlightColor: { value: THREE.Color };
  /** 0..1 strength of the sagittal cut. */
  uSection: { value: number };
  /** World-space x of the cutting plane. */
  uSectionX: { value: number };
  [key: string]: { value: unknown };
}

export interface SkinMaterial extends THREE.MeshStandardMaterial {
  skin: SkinUniforms;
  /** Thin membranes (the web) are always drawn double-sided. */
  alwaysDouble: boolean;
}

/**
 * The octopus skin: a standard PBR material patched with a procedural pattern
 * (banding, blotches, chromatophore speckle), caustics, an X-ray shell mode,
 * a sagittal section clip and rim highlights.
 *
 * Geometry using it must provide `aSkin` (vec2: position along the part 0..1, angle around
 * 0..1 with 0.25 = oral/ventral side), `aPart` (float, see PART) and `aArm` (float arm index or -1).
 */
export function createSkinMaterial(shared?: SkinUniforms, alwaysDouble = false): SkinMaterial {
  const uniforms: SkinUniforms = shared ?? {
    uTime: { value: 0 },
    uDark: { value: new THREE.Color() },
    uLight: { value: new THREE.Color() },
    uBandFreq: { value: 11 },
    uBandContrast: { value: 0.5 },
    uBandSharp: { value: 0.35 },
    uMottle: { value: 0.4 },
    uPale: { value: 0.1 },
    uTexture: { value: 0.4 },
    uCaustic: { value: 0.5 },
    uXray: { value: 0 },
    uXrayColor: { value: new THREE.Color(0x62e6e0) },
    uIsolatePart: { value: -1 },
    uHighlightPart: { value: -1 },
    uArmHighlight: { value: [0, 0, 0, 0, 0, 0, 0, 0] },
    uHighlightColor: { value: new THREE.Color(0x62e6e0) },
    uSection: { value: 0 },
    uSectionX: { value: 0 },
  };

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.0,
    side: alwaysDouble ? THREE.DoubleSide : THREE.FrontSide,
  }) as SkinMaterial;
  material.skin = uniforms;
  material.alwaysDouble = alwaysDouble;

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        attribute vec2 aSkin;
        attribute float aPart;
        attribute float aArm;
        varying vec2 vSkin;
        varying float vPart;
        varying float vArm;
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;`,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `#include <begin_vertex>
        vSkin = aSkin;
        vPart = aPart;
        vArm = aArm;
        vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        uniform float uTime;
        uniform vec3 uDark;
        uniform vec3 uLight;
        uniform float uBandFreq;
        uniform float uBandContrast;
        uniform float uBandSharp;
        uniform float uMottle;
        uniform float uPale;
        uniform float uTexture;
        uniform float uCaustic;
        uniform float uXray;
        uniform vec3 uXrayColor;
        uniform float uIsolatePart;
        uniform float uHighlightPart;
        uniform float uArmHighlight[8];
        uniform vec3 uHighlightColor;
        uniform float uSection;
        uniform float uSectionX;
        varying vec2 vSkin;
        varying float vPart;
        varying float vArm;
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;
        float mlHeight = 0.0;
        ${NOISE_GLSL}`,
      )
      .replace(
        '#include <color_fragment>',
        /* glsl */ `#include <color_fragment>
        if (uSection > 0.5 && vPart < 1.5 && vWorldPos.x > uSectionX) discard;
        {
          float isArm = step(1.5, vPart);
          float ang = vSkin.y * 6.2831853;
          // Seamless coordinates around the limb.
          vec3 sp = vec3(cos(ang) * 1.3, sin(ang) * 1.3, vSkin.x * mix(7.0, 30.0, isArm) + vArm * 9.1 + vPart * 3.3);
          float n1 = mlFbm(sp * 1.6);
          float n2 = mlFbm(sp * 4.5 + 20.0);
          float freq = mix(uBandFreq * 0.34, uBandFreq, isArm);
          float bandWave = sin(vSkin.x * freq * 6.2831853 + (n1 - 0.5) * 2.6);
          float edge = mix(1.0, 0.07, uBandSharp);
          float band = smoothstep(-edge, edge, bandWave);
          float tone = mix(0.42, band, uBandContrast);
          tone *= mix(1.0, 0.45 + 1.1 * n1, uMottle);
          tone = mix(tone, 1.0, uPale);
          // Oral side of the arms and the underside of the body are paler.
          float ventral = smoothstep(0.55, 1.0, cos(ang - 1.5707963));
          tone = mix(tone, 0.95, ventral * mix(0.35, 0.7, isArm));
          vec3 skinCol = mix(uDark, uLight, clamp(tone, 0.0, 1.0));
          // Chromatophore speckle: tiny darker dots, denser where the skin is dark.
          vec3 cp = sp * vec3(5.0, 5.0, 6.0);
          float cells = mlCells(cp);
          // Fade the speckle out where it would alias (far away or at grazing angles).
          float detail = 1.0 - smoothstep(0.25, 0.9, length(fwidth(cp)));
          float dots = (1.0 - smoothstep(0.14, 0.4, cells)) * detail;
          skinCol *= 1.0 - dots * mix(0.42, 0.16, clamp(tone, 0.0, 1.0));
          skinCol *= 0.86 + 0.28 * n2;
          mlHeight = (n2 * 0.6 + (1.0 - smoothstep(0.0, 0.5, cells)) * 0.5 * detail) * uTexture;
          diffuseColor.rgb = skinCol;
          if (!gl_FrontFacing && uSection > 0.5) {
            // Inner wall of the sectioned mantle.
            diffuseColor.rgb = vec3(0.5, 0.2, 0.19) * (0.8 + 0.3 * n1);
            mlHeight = 0.0;
          }
        }`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        /* glsl */ `#include <normal_fragment_maps>
        {
          // Procedural bump from the skin height field (papillae and grain).
          vec3 dpdx = dFdx(-vViewPosition);
          vec3 dpdy = dFdy(-vViewPosition);
          float dhx = dFdx(mlHeight);
          float dhy = dFdy(mlHeight);
          vec3 r1 = cross(dpdy, normal);
          vec3 r2 = cross(normal, dpdx);
          float det = dot(dpdx, r1);
          vec3 grad = sign(det) * (dhx * r1 + dhy * r2) * 0.035;
          normal = normalize(abs(det) * normal - grad);
        }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `#include <emissivemap_fragment>
        {
          float up = clamp(vWorldNormal.y * 0.5 + 0.5, 0.0, 1.0);
          float ca = mlCaustic(vWorldPos.xz + vWorldPos.y * 0.3, uTime);
          totalEmissiveRadiance += diffuseColor.rgb * vec3(0.75, 0.95, 1.0) * ca * uCaustic * up * up * (1.0 - uXray);
        }`,
      )
      .replace(
        '#include <dithering_fragment>',
        /* glsl */ `#include <dithering_fragment>
        {
          float fres = 1.0 - abs(dot(normalize(vViewPosition), normal));
          float ghost = uXray;
          if (uIsolatePart > -0.5 && abs(vPart - uIsolatePart) > 0.5) ghost = max(ghost, 0.97);
          float hl = 0.0;
          if (uHighlightPart > -0.5 && abs(vPart - uHighlightPart) < 0.5) hl = 1.0;
          if (vPart > 1.5 && vPart < 2.5) hl = max(hl, uArmHighlight[int(clamp(vArm + 0.5, 0.0, 7.0))]);
          float pulse = 0.75 + 0.25 * sin(uTime * 3.0);
          gl_FragColor.rgb += uHighlightColor * hl * pulse * (0.1 + 0.9 * pow(fres, 2.0)) * (1.0 - ghost * 0.5);
          if (ghost > 0.002) {
            vec3 shell = uXrayColor * (0.1 + 1.1 * pow(fres, 2.2)) + uHighlightColor * hl * 0.25;
            gl_FragColor.rgb = mix(gl_FragColor.rgb, shell, ghost);
            gl_FragColor.a = mix(1.0, 0.035 + 0.5 * pow(fres, 2.2) + hl * 0.12, ghost);
          }
        }`,
      );
  };
  material.customProgramCacheKey = () => 'mimic-skin-v1';
  return material;
}

/** Push a pose's skin pattern into the material uniforms. */
export function applySkinPattern(material: SkinMaterial, pattern: SkinPattern): void {
  const u = material.skin;
  u.uDark.value.setRGB(pattern.dark[0], pattern.dark[1], pattern.dark[2]);
  u.uLight.value.setRGB(pattern.light[0], pattern.light[1], pattern.light[2]);
  u.uBandFreq.value = pattern.bandFreq;
  u.uBandContrast.value = pattern.bandContrast;
  u.uBandSharp.value = pattern.bandSharpness;
  u.uMottle.value = pattern.mottle;
  u.uPale.value = pattern.pale;
  u.uTexture.value = pattern.texture;
}

/** Switch render state to match how transparent the shell currently is. */
export function syncSkinRenderState(material: SkinMaterial): void {
  const u = material.skin;
  const ghosted = u.uXray.value > 0.004 || u.uIsolatePart.value > -0.5;
  const sectioned = u.uSection.value > 0.5;
  const side = ghosted || sectioned || material.alwaysDouble ? THREE.DoubleSide : THREE.FrontSide;
  if (material.transparent !== ghosted || material.side !== side) {
    material.transparent = ghosted;
    material.depthWrite = !ghosted;
    material.side = side;
    material.needsUpdate = true;
  }
}

/** Add constant skin attributes to a static geometry (eye stalks, funnel, papillae). */
export function addSkinAttributes(geometry: THREE.BufferGeometry, part: number, along = 0.5): THREE.BufferGeometry {
  const n = geometry.attributes.position.count;
  const skin = new Float32Array(n * 2);
  const partArr = new Float32Array(n).fill(part);
  const arm = new Float32Array(n).fill(-1);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < n; i++) {
    skin[i * 2] = along + (uv ? uv.getY(i) * 0.08 : 0);
    skin[i * 2 + 1] = uv ? uv.getX(i) : 0;
  }
  geometry.setAttribute('aSkin', new THREE.BufferAttribute(skin, 2));
  geometry.setAttribute('aPart', new THREE.BufferAttribute(partArr, 1));
  geometry.setAttribute('aArm', new THREE.BufferAttribute(arm, 1));
  return geometry;
}
