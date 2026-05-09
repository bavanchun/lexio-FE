/**
 * Typography primitives — doc §12.3 + §12.5 rules 6, 12
 *
 * - Body text uses only --foreground or --muted-foreground (never indigo)
 * - Two font weights: 400 (body/caption) + 500/600 (headings)
 * - IPA spans rendered in --font-ipa (Charis SIL → system serif fallback)
 */
import { cn } from '@/shared/lib/utils';
import type { HTMLAttributes } from 'react';

type ProseProps = HTMLAttributes<HTMLElement> & { className?: string };

/** H1 — 32px / weight 600 */
export function H1({ className, children, ...props }: ProseProps) {
  return (
    <h1
      className={cn(
        'text-3xl font-semibold leading-tight tracking-tight text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

/** H2 — 24px / weight 600 */
export function H2({ className, children, ...props }: ProseProps) {
  return (
    <h2
      className={cn(
        'text-2xl font-semibold leading-tight tracking-tight text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

/** H3 — 20px / weight 500 */
export function H3({ className, children, ...props }: ProseProps) {
  return (
    <h3 className={cn('text-xl font-medium leading-snug text-foreground', className)} {...props}>
      {children}
    </h3>
  );
}

/** H4 — 16px / weight 500 */
export function H4({ className, children, ...props }: ProseProps) {
  return (
    <h4 className={cn('text-base font-medium leading-snug text-foreground', className)} {...props}>
      {children}
    </h4>
  );
}

/** Body — 14-16px / weight 400. Use text-muted-foreground via className if subdued. */
export function Body({ className, children, ...props }: ProseProps) {
  return (
    <p className={cn('text-sm leading-relaxed text-foreground', className)} {...props}>
      {children}
    </p>
  );
}

/** Caption — 12-13px / weight 400, muted */
export function Caption({ className, children, ...props }: ProseProps) {
  return (
    <span className={cn('text-xs leading-normal text-muted-foreground', className)} {...props}>
      {children}
    </span>
  );
}

/** Inline code — JetBrains Mono via --font-mono */
export function Code({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        'font-mono rounded px-1 py-0.5 text-sm bg-muted text-foreground border border-border',
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

/**
 * IPA notation — rendered in Charis SIL (--font-ipa → system serif fallback).
 * Usage: <IPA>/ˈleksiˌoʊ/</IPA>
 */
export function IPA({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <span
      className={cn('text-foreground', className)}
      style={{ fontFamily: 'var(--font-ipa, serif)', fontStyle: 'normal' }}
      {...props}
    >
      {children}
    </span>
  );
}
