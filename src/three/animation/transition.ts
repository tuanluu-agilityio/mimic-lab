import type { ChannelWeights, TransitionPhase, TransitionSequence } from './types';

/**
 * The standard staged transition from the resting animal to a mimicry posture.
 * Phases overlap slightly so the motion reads as one continuous, organic action.
 */
export const DEFAULT_SEQUENCE: TransitionSequence = {
  duration: 9,
  phases: [
    { id: 'rest', start: 0, end: 0.06 },
    { id: 'prepare', start: 0.06, end: 0.2, channel: 'prep' },
    { id: 'arms', start: 0.18, end: 0.54, channel: 'arms' },
    { id: 'body', start: 0.4, end: 0.7, channel: 'body' },
    { id: 'skin', start: 0.58, end: 0.85, channel: 'skin' },
    { id: 'movement', start: 0.76, end: 0.95, channel: 'movement' },
    { id: 'final', start: 0.95, end: 1 },
  ],
};

/** A quicker, simpler blend used to return to rest or to switch locomotion demos. */
export const QUICK_SEQUENCE: TransitionSequence = {
  duration: 3.2,
  phases: [
    { id: 'arms', start: 0, end: 0.85, channel: 'arms' },
    { id: 'body', start: 0.1, end: 0.9, channel: 'body' },
    { id: 'skin', start: 0.15, end: 0.9, channel: 'skin' },
    { id: 'movement', start: 0.2, end: 1, channel: 'movement' },
  ],
};

/** Build a sequence with custom timing while keeping the standard phase order. */
export function makeSequence(
  duration: number,
  overrides: Partial<Record<TransitionPhase['id'], [number, number]>> = {},
): TransitionSequence {
  return {
    duration,
    phases: DEFAULT_SEQUENCE.phases.map((p) => {
      const o = overrides[p.id];
      return o ? { ...p, start: o[0], end: o[1] } : { ...p };
    }),
  };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Smooth ease-in-out (quintic smootherstep): zero velocity and acceleration at both ends. */
export const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Blend weight of each channel at normalised progress p. A channel with no phase follows overall progress. */
export function channelWeights(seq: TransitionSequence, p: number, out?: ChannelWeights): ChannelWeights {
  const w = out ?? { prep: 0, arms: 0, body: 0, skin: 0, movement: 0 };
  const overall = ease(clamp01(p));
  w.prep = 0;
  w.arms = w.body = w.skin = w.movement = overall;
  for (const phase of seq.phases) {
    if (!phase.channel) continue;
    const span = Math.max(1e-6, phase.end - phase.start);
    const local = clamp01((p - phase.start) / span);
    if (phase.channel === 'prep') {
      // 0 → 1 → 0 anticipation pulse.
      w.prep = Math.sin(Math.PI * ease(local));
    } else {
      w[phase.channel] = ease(local);
    }
  }
  return w;
}

/** The phase to display at progress p: the most recently started one. */
export function phaseAt(seq: TransitionSequence, p: number): TransitionPhase {
  let current = seq.phases[0];
  for (const phase of seq.phases) {
    if (p >= phase.start) current = phase;
  }
  return current;
}

/** Validation used by data tests. Returns a list of problems (empty = valid). */
export function validateSequence(seq: TransitionSequence): string[] {
  const problems: string[] = [];
  if (!(seq.duration > 0)) problems.push('duration must be positive');
  if (seq.phases.length === 0) problems.push('no phases');
  let prevStart = -Infinity;
  let maxEnd = 0;
  for (const p of seq.phases) {
    if (p.start < prevStart) problems.push(`phase ${p.id} starts before the previous phase`);
    if (p.end <= p.start) problems.push(`phase ${p.id} has no duration`);
    if (p.start < 0 || p.end > 1) problems.push(`phase ${p.id} is outside 0..1`);
    if (p.start > maxEnd + 1e-9) problems.push(`gap before phase ${p.id}`);
    prevStart = p.start;
    maxEnd = Math.max(maxEnd, p.end);
  }
  if (seq.phases.length && seq.phases[0].start !== 0) problems.push('first phase must start at 0');
  if (Math.abs(maxEnd - 1) > 1e-9) problems.push('phases must end at 1');
  return problems;
}
