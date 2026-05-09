'use client';

/**
 * Flashcard — container with CSS-only 3D flip animation.
 * Two absolutely-positioned faces (front/back) rotated via rotateY.
 * Animation: 200ms ease-out per design rule 13. GPU-accelerated via transform.
 * Purely presentational — receives card, isFlipped, onFlip.
 */
// eslint-disable-next-line boundaries/dependencies
import { FlashcardFront } from './flashcard-front';
// eslint-disable-next-line boundaries/dependencies
import { FlashcardBack } from './flashcard-back';
import type { Card } from '@/core/entities/card';

interface FlashcardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ card, isFlipped, onFlip }: FlashcardProps) {
  return (
    /**
     * Perspective wrapper — needed for 3D depth effect.
     * Height is fixed so the card doesn't shift when content changes.
     */
    <div className="w-full" style={{ perspective: '1200px' }}>
      <div
        className="relative w-full transition-transform duration-200 ease-out"
        style={{
          height: '420px',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          willChange: 'transform',
        }}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 rounded-xl border bg-card shadow-sm"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <FlashcardFront card={card} onFlip={onFlip} />
        </div>

        {/* Back face — rotated 180° so it faces forward when card is flipped */}
        <div
          className="absolute inset-0 rounded-xl border bg-card shadow-sm"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <FlashcardBack card={card} />
        </div>
      </div>
    </div>
  );
}
