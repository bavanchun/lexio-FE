/**
 * Typography scale section for /design showcase.
 * Shows H1–H4, body, caption, code block, and IPA sample.
 */
import { H1, H2, H3, H4, Body, Caption, Code, IPA } from '@/shared/components/typography';
import { Separator } from '@/shared/components/ui/separator';

export function TypographySection() {
  return (
    <section aria-labelledby="typography-heading">
      <h2 id="typography-heading" className="text-2xl font-semibold text-foreground mb-6">
        Typography scale
      </h2>

      <div className="flex flex-col gap-6">
        <div>
          <Caption className="mb-1 block">H1 — 32 px / weight 600</Caption>
          <H1>The quick brown fox</H1>
        </div>

        <Separator />

        <div>
          <Caption className="mb-1 block">H2 — 24 px / weight 600</Caption>
          <H2>The quick brown fox</H2>
        </div>

        <Separator />

        <div>
          <Caption className="mb-1 block">H3 — 20 px / weight 500</Caption>
          <H3>The quick brown fox</H3>
        </div>

        <Separator />

        <div>
          <Caption className="mb-1 block">H4 — 16 px / weight 500</Caption>
          <H4>The quick brown fox</H4>
        </div>

        <Separator />

        <div>
          <Caption className="mb-1 block">Body — 14 px / weight 400</Caption>
          <Body>
            Lexio uses spaced repetition to help you retain vocabulary. Review cards at the right
            moment — not too soon, not too late.
          </Body>
        </div>

        <Separator />

        <div>
          <Caption className="mb-1 block">Caption — 12 px / weight 400 / muted</Caption>
          <Caption>Last reviewed 3 days ago · 94 % retention</Caption>
        </div>

        <Separator />

        <div>
          <Caption className="mb-1 block">Code — JetBrains Mono / --font-mono</Caption>
          <Code>const greeting = &apos;こんにちは&apos;;</Code>
        </div>

        <Separator />

        <div>
          <Caption className="mb-1 block">
            IPA — Charis SIL (→ system serif fallback until phase-09)
          </Caption>
          <p className="text-foreground text-base">
            Lexio <IPA className="text-lg">/ˈleksiˌoʊ/</IPA> — vocabulary learning, reimagined.
          </p>
        </div>
      </div>
    </section>
  );
}
