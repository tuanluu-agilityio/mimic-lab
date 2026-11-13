import { blendPose, clonePose, copyPose } from './pose';
import { REST_POSE } from './restPose';
import { channelWeights, DEFAULT_SEQUENCE, phaseAt, QUICK_SEQUENCE } from './transition';
import {
  ARM_COUNT,
  BLEND_CHANNELS,
  type BlendChannel,
  type ChannelWeights,
  type PoseDefinition,
  type TransitionPhase,
  type TransitionSequence,
} from './types';

export type ChannelMask = Record<BlendChannel, boolean>;

/**
 * Playback state machine for pose transitions.
 *
 * It always blends from a snapshot (`from`) to a target (`to`) through a staged sequence, so
 * changing target mid-transition continues from exactly where the animal is. It also owns
 * the motion clocks (arm wave phases, bob / sway / pulse phases) as accumulated phases, so that
 * blending a wave speed never causes a phase jump.
 */
export class PoseController {
  private from: PoseDefinition = clonePose(REST_POSE);
  private to: PoseDefinition = clonePose(REST_POSE);
  private out: PoseDefinition = clonePose(REST_POSE);
  private seq: TransitionSequence = QUICK_SEQUENCE;
  private t = QUICK_SEQUENCE.duration;
  private weights: ChannelWeights = { prep: 0, arms: 1, body: 1, skin: 1, movement: 1 };
  private mask: ChannelMask = { arms: true, body: true, skin: true, movement: true };

  playing = true;
  speed = 1;
  /** Seconds of animation time elapsed (affected by speed and pause). */
  motionTime = 0;
  /** Accumulated wave clock per arm, in cycles. */
  readonly armPhase = new Float32Array(ARM_COUNT);
  /** Accumulated clocks in cycles. */
  bobPhase = 0;
  swayPhase = 0;
  pulsePhase = 0;
  /** Distance travelled along the seabed treadmill. */
  travelDistance = 0;

  get progress(): number {
    return Math.min(1, this.t / this.seq.duration);
  }

  get phase(): TransitionPhase {
    return phaseAt(this.seq, this.progress);
  }

  get sequence(): TransitionSequence {
    return this.seq;
  }

  get channelWeights(): Readonly<ChannelWeights> {
    return this.weights;
  }

  get finished(): boolean {
    return this.t >= this.seq.duration;
  }

  /** The most recently sampled pose (same object every call). */
  get current(): PoseDefinition {
    return this.out;
  }

  /**
   * Start a transition from the current blended pose to `pose` (or back to rest when null).
   * Does not snap: the first sample after this call equals the last sample before it.
   */
  setTarget(pose: PoseDefinition | null, sequence?: TransitionSequence): void {
    this.from = clonePose(this.out);
    this.to = clonePose(pose ?? REST_POSE);
    this.seq = sequence ?? (pose ? DEFAULT_SEQUENCE : QUICK_SEQUENCE);
    this.t = 0;
    this.playing = true;
  }

  /** Restart the current transition from the resting pose. */
  replay(): void {
    this.from = clonePose(REST_POSE);
    this.t = 0;
    this.playing = true;
  }

  play(): void {
    if (this.finished) return void (this.playing = true);
    this.playing = true;
  }

  pause(): void {
    this.playing = false;
  }

  /** Jump to a normalised position in the current transition. */
  seek(progress: number): void {
    this.t = Math.min(1, Math.max(0, progress)) * this.seq.duration;
  }

  setSpeed(speed: number): void {
    this.speed = Math.max(0, speed);
  }

  /** Channels set to false stay at the `from` pose (used to demonstrate mimicry components). */
  setChannelMask(mask: Partial<ChannelMask>): void {
    Object.assign(this.mask, mask);
  }

  /** Advance by dt seconds of wall time and return the blended pose. */
  update(dt: number): PoseDefinition {
    const step = this.playing ? dt * this.speed : 0;
    this.t = Math.min(this.seq.duration, this.t + step);
    this.motionTime += step;

    const w = channelWeights(this.seq, this.progress, this.weights);
    for (const c of BLEND_CHANNELS) if (!this.mask[c]) w[c] = 0;
    blendPose(this.out, this.from, this.to, w);
    this.applyPreparation(w.prep);

    // Advance motion clocks with the blended speeds.
    for (let i = 0; i < ARM_COUNT; i++) this.armPhase[i] += this.out.arms[i].waveSpeed * step;
    const m = this.out.movement;
    this.bobPhase += m.bobFreq * step;
    this.swayPhase += m.swayFreq * step;
    this.pulsePhase += m.pulseFreq * step;
    this.travelDistance += m.travel * step;
    return this.out;
  }

  /** Subtle gathering of the body before a change of posture. */
  private applyPreparation(prep: number): void {
    if (prep <= 0) return;
    for (const arm of this.out.arms) {
      arm.length *= 1 - 0.1 * prep;
      arm.coil *= 1 + 0.25 * prep;
    }
    this.out.body.height -= 0.04 * prep;
    this.out.body.mantleWidth *= 1 + 0.05 * prep;
    this.out.body.eyeRaise = Math.min(1, this.out.body.eyeRaise + 0.3 * prep);
  }

  /** Reset to the resting pose immediately (used on engine start). */
  reset(): void {
    copyPose(this.from, REST_POSE);
    copyPose(this.to, REST_POSE);
    copyPose(this.out, REST_POSE);
    this.seq = QUICK_SEQUENCE;
    this.t = this.seq.duration;
  }
}
