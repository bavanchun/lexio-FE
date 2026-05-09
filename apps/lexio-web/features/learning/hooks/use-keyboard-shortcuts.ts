'use client';

/**
 * useKeyboardShortcuts — document-level keydown handler for study session.
 * Space = flip card, 1–4 = rate (only when flipped), Escape = exit.
 * Disabled when an input/textarea is focused to avoid conflicts.
 */
import { useEffect } from 'react';
import type { Rating } from '@/core/entities/review';

interface KeyboardShortcutsConfig {
  isFlipped: boolean;
  isDisabled: boolean; // true while submitting or session not active
  onFlip: () => void;
  onRate: (rating: Rating) => void;
  onExit: () => void;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
}

export function useKeyboardShortcuts({
  isFlipped,
  isDisabled,
  onFlip,
  onRate,
  onExit,
}: KeyboardShortcutsConfig): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Never intercept when typing in an input
      if (isInputFocused()) return;
      // Never intercept modifier combos (Ctrl+R reload, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case ' ':
          e.preventDefault(); // prevent page scroll
          if (!isDisabled && !isFlipped) onFlip();
          break;
        case '1':
          if (!isDisabled && isFlipped) {
            e.preventDefault();
            onRate(1);
          }
          break;
        case '2':
          if (!isDisabled && isFlipped) {
            e.preventDefault();
            onRate(2);
          }
          break;
        case '3':
          if (!isDisabled && isFlipped) {
            e.preventDefault();
            onRate(3);
          }
          break;
        case '4':
          if (!isDisabled && isFlipped) {
            e.preventDefault();
            onRate(4);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isDisabled, onFlip, onRate, onExit]);
}
