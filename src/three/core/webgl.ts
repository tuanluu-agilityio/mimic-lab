/** True when a WebGL2 (or WebGL1) context can be created. `?nowebgl=1` forces false for testing the fallback. */
export function isWebGLAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    if (new URLSearchParams(window.location.search).has('nowebgl')) return false;
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
