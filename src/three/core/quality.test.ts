import { describe, expect, it } from 'vitest';
import { FrameMonitor, initialQuality, stepQuality } from './quality';

const feed = (m: FrameMonitor, fps: number, seconds: number) => {
  const results: number[] = [];
  const dt = 1 / fps;
  for (let t = 0; t < seconds; t += dt) results.push(m.sample(dt));
  return results;
};

describe('FrameMonitor', () => {
  it('recommends stepping down after a sustained low frame rate', () => {
    const m = new FrameMonitor();
    expect(feed(m, 20, 5)).toContain(-1);
  });

  it('does not react to a short dip', () => {
    const m = new FrameMonitor();
    const r = [...feed(m, 20, 1.2), ...feed(m, 45, 4)];
    expect(r).not.toContain(-1);
  });

  it('recommends stepping up only after a long stable period', () => {
    const m = new FrameMonitor();
    expect(feed(m, 60, 4)).not.toContain(1);
    expect(feed(m, 60, 8)).toContain(1);
  });

  it('ignores stalls', () => {
    const m = new FrameMonitor();
    for (let i = 0; i < 10; i++) expect(m.sample(2)).toBe(0);
  });
});

describe('quality helpers', () => {
  it('clamps tier steps', () => {
    expect(stepQuality('low', -1)).toBe('low');
    expect(stepQuality('low', 1)).toBe('medium');
    expect(stepQuality('high', 1)).toBe('high');
  });

  it('starts lower on small touch devices', () => {
    expect(initialQuality({ hardwareConcurrency: 4, maxTouchPoints: 5 }, 400)).toBe('low');
    expect(initialQuality({ hardwareConcurrency: 8, maxTouchPoints: 5 }, 400)).toBe('medium');
    expect(initialQuality({ hardwareConcurrency: 12, maxTouchPoints: 0 }, 1440)).toBe('high');
  });
});
