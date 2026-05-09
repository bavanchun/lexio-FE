/**
 * Color swatches section for /design showcase.
 * Renders all §12.4 design tokens with hex labels.
 */

type Swatch = { label: string; className: string; hex: string };

const lightTokens: Swatch[] = [
  { label: 'background', className: 'bg-background', hex: '#FFFFFF' },
  { label: 'foreground', className: 'bg-foreground', hex: '#09090B' },
  { label: 'card', className: 'bg-card', hex: '#FFFFFF' },
  { label: 'popover', className: 'bg-popover', hex: '#FFFFFF' },
  { label: 'primary', className: 'bg-primary', hex: '#4F46E5 / #818CF8' },
  { label: 'secondary', className: 'bg-secondary', hex: '#F4F4F5 / #27272A' },
  { label: 'muted', className: 'bg-muted', hex: '#F4F4F5 / #27272A' },
  { label: 'accent', className: 'bg-accent', hex: '#F4F4F5 / #27272A' },
  { label: 'destructive', className: 'bg-destructive', hex: '#EF4444 / #7F1D1D' },
  { label: 'border', className: 'bg-border', hex: '#E4E4E7 / #27272A' },
  { label: 'input', className: 'bg-input', hex: '#E4E4E7 / #27272A' },
  { label: 'ring', className: 'bg-ring', hex: '#4F46E5 / #818CF8' },
];

const semanticTokens: Swatch[] = [
  { label: 'success', className: 'bg-success', hex: '#10B981' },
  { label: 'warning', className: 'bg-warning', hex: '#F59E0B' },
  { label: 'danger', className: 'bg-danger', hex: '#EF4444' },
  { label: 'info', className: 'bg-info', hex: '#0EA5E9' },
];

function SwatchCard({ label, className, hex }: Swatch) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`${className} h-12 w-full rounded border border-border`} aria-label={label} />
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground font-mono">{hex}</p>
    </div>
  );
}

export function ColorSwatchesSection() {
  return (
    <section aria-labelledby="colors-heading">
      <h2 id="colors-heading" className="text-2xl font-semibold text-foreground mb-6">
        Color tokens
      </h2>

      <h3 className="text-base font-medium text-foreground mb-3">Semantic (light / dark)</h3>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 mb-8">
        {lightTokens.map((s) => (
          <SwatchCard key={s.label} {...s} />
        ))}
      </div>

      <h3 className="text-base font-medium text-foreground mb-3">Status colors</h3>
      <div className="grid grid-cols-4 gap-4">
        {semanticTokens.map((s) => (
          <SwatchCard key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
