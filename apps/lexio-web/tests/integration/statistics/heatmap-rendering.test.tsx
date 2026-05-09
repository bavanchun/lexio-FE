/**
 * Integration test — Heatmap component rendering.
 * Verifies: correct number of cells rendered, intensity data attributes,
 * click on cell with reviews opens HeatmapDayModal with correct data.
 *
 * next-themes and ShadCN Dialog are mocked to keep test focused on SVG output.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── next-themes mock ──────────────────────────────────────────────────────────
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

// ── ShadCN Dialog mock — renders children directly ────────────────────────────
vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

import { Heatmap } from '@/features/statistics/components/heatmap';

// ─────────────────────────────────────────────────────────────────────────────

/** Build sample data: one active day (today - 5) with 15 reviews. */
function buildSampleData(): Record<string, number> {
  const d = new Date();
  d.setDate(d.getDate() - 5);
  const iso = d.toISOString().slice(0, 10);
  return { [iso]: 15 };
}

describe('Heatmap', () => {
  it('renders exactly 53×7 = 371 cells', () => {
    render(<Heatmap data={{}} />);
    // Each cell is a <rect> with data-date attribute
    const cells = document.querySelectorAll('rect[data-date]');
    expect(cells.length).toBe(53 * 7);
  });

  it('assigns data-intensity="0" to cells with no reviews', () => {
    render(<Heatmap data={{}} />);
    const cells = document.querySelectorAll('rect[data-intensity="0"]');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('assigns correct intensity to a cell with 15 reviews (bucket 2: 11-30)', () => {
    const data = buildSampleData();
    const activeDate = Object.keys(data)[0]!;

    render(<Heatmap data={data} />);

    const cell = document.querySelector(`rect[data-date="${activeDate}"]`);
    expect(cell).not.toBeNull();
    expect(cell?.getAttribute('data-intensity')).toBe('2'); // 11-30 → bucket 2
  });

  it('opens day modal when clicking a cell with reviews', () => {
    const data = buildSampleData();
    const activeDate = Object.keys(data)[0]!;

    render(<Heatmap data={data} />);

    const cell = document.querySelector(`rect[data-date="${activeDate}"]`)!;
    fireEvent.click(cell);

    // Dialog should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Modal shows "Cards reviewed" label
    expect(screen.getByText('Cards reviewed')).toBeInTheDocument();
  });

  it('shows count "15" in the modal for the active cell', () => {
    const data = buildSampleData();
    const activeDate = Object.keys(data)[0]!;

    render(<Heatmap data={data} />);

    const cell = document.querySelector(`rect[data-date="${activeDate}"]`)!;
    fireEvent.click(cell);

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows accuracy as "—" when not available', () => {
    const data = buildSampleData();
    const activeDate = Object.keys(data)[0]!;

    render(<Heatmap data={data} />);

    const cell = document.querySelector(`rect[data-date="${activeDate}"]`)!;
    fireEvent.click(cell);

    // Accuracy and time spent both show dash
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it('renders month and day-of-week labels', () => {
    render(<Heatmap data={{}} />);
    // At minimum, some month label text nodes should exist in the SVG
    const svgTexts = document.querySelectorAll('svg text');
    expect(svgTexts.length).toBeGreaterThan(3);
  });
});
