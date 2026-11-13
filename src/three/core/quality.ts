import type { QualityLevel } from '@/types/app';

export interface QualityTier {
  pixelRatio: number;
  shadows: boolean;
  shadowMapSize: number;
  armSegments: number;
  armRadial: number;
  suckerPairs: number;
  suckerRadial: number;
  particles: number;
}

export const QUALITY_TIERS: Record<QualityLevel, QualityTier> = {
  high: { pixelRatio: 2, shadows: true, shadowMapSize: 2048, armSegments: 72, armRadial: 12, suckerPairs: 44, suckerRadial: 10, particles: 1400 },
  medium: { pixelRatio: 1.5, shadows: true, shadowMapSize: 1024, armSegments: 52, armRadial: 10, suckerPairs: 30, suckerRadial: 8, particles: 800 },
  low: { pixelRatio: 1, shadows: false, shadowMapSize: 512, armSegments: 36, armRadial: 7, suckerPairs: 18, suckerRadial: 6, particles: 350 },
};

const ORDER: QualityLevel[] = ['low', 'medium', 'high'];

/** Initial guess from the device, before any frame has been measured. */
export function initialQuality(nav: { hardwareConcurrency?: number; maxTouchPoints?: number }, width: number): QualityLevel {
  const cores = nav.hardwareConcurrency ?? 4;
  const touch = (nav.maxTouchPoints ?? 0) > 0;
  if (cores <= 4 && touch) return 'low';
  if (touch || width < 900 || cores <= 4) return 'medium';
  return 'high';
}

/**
 * Watches frame times and recommends stepping the quality tier down when the frame rate
 * stays under `low` fps, or up when it stays above `high` fps, for a sustained period.
 */
export class FrameMonitor {
  fps = 60;
  private accum = 0;
  private frames = 0;
  private lowWindows = 0;
  private highWindows = 0;
  private cooldown = 0;

  constructor(
    private readonly windowSeconds = 1,
    private readonly low = 30,
    private readonly high = 55,
    private readonly windowsToStepDown = 3,
    private readonly windowsToStepUp = 8,
  ) {}

  /** Feed one frame. Returns -1 / +1 when a tier change is recommended, else 0. */
  sample(dt: number): -1 | 0 | 1 {
    // Ignore long stalls (tab switches, shader compiles).
    if (dt > 0.5) return 0;
    this.accum += dt;
    this.frames++;
    if (this.accum < this.windowSeconds) return 0;
    this.fps = this.frames / this.accum;
    this.accum = 0;
    this.frames = 0;
    if (this.cooldown > 0) {
      this.cooldown--;
      return 0;
    }
    if (this.fps < this.low) {
      this.lowWindows++;
      this.highWindows = 0;
    } else if (this.fps > this.high) {
      this.highWindows++;
      this.lowWindows = 0;
    } else {
      this.lowWindows = 0;
      this.highWindows = 0;
    }
    if (this.lowWindows >= this.windowsToStepDown) {
      this.lowWindows = 0;
      this.cooldown = 3;
      return -1;
    }
    if (this.highWindows >= this.windowsToStepUp) {
      this.highWindows = 0;
      this.cooldown = 3;
      return 1;
    }
    return 0;
  }
}

export function stepQuality(level: QualityLevel, direction: -1 | 1): QualityLevel {
  const i = ORDER.indexOf(level);
  return ORDER[Math.min(ORDER.length - 1, Math.max(0, i + direction))];
}
