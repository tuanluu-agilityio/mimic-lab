import { useEffect, useMemo, useRef } from 'react';
import { ANATOMY_STRUCTURES } from '@/data/anatomy/structures';
import { SKIN_LAYERS_INFO } from '@/data/skin/layers';
import { useEngine } from '@/hooks/useEngine';
import { useAppStore } from '@/stores/appStore';
import type { SkinLayer, ViewMode } from '@/types/app';
import styles from './Hotspots.module.css';

interface Spot {
  anchor: string;
  label: string;
  selected: boolean;
  select(): void;
}

const NEURAL_IDS = new Set(['brain', 'optic-lobes', 'nervous-system', 'eyes']);

function structureVisible(mode: ViewMode, group: 'external' | 'internal', id: string, selected: string | null): boolean {
  switch (mode) {
    case 'normal':
      return group === 'external';
    case 'xray':
    case 'section':
    case 'exploded':
      return group === 'internal' || id === selected;
    case 'neural':
      return NEURAL_IDS.has(id);
    case 'isolated':
      return id === selected;
    default:
      return false;
  }
}

/**
 * Clickable labels pinned to 3D anchor points. The engine projects each anchor every frame;
 * positions are written straight to the DOM so React does not re-render per frame.
 */
export function Hotspots() {
  const engine = useEngine();
  const active = useAppStore((s) => s.stage === 'anatomy');
  const mode = useAppStore((s) => s.viewMode);
  const selected = useAppStore((s) => s.selectedStructure);
  const skinLayer = useAppStore((s) => s.skinLayer);
  const layerRef = useRef<HTMLDivElement>(null);

  const spots = useMemo<Spot[]>(() => {
    const act = useAppStore.getState();
    if (mode === 'skin') {
      return SKIN_LAYERS_INFO.map((layer) => ({
        anchor: `skin:${layer.id}`,
        label: layer.name,
        selected: skinLayer === layer.id,
        select: () => act.setSkinLayer(skinLayer === layer.id ? 'all' : (layer.id as SkinLayer)),
      }));
    }
    return ANATOMY_STRUCTURES.filter((s) => structureVisible(mode, s.group, s.id, selected)).map((s) => ({
      anchor: s.anchor,
      label: s.name,
      selected: selected === s.id,
      select: () => act.selectStructure(selected === s.id ? null : s.id),
    }));
  }, [mode, selected, skinLayer]);

  useEffect(() => {
    const layer = layerRef.current;
    if (!engine || !layer || !active) return;
    const point = { x: 0, y: 0, visible: false };
    const update = () => {
      const area = document.querySelector<HTMLElement>('#stage-anatomy [data-viewport="main"]')?.getBoundingClientRect();
      const nodes = layer.children;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i] as HTMLElement;
        engine.getAnchorScreen(node.dataset.anchor ?? '', point);
        const inside = !area || (point.x > area.left + 8 && point.x < area.right - 8 && point.y > area.top + 8 && point.y < area.bottom - 8);
        const show = point.visible && inside;
        node.style.visibility = show ? 'visible' : 'hidden';
        if (show) node.style.transform = `translate(${Math.round(point.x)}px, ${Math.round(point.y)}px)`;
      }
    };
    update();
    return engine.onFrame(update);
  }, [engine, active, spots]);

  if (!engine || !active) return null;
  return (
    <div ref={layerRef} className={styles.layer} data-testid="hotspots">
      {spots.map((spot) => (
        <button
          key={spot.anchor}
          type="button"
          className={styles.spot}
          data-anchor={spot.anchor}
          data-testid={`hotspot-${spot.anchor}`}
          aria-pressed={spot.selected}
          style={{ visibility: 'hidden' }}
          onClick={spot.select}
        >
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.label}>{spot.label}</span>
        </button>
      ))}
    </div>
  );
}
