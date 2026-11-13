import { describe, expect, it } from 'vitest';
import { armBase, armCurveLength, computeArmCurve, createArmCurve, RIG } from './armCurve';
import { blendPose, clonePose, isValidPose, poseDistance } from './pose';
import { PoseController } from './PoseController';
import { ARM_HOME_YAW, makeArm, REST_POSE } from './restPose';
import { channelWeights, DEFAULT_SEQUENCE, phaseAt, QUICK_SEQUENCE, validateSequence } from './transition';
import { ARM_COUNT, type PoseDefinition } from './types';

const other = (): PoseDefinition => {
  const p = clonePose(REST_POSE);
  p.arms.forEach((a, i) => {
    a.yaw += 1;
    a.length = 1.1;
    a.pitch0 = 0.4 + i * 0.01;
  });
  p.body.height = 1.2;
  p.skin.bandContrast = 1;
  p.skin.dark = [0, 0, 0];
  p.movement.travel = 0.5;
  return p;
};

describe('poses', () => {
  it('rest pose has eight valid arms', () => {
    expect(REST_POSE.arms.length).toBe(8);
    expect(isValidPose(REST_POSE)).toBe(true);
  });

  it('blends each channel independently', () => {
    const a = REST_POSE;
    const b = other();
    const out = clonePose(a);
    blendPose(out, a, b, { arms: 0, body: 0, skin: 0, movement: 0 });
    expect(poseDistance(out, a)).toBe(0);
    blendPose(out, a, b, { arms: 1, body: 1, skin: 1, movement: 1 });
    expect(poseDistance(out, b)).toBeLessThan(1e-12);
    blendPose(out, a, b, { arms: 1, body: 0, skin: 0, movement: 0 });
    expect(out.arms[0].yaw).toBeCloseTo(b.arms[0].yaw);
    expect(out.body.height).toBe(a.body.height);
    expect(out.skin.bandContrast).toBe(a.skin.bandContrast);
    expect(out.movement.travel).toBe(a.movement.travel);
  });
});

describe('arm curve', () => {
  const curve = createArmCurve(48);
  const base = { x: 0, y: 0.24, z: 0.15 };

  const check = (pose = makeArm(), homeYaw = 0) => {
    computeArmCurve(curve, pose, base, { homeYaw, phase: 0.3 });
    for (let i = 0; i < curve.count * 3; i++) {
      expect(Number.isFinite(curve.pos[i])).toBe(true);
      expect(Number.isFinite(curve.nor[i])).toBe(true);
    }
    for (let i = 0; i < curve.count; i++) {
      const o = i * 3;
      const dotTN = curve.tan[o] * curve.nor[o] + curve.tan[o + 1] * curve.nor[o + 1] + curve.tan[o + 2] * curve.nor[o + 2];
      expect(Math.abs(dotTN)).toBeLessThan(1e-3);
      const nLen = Math.hypot(curve.nor[o], curve.nor[o + 1], curve.nor[o + 2]);
      expect(nLen).toBeCloseTo(1, 4);
      if (i > 0) {
        const p = o - 3;
        const dotNN = curve.nor[o] * curve.nor[p] + curve.nor[o + 1] * curve.nor[p + 1] + curve.nor[o + 2] * curve.nor[p + 2];
        expect(dotNN).toBeGreaterThan(0);
      }
    }
  };

  it('is finite with orthonormal, non-flipping frames for ordinary and vertical arms', () => {
    check(makeArm({ yaw: 0.4, bend: 1.2, coil: 2.5 }), 0.39);
    check(makeArm({ pitch0: Math.PI / 2, pitch1: Math.PI / 2 }), 1.2);
    check(makeArm({ pitch0: -Math.PI / 2, pitch1: -Math.PI / 2, bury: 1 }), -2);
    check(makeArm({ pitch0: 1.5, pitch1: 1.2, curl: 3, waveAmp: 0.6, waveAxis: 1 }), 2.7);
  });

  it('preserves arc length for each extension factor', () => {
    for (const length of [0.5, 1, 1.2]) {
      computeArmCurve(curve, makeArm({ length, bend: 1, coil: 2, pitch0: -0.8 }), base, { homeYaw: 0, phase: 0 });
      expect(armCurveLength(curve) / (RIG.ARM_LENGTH * length)).toBeGreaterThan(0.97);
      expect(armCurveLength(curve) / (RIG.ARM_LENGTH * length)).toBeLessThan(1.03);
    }
  });

  it('keeps an unburied arm on or above the sand', () => {
    computeArmCurve(curve, makeArm({ pitch0: -1.2, pitch1: -0.4 }), base, { homeYaw: 0, phase: 0 });
    for (let i = 1; i < curve.count; i++) {
      expect(curve.pos[i * 3 + 1]).toBeGreaterThanOrEqual(curve.rad[i] - 1e-3);
    }
  });

  it('lets a buried arm go below the sand', () => {
    computeArmCurve(curve, makeArm({ pitch0: -1.3, pitch1: -1.0, bury: 1, length: 0.5 }), base, { homeYaw: 0, phase: 0 });
    expect(curve.pos[(curve.count - 1) * 3 + 1]).toBeLessThan(-0.5);
  });

  it('places eight distinct arm bases around the crown', () => {
    const seen = new Set<string>();
    for (let i = 0; i < ARM_COUNT; i++) {
      const b = armBase({ x: 0, y: 0, z: 0 }, 0, 0.34, 0, ARM_HOME_YAW[i]);
      seen.add(`${b.x.toFixed(3)},${b.z.toFixed(3)}`);
    }
    expect(seen.size).toBe(8);
  });
});

