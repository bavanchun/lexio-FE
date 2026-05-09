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

  return (
    <button
      onClick={onFlip}
      className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center focus:outline-none"
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
    </button>
  );
}
