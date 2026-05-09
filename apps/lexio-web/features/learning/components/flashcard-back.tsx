'use client';

/**
 * FlashcardBack — back face of the flashcard.
 * Displays: definition (primary), example (italic), tags as chips.
 * aria-live="polite" so screen readers announce when back is revealed.
 */
import { Badge } from '@/shared/components/ui/badge';
import type { Card } from '@/core/entities/card';

interface FlashcardBackProps {
  card: Card;
}

export function FlashcardBack({ card }: FlashcardBackProps) {
  // Filter out POS tags — show only non-POS tags as chips
  const posTags = new Set(['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom']);
  const chipTags = card.tags.filter((t) => !posTags.has(t));

  return (
    <div
      className="flex h-full w-full flex-col justify-center gap-5 p-8 overflow-y-auto"
      aria-live="polite"
      aria-label="Card answer"
    >
      {/* Word reminder at top */}
      <p className="text-sm font-medium text-muted-foreground text-center">{card.word}</p>

      {/* Primary definition */}
      <div className="text-center">
        <p className="text-2xl font-medium leading-snug">{card.definition}</p>
      </div>

      {/* Example sentence */}
      {card.exampleSentence && (
        <div className="border-l-2 border-muted pl-4">
          <p className="text-sm italic text-foreground leading-relaxed">{card.exampleSentence}</p>
          {card.exampleTranslation && (
            <p className="mt-1 text-xs text-muted-foreground">{card.exampleTranslation}</p>
          )}
        </div>
      )}

      {/* Tag chips (collocations, domain tags, etc.) */}
      {chipTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {chipTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* CEFR badge */}
      {card.cefrLevel && (
        <div className="flex justify-center">
          <Badge variant="outline" className="font-mono text-xs">
            {card.cefrLevel}
          </Badge>
        </div>
      )}
    </div>
  );
}
