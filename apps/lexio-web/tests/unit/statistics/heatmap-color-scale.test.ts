/**
 * Unit tests — heatmap-color-scale.ts
 * Verifies bucket assignment and hex color output for all 5 intensity levels.
 */
import { describe, it, expect } from 'vitest';
import {
  getIntensityBucket,
  heatmapColor,
  heatmapIntensity,
} from '@/features/statistics/lib/heatmap-color-scale';

// eslint-disable-next-line boundaries/dependencies
describe('getIntensityBucket', () => {
  it('returns 0 for count=0', () => {
    expect(getIntensityBucket(0)).toBe(0);
  });

  it('returns 1 for count=1', () => {
    expect(getIntensityBucket(1)).toBe(1);
  });

  it('returns 1 for count=10', () => {
    expect(getIntensityBucket(10)).toBe(1);
  });

  it('returns 2 for count=11', () => {
    expect(getIntensityBucket(11)).toBe(2);
  });

  it('returns 2 for count=30', () => {
    expect(getIntensityBucket(30)).toBe(2);
  });

  it('returns 3 for count=31', () => {
    expect(getIntensityBucket(31)).toBe(3);
  });

  it('returns 3 for count=100', () => {
    expect(getIntensityBucket(100)).toBe(3);
  });

  it('returns 4 for count=101', () => {
    expect(getIntensityBucket(101)).toBe(4);
  });

  it('returns 4 for large counts', () => {
    expect(getIntensityBucket(9999)).toBe(4);
  });
});

describe('heatmapColor', () => {
  it('returns zinc-200 hex for 0 reviews in light mode', () => {
    expect(heatmapColor(0, 'light')).toBe('#e4e4e7');
  });

  it('returns zinc-800 hex for 0 reviews in dark mode', () => {
    expect(heatmapColor(0, 'dark')).toBe('#27272a');
  });

  it('returns indigo-200 hex for 5 reviews in light mode', () => {
    expect(heatmapColor(5, 'light')).toBe('#c7d2fe');
  });

  it('returns indigo-900 hex for 5 reviews in dark mode', () => {
    expect(heatmapColor(5, 'dark')).toBe('#312e81');
  });

  it('returns different hex for each bucket in light mode', () => {
    const counts = [0, 5, 20, 50, 200];
    const colors = counts.map((c) => heatmapColor(c, 'light'));
    const unique = new Set(colors);
    expect(unique.size).toBe(5);
  });

  it('returns different hex for each bucket in dark mode', () => {
    const counts = [0, 5, 20, 50, 200];
    const colors = counts.map((c) => heatmapColor(c, 'dark'));
    const unique = new Set(colors);
    expect(unique.size).toBe(5);
  });
});

describe('heatmapIntensity', () => {
  it('returns string "0" for zero count', () => {
    expect(heatmapIntensity(0)).toBe('0');
  });

  it('returns string "4" for high count', () => {
    expect(heatmapIntensity(500)).toBe('4');
  });

  it('returns string bucket number for boundary values', () => {
    expect(heatmapIntensity(10)).toBe('1');
    expect(heatmapIntensity(11)).toBe('2');
    expect(heatmapIntensity(100)).toBe('3');
    expect(heatmapIntensity(101)).toBe('4');
  });
});