describe('transition sequence', () => {
  it('default and quick sequences are valid', () => {
    expect(validateSequence(DEFAULT_SEQUENCE)).toEqual([]);
    expect(validateSequence(QUICK_SEQUENCE)).toEqual([]);
  });

  it('weights go from 0 to 1 monotonically', () => {
    const first = channelWeights(DEFAULT_SEQUENCE, 0);
    expect([first.arms, first.body, first.skin, first.movement, first.prep]).toEqual([0, 0, 0, 0, 0]);
    const last = channelWeights(DEFAULT_SEQUENCE, 1);
    expect([last.arms, last.body, last.skin, last.movement]).toEqual([1, 1, 1, 1]);
    expect(last.prep).toBeCloseTo(0, 6);
    let prev = { ...first };
    for (let i = 1; i <= 200; i++) {
      const w = channelWeights(DEFAULT_SEQUENCE, i / 200);
      for (const k of ['arms', 'body', 'skin', 'movement'] as const) expect(w[k]).toBeGreaterThanOrEqual(prev[k] - 1e-12);
      prev = { ...w };
    }
  });

  it('arms move before the body, the body before the skin', () => {
    const w = channelWeights(DEFAULT_SEQUENCE, 0.45);
    expect(w.arms).toBeGreaterThan(w.body);
    expect(w.body).toBeGreaterThan(w.skin);
  });

  it('reports the phase for a given progress', () => {
    expect(phaseAt(DEFAULT_SEQUENCE, 0).id).toBe('rest');
    expect(phaseAt(DEFAULT_SEQUENCE, 0.3).id).toBe('arms');
    expect(phaseAt(DEFAULT_SEQUENCE, 1).id).toBe('final');
  });
});

describe('PoseController', () => {
  const run = (c: PoseController, seconds: number, dt = 1 / 60) => {
    for (let t = 0; t < seconds - 1e-9; t += dt) c.update(dt);
  };

  it('reaches the target after the sequence duration, twice as slowly at half speed', () => {
    const c = new PoseController();
    c.reset();
    const target = other();
    c.setTarget(target);
    run(c, DEFAULT_SEQUENCE.duration - 0.5);
    expect(c.progress).toBeLessThan(1);
    run(c, 0.6);
    expect(c.progress).toBe(1);
    expect(poseDistance(c.current, target)).toBeLessThan(1e-9);

    c.setTarget(null);
    c.setSpeed(0.5);
    run(c, QUICK_SEQUENCE.duration + 0.1);
    expect(c.progress).toBeLessThan(1);
    run(c, QUICK_SEQUENCE.duration);
    expect(c.progress).toBe(1);
    expect(poseDistance(c.current, REST_POSE)).toBeLessThan(1e-9);
  });

  it('pause freezes progress and motion clocks; replay restarts from rest', () => {
    const c = new PoseController();
    c.reset();
    c.setTarget(other());
    run(c, 3);
    c.pause();
    const p = c.progress;
    const phase = c.armPhase[0];
    run(c, 2);
    expect(c.progress).toBe(p);
    expect(c.armPhase[0]).toBe(phase);
    c.replay();
    expect(c.progress).toBe(0);
    expect(c.playing).toBe(true);
    c.update(0);
    expect(poseDistance(c.current, REST_POSE)).toBeLessThan(1e-9);
  });

  it('does not snap when the target changes mid-transition', () => {
    const c = new PoseController();
    c.reset();
    c.setTarget(other());
    run(c, DEFAULT_SEQUENCE.duration * 0.5);
    const before = clonePose(c.current);
    const second = clonePose(REST_POSE);
    second.arms.forEach((a) => (a.pitch0 = 1.3));
    c.setTarget(second);
    c.update(0);
    expect(poseDistance(c.current, before)).toBeLessThan(1e-6);
  });

  it('seek while paused reports the matching phase', () => {
    const c = new PoseController();
    c.reset();
    c.setTarget(other());
    c.pause();
    c.seek(0.3);
    c.update(1 / 60);
    expect(c.progress).toBeCloseTo(0.3, 6);
    expect(c.phase.id).toBe('arms');
    c.seek(0.9);
    c.update(0);
    expect(c.phase.id).toBe('movement');
  });

  it('a masked channel stays at the starting pose', () => {
    const c = new PoseController();
    c.reset();
    c.setChannelMask({ skin: false });
    const target = other();
    c.setTarget(target);
    run(c, DEFAULT_SEQUENCE.duration + 0.1);
    expect(c.current.skin.bandContrast).toBe(REST_POSE.skin.bandContrast);
    expect(c.current.body.height).toBeCloseTo(target.body.height);
  });
});
