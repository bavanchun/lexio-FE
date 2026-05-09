'use client';

/**
 * Theme toggle button — Sun (light) / Moon (dark).
 * Uses ShadCN Button variant=ghost. Sentence case label per §12.5 rule 11.
 * Lucide only, strokeWidth=1.5 per §12.7.2.
 */
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <Sun className="h-5 w-5" strokeWidth={1.5} />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={1.5} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
