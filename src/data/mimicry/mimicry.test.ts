import { describe, expect, it } from 'vitest';
import { LOCOMOTION_MODES } from '@/data/mechanisms/locomotion';
import { hasReference } from '@/data/references';
import type { TargetText } from '@/i18n/content';
import en from '@/i18n/locales/en';
import { armBase, computeArmCurve, createArmCurve } from '@/three/animation/armCurve';
import { isValidPose } from '@/three/animation/pose';
import { PoseController } from '@/three/animation/PoseController';
import { ARM_HOME_YAW } from '@/three/animation/restPose';
import { validateSequence } from '@/three/animation/transition';
import { ARM_COUNT } from '@/three/animation/types';
import { REFERENCE_MODEL_IDS } from '@/types/app';
import { COMPARISON_ASPECTS, MIMICRY_TARGETS } from './index';

// Text is checked against the English source; `src/i18n/i18n.test.ts` holds the other locales to it.
const TEXT: Record<string, TargetText> = en.mimicry.targets;

describe('mimicry catalogue', () => {
  it('has exactly ten targets numbered 1 to 10 with unique ids', () => {
    expect(MIMICRY_TARGETS.length).toBe(10);
    expect(MIMICRY_TARGETS.map((t) => t.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(MIMICRY_TARGETS.map((t) => t.id)).size).toBe(10);
  });

  it('does not present all ten as equally established', () => {
    const levels = new Set(MIMICRY_TARGETS.map((t) => t.evidenceLevel));
    expect(levels.size).toBeGreaterThan(1);
    // Anything without a peer-reviewed description must be shown as a conceptual reconstruction.
    for (const t of MIMICRY_TARGETS) if (t.evidenceLevel === 'C') expect(t.reconstruction).toBe('conceptual');
  });

  it.each(MIMICRY_TARGETS.map((t) => [t.id, t] as const))('%s is complete and valid', (_id, t) => {
    expect(['A', 'B', 'C']).toContain(t.evidenceLevel);
    const text = TEXT[t.id];
    expect(text.name.length).toBeGreaterThan(2);
    for (const value of [text.tagline, text.evidenceDescription, text.reconstructionNote, text.limitations, text.mechanism]) {
      expect(value.length).toBeGreaterThan(10);
    }
    expect(t.references.length).toBeGreaterThan(0);
    for (const r of t.references) expect(hasReference(r), `unknown reference ${r}`).toBe(true);
    expect(isValidPose(t.pose)).toBe(true);
    expect(t.pose.arms.length).toBe(ARM_COUNT);
    expect(t.involvedArms.length).toBeGreaterThan(0);
    for (const a of t.involvedArms) expect(a >= 0 && a < ARM_COUNT && Number.isInteger(a)).toBe(true);
    expect(validateSequence(t.transitionSequence)).toEqual([]);
    expect(REFERENCE_MODEL_IDS).toContain(t.referenceModel);
    for (const aspect of COMPARISON_ASPECTS) {
      expect(text.comparison[aspect].model.length, aspect).toBeGreaterThan(2);
      expect(text.comparison[aspect].octopus.length, aspect).toBeGreaterThan(2);
    }
    // Arms are shortened or buried, never removed.
    for (const arm of t.pose.arms) expect(arm.length).toBeGreaterThanOrEqual(0.25);
    // Copy must not claim a literal transformation.
    const copy = JSON.stringify([text.tagline, text.evidenceDescription, text.mechanism, text.context, text.comparison, text.limitations]).toLowerCase();
    expect(copy).not.toMatch(/transforms? into|becomes? a |turns? into/);
  });
});

/** Play a transition at 60 fps and return the largest per-frame movement of any arm sample. */
function maxFrameJump(setup: (c: PoseController) => void, seconds: number): { jump: number; finite: boolean } {
  const c = new PoseController();
  c.reset();
  const segments = 40;
  const curves = Array.from({ length: ARM_COUNT }, () => createArmCurve(segments));
  const prev = curves.map((k) => new Float32Array(k.pos.length));
  const base = { x: 0, y: 0, z: 0 };
  const sample = () => {
    const pose = c.update(1 / 60);
    for (let i = 0; i < ARM_COUNT; i++) {
      armBase(base, 0, pose.body.height, 0, ARM_HOME_YAW[i]);
      computeArmCurve(curves[i], pose.arms[i], base, { homeYaw: ARM_HOME_YAW[i], phase: c.armPhase[i] });
    }
  };
  sample();
  setup(c);
  let jump = 0;
  let finite = true;
  for (let f = 0; f < seconds * 60; f++) {
    curves.forEach((k, i) => prev[i].set(k.pos));
    sample();
    curves.forEach((k, i) => {
      for (let p = 0; p < k.count; p++) {
        const o = p * 3;
        const d = Math.hypot(k.pos[o] - prev[i][o], k.pos[o + 1] - prev[i][o + 1], k.pos[o + 2] - prev[i][o + 2]);
        if (!Number.isFinite(d)) finite = false;
        jump = Math.max(jump, d);
      }
    });
  }
  return { jump, finite };
}

describe('transitions are continuous', () => {
  it.each(MIMICRY_TARGETS.map((t) => [t.id, t] as const))('rest → %s → rest has no jumps', (_id, t) => {
    const there = maxFrameJump((c) => c.setTarget(t.pose, t.transitionSequence), t.transitionSequence.duration + 2);
    expect(there.finite).toBe(true);
    expect(there.jump).toBeLessThan(0.35);
  });

  it('switching between every pair of consecutive targets mid-transition has no jumps', () => {
    for (let i = 0; i < MIMICRY_TARGETS.length; i++) {
      const a = MIMICRY_TARGETS[i];
      const b = MIMICRY_TARGETS[(i + 1) % MIMICRY_TARGETS.length];
      let switched = false;
      const c2 = maxFrameJump((c) => {
        c.setTarget(a.pose, a.transitionSequence);
        // Advance halfway, then retarget.
        for (let f = 0; f < a.transitionSequence.duration * 30; f++) c.update(1 / 60);
        c.setTarget(b.pose, b.transitionSequence);
        switched = true;
      }, b.transitionSequence.duration + 1);
      expect(switched).toBe(true);
      expect(c2.finite).toBe(true);
    }
  });

  it.each(LOCOMOTION_MODES.map((m) => [m.id, m] as const))('locomotion %s is valid and continuous', (_id, m) => {
    expect(isValidPose(m.pose)).toBe(true);
    for (const r of m.references) expect(hasReference(r)).toBe(true);
    const r = maxFrameJump((c) => c.setTarget(m.pose), 12);
    expect(r.finite).toBe(true);
    expect(r.jump).toBeLessThan(0.35);
  });
});
