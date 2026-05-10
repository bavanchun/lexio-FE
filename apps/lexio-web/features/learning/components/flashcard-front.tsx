'use client';

/**
 * FlashcardFront — front face of the flashcard.
 * Displays: word (Inter 500 32px), IPA (Charis SIL), POS badge, audio button.
 */
import { Badge } from '@/shared/components/ui/badge';
// eslint-disable-next-line boundaries/dependencies
import { AudioButton } from './audio-button';
import type { Card } from '@/core/entities/card';

interface FlashcardFrontProps {
  card: Card;
  onFlip: () => void;
}

export function FlashcardFront({ card, onFlip }: FlashcardFrontProps) {
  const posTag = card.tags.find((t) =>
    ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom'].includes(t),
  );

  // Outer is a div with button semantics, not a <button>, because it contains
  // an <AudioButton> — nested <button> is invalid HTML and triggers React
  // hydration warnings. Keyboard activation (Enter/Space) is handled below;
  // global Space-to-flip is also bound in useKeyboardShortcuts.
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      onKeyDown={handleKeyDown}
      className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Tap to reveal answer"
    >
      {/* Word */}
      <div className="flex items-center gap-2">
        <span className="text-4xl font-medium tracking-tight">{card.word}</span>
        {posTag && (
          <Badge variant="secondary" className="text-xs capitalize">
            {posTag}
          </Badge>
        )}
      </div>

      {/* IPA — Charis SIL via font-ipa CSS variable */}
      {card.ipa && (
        <span
          className="font-ipa text-xl text-muted-foreground"
          aria-label={`Pronunciation: ${card.ipa}`}
        >
          /{card.ipa}/
        </span>
      )}

      {/* Audio — stops event bubbling so click doesn't flip the card */}
      <div onClick={(e) => e.stopPropagation()}>
        <AudioButton url={card.audioWordUrl} word={card.word} />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">Press Space or tap to reveal</p>
    </div>
  );
}
