/**
 * /design — Visual baseline showcase (phase-02 approval gate).
 * Sections: color tokens, typography scale, UI components, heatmap, icon grid.
 * Server component — uses getTranslations() to validate next-intl wiring (phase-03).
 */
import { getTranslations } from 'next-intl/server';
import { ColorSwatchesSection } from './color-swatches-section';
import { TypographySection } from './typography-section';
import { ComponentsSection } from './components-section';
import { HeatmapIconsSection } from './heatmap-icons-section';
import { Separator } from '@/shared/components/ui/separator';
import { ThemeToggle } from '@/shared/components/theme-toggle';

export const metadata = {
  title: 'Design system — Lexio',
  description: 'Phase-02 visual baseline: color tokens, typography, UI primitives.',
};

export default async function DesignPage() {
  // Validate next-intl wiring: t('design.title') must resolve from en.json
  const t = await getTranslations('design');

  return (
    <div className="min-h-screen bg-background">
      {/* Header — title sourced from i18n to verify next-intl wiring (phase-03) */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-3">
        <div>
          <h1 className="text-base font-semibold text-foreground">{t('title')}</h1>
          <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
        </div>
        <ThemeToggle />
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 flex flex-col gap-16">
        <ColorSwatchesSection />
        <Separator />
        <TypographySection />
        <Separator />
        <ComponentsSection />
        <Separator />
        <HeatmapIconsSection />

        {/* Footer note */}
        <p className="text-xs text-muted-foreground pb-8">
          All primitives comply with §12.5 design rules: no gradients, no shadows beyond border, no
          glassmorphism, sentence case, animations ≤200 ms, Lucide only.
        </p>
      </main>
    </div>
  );
}
