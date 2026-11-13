import type { ArmPose, Vec3Like } from './types';

/**
 * Proportions of the procedural rig, in model units (resting mantle length is about 1 unit).
 * The species has very long, slender arms: roughly seven times the mantle length in the
 * species description. The rig uses a slightly shorter relaxed length because resting arms
 * are partly contracted; `ArmPose.length` stretches them toward the full figure.
 */
export const RIG = {
  ARM_LENGTH: 5.4,
  ARM_BASE_RADIUS: 0.082,
  ARM_TIP_RADIUS: 0.007,
  /** Radius of the ring on which the eight arm bases sit. */
  CROWN_RADIUS: 0.15,
  /** How far below the head centre the arm crown sits. */
  CROWN_DROP: 0.1,
} as const;

/** Sampled centreline of one arm with a twist-free frame at each sample. */
export interface ArmCurve {
  /** Number of samples (segments + 1). */
  count: number;
  /** xyz per sample. */
  pos: Float32Array;
  /** Unit tangent. */
  tan: Float32Array;
  /** Unit normal pointing to the oral (sucker) side. */
  nor: Float32Array;
  /** Unit binormal = tan × nor. */
  bin: Float32Array;
  /** Arm radius per sample. */
  rad: Float32Array;
}

export interface ArmCurveOptions {
  /** Heading at which this arm leaves the crown (rad). */
  homeYaw: number;
  /** Accumulated wave clock in cycles (integral of waveSpeed over time). */
  phase: number;
  armLength?: number;
  baseRadius?: number;
  tipRadius?: number;
  /** Extra yaw applied to the whole arm (body sway), radians. */
  bodyYaw?: number;
}

