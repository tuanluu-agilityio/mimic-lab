import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './appStore';

const initial = useAppStore.getState();

describe('appStore', () => {
  beforeEach(() => useAppStore.setState(initial, true));

  it('starts in the intro with a normal view and no selection', () => {
    const s = useAppStore.getState();
    expect(s.stage).toBe('intro');
    expect(s.viewMode).toBe('normal');
    expect(s.selectedStructure).toBeNull();
    expect(s.mimicryTarget).toBeNull();
    expect(s.quality).toBe('auto');
  });

  it('switches to X-Ray when an internal structure is picked from Normal view', () => {
    useAppStore.getState().selectStructure('brain');
    expect(useAppStore.getState().viewMode).toBe('xray');
    expect(useAppStore.getState().selectedStructure).toBe('brain');
  });

  it('keeps the mode when an external structure is picked', () => {
    useAppStore.getState().selectStructure('mantle');
    expect(useAppStore.getState().viewMode).toBe('normal');
  });

  it('opens the skin model for the skin structure and leaves it for another structure', () => {
    useAppStore.getState().selectStructure('skin');
    expect(useAppStore.getState().viewMode).toBe('skin');
    useAppStore.getState().selectStructure('eyes');
    expect(useAppStore.getState().viewMode).toBe('normal');
  });

  it('selecting a mimicry target starts playback from zero', () => {
    useAppStore.getState().setPlaying(false);
    useAppStore.getState().selectTarget('flatfish');
    const s = useAppStore.getState();
    expect(s.mimicryTarget).toBe('flatfish');
    expect(s.playback.playing).toBe(true);
    expect(s.playback.progress).toBe(0);
  });

  it('clamps slider values', () => {
    useAppStore.getState().setExplodeProgress(4);
    useAppStore.getState().setSectionOffset(-9);
    useAppStore.getState().setSkinActivation(2);
    const s = useAppStore.getState();
    expect(s.explodeProgress).toBe(1);
    expect(s.sectionOffset).toBe(-1);
    expect(s.skinActivation).toBe(1);
  });

  it('camera preset requests always change the nonce', () => {
    const before = useAppStore.getState().cameraPreset.nonce;
    useAppStore.getState().requestCameraPreset('top');
    useAppStore.getState().requestCameraPreset('top');
    expect(useAppStore.getState().cameraPreset.nonce).toBe(before + 2);
  });
});
