import type { CSSProperties } from 'react';
import ui from './ui.module.css';

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange(value: number): void;
  /** Text shown for the current value. */
  format?(value: number): string;
  testId?: string;
}

export function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange, format, testId }: Props) {
  const fill = ((value - min) / (max - min)) * 100;
  const text = format ? format(value) : `${Math.round(fill)}%`;
  return (
    <label className={ui.sliderRow}>
      <span className={ui.fieldLabel}>{label}</span>
      <span className={ui.sliderValue} aria-hidden="true">
        {text}
      </span>
      <input
        className={ui.slider}
        style={{ '--fill': `${fill}%` } as CSSProperties}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={text}
        data-testid={testId}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