export function createArmCurve(segments: number): ArmCurve {
  const count = segments + 1;
  return {
    count,
    pos: new Float32Array(count * 3),
    tan: new Float32Array(count * 3),
    nor: new Float32Array(count * 3),
    bin: new Float32Array(count * 3),
    rad: new Float32Array(count),
  };
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const TAU = Math.PI * 2;
/** How far below the sand a fully buried arm is allowed to go. */
const BURY_DEPTH = 3;

/** Arm radius at normalised position s for a given extension factor. */
export function armRadius(s: number, length: number, baseRadius: number, tipRadius: number): number {
  const taper = Math.pow(1 - s, 0.82);
  return (tipRadius + (baseRadius - tipRadius) * taper) / Math.sqrt(Math.max(0.2, length));
}

/**
 * Compute the centreline of one arm from its pose.
 *
 * The arm is integrated from the base outward: at each step a heading (yaw, pitch) is derived
 * from the pose parameters plus a travelling wave, and the point advances one fixed-length step
 * along it. A ground constraint keeps unburied arms on the sand while preserving arc length.
 * Frames are parallel-transported, so the oral side never twists or flips.
 */
export function computeArmCurve(out: ArmCurve, pose: ArmPose, base: Vec3Like, opts: ArmCurveOptions): void {
  const n = out.count;
  const segs = n - 1;
  const L = (opts.armLength ?? RIG.ARM_LENGTH) * pose.length;
  const ds = L / segs;
  const baseR = opts.baseRadius ?? RIG.ARM_BASE_RADIUS;
  const tipR = opts.tipRadius ?? RIG.ARM_TIP_RADIUS;
  const bodyYaw = opts.bodyYaw ?? 0;
  const { pos, tan, nor, bin, rad } = out;

  // The arm leaves the crown partly along its home heading, then swings to the pose heading.
  const yawDelta = pose.yaw - opts.homeYaw;
  const buryDrop = pose.bury * BURY_DEPTH;

  let x = base.x;
  let y = base.y;
  let z = base.z;

  for (let i = 0; i < n; i++) {
    const s = i / segs;
    const r = armRadius(s, pose.length, baseR, tipR);
    rad[i] = r;
    const floor = r - buryDrop;
    if (i === 0 && y < floor - ds) {
      // Base is deep under the sand (animal in a burrow): start from where it is.
    }
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    if (i === segs) break;

    const sm = (i + 0.5) / segs;
    const env = smoothstep(0, 0.22, sm);
    const wave =
      pose.waveAmp * env * Math.sin(TAU * (pose.waveFreq * sm - opts.phase) + pose.wavePhase);
    const tipZone = smoothstep(0.32, 1, sm);
    const yaw =
      bodyYaw +
      pose.yaw -
      yawDelta * 0.55 * (1 - smoothstep(0, 0.12, sm)) +
      pose.bend * sm +
      pose.coil * tipZone * tipZone +
      wave * (1 - pose.waveAxis);
    const pitch =
      pose.pitch0 +
      (pose.pitch1 - pose.pitch0) * Math.pow(sm, Math.max(0.05, pose.pitchBias)) +
      pose.curl * tipZone * tipZone +
      wave * pose.waveAxis;

    const cp = Math.cos(pitch);
    let dx = Math.sin(yaw) * cp;
    let dy = Math.sin(pitch);
    let dz = Math.cos(yaw) * cp;

    // Ground constraint for the next sample, preserving the step length.
    const sNext = (i + 1) / segs;
    const floorNext = armRadius(sNext, pose.length, baseR, tipR) - buryDrop;
    let stepY = dy * ds;
    if (y + stepY < floorNext) {
      stepY = Math.min(ds, floorNext - y);
      const horiz = Math.sqrt(Math.max(0, ds * ds - stepY * stepY));
      let hl = Math.hypot(dx, dz);
      if (hl < 1e-5) {
        // Heading is vertical: fall back to the arm's nominal heading.
        dx = Math.sin(bodyYaw + pose.yaw);
        dz = Math.cos(bodyYaw + pose.yaw);
        hl = 1;
      }
      dx = (dx / hl) * (horiz / ds);
      dz = (dz / hl) * (horiz / ds);
      dy = stepY / ds;
    }
    x += dx * ds;
    y += dy * ds;
    z += dz * ds;
  }

  // Tangents by finite differences.
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1) * 3;
    const b = Math.min(segs, i + 1) * 3;
    let tx = pos[b] - pos[a];
    let ty = pos[b + 1] - pos[a + 1];
    let tz = pos[b + 2] - pos[a + 2];
    const l = Math.hypot(tx, ty, tz) || 1;
    tx /= l;
    ty /= l;
    tz /= l;
    tan[i * 3] = tx;
    tan[i * 3 + 1] = ty;
    tan[i * 3 + 2] = tz;
  }

  // Initial oral normal: straight down, made perpendicular to the tangent. If the arm leaves
  // the body vertically, use the horizontal direction pointing back toward the body axis.
  let nx = 0;
  let ny = -1;
  let nz = 0;
  {
    const d = nx * tan[0] + ny * tan[1] + nz * tan[2];
    nx -= d * tan[0];
    ny -= d * tan[1];
    nz -= d * tan[2];
    let l = Math.hypot(nx, ny, nz);
    if (l < 0.15) {
      const sign = tan[1] > 0 ? 1 : -1;
      nx = Math.sin(opts.homeYaw + bodyYaw) * sign;
      ny = 0;
      nz = Math.cos(opts.homeYaw + bodyYaw) * sign;
      const d2 = nx * tan[0] + ny * tan[1] + nz * tan[2];
      nx -= d2 * tan[0];
      ny -= d2 * tan[1];
      nz -= d2 * tan[2];
      l = Math.hypot(nx, ny, nz) || 1;
    }
    nx /= l;
    ny /= l;
    nz /= l;
  }

  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const tx = tan[o];
    const ty = tan[o + 1];
    const tz = tan[o + 2];
    // Parallel transport by projection: remove the component along the new tangent.
    const d = nx * tx + ny * ty + nz * tz;
    nx -= d * tx;
    ny -= d * ty;
    nz -= d * tz;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l;
    ny /= l;
    nz /= l;
    nor[o] = nx;
    nor[o + 1] = ny;
    nor[o + 2] = nz;
    bin[o] = ty * nz - tz * ny;
    bin[o + 1] = tz * nx - tx * nz;
    bin[o + 2] = tx * ny - ty * nx;
  }
}

/** Polyline length of a computed curve. */
export function armCurveLength(c: ArmCurve): number {
  let len = 0;
  for (let i = 1; i < c.count; i++) {
    const a = (i - 1) * 3;
    const b = i * 3;
    len += Math.hypot(c.pos[b] - c.pos[a], c.pos[b + 1] - c.pos[a + 1], c.pos[b + 2] - c.pos[a + 2]);
  }
  return len;
}

/** Position on the arm crown where arm `homeYaw` attaches, given the head centre. */
export function armBase(out: Vec3Like, headX: number, headY: number, headZ: number, homeYaw: number, bodyYaw = 0): Vec3Like {
  const a = homeYaw + bodyYaw;
  out.x = headX + Math.sin(a) * RIG.CROWN_RADIUS;
  out.y = headY - RIG.CROWN_DROP;
  out.z = headZ + Math.cos(a) * RIG.CROWN_RADIUS;
  return out;
}
