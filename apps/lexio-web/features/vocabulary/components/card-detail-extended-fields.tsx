/**
 * CardDetailExtendedFields — renders §4.2 fields added in the v2 schema.
 *
 * Extracted from card-detail-fields.tsx to keep both files under 200 LOC.
 * Renders: collocations, synonyms, antonyms, word family grid, etymology,
 * frequency rank caption.
 *
 * All fields are optional/nullable — component renders nothing when they are
 * absent, preserving backwards compatibility with legacy seed data.
 */
import { ArrowLeftRightIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { Card } from '@/core/entities/card';

interface CardDetailExtendedFieldsProps {
  card: Card;
}

/** Chip list section — label + array of string chips. */
function ChipSection({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="outline" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function CardDetailExtendedFields({ card }: CardDetailExtendedFieldsProps) {
  const hasCollocations = (card.collocations?.length ?? 0) > 0;
  const hasSynonyms = (card.synonyms?.length ?? 0) > 0;
  const hasAntonyms = (card.antonyms?.length ?? 0) > 0;
  const hasWordFamily =
    card.wordFamily != null && Object.values(card.wordFamily).some((v) => v != null && v !== '');
  const hasEtymology = !!card.etymology;

  if (!hasCollocations && !hasSynonyms && !hasAntonyms && !hasWordFamily && !hasEtymology) {
    return null;
  }

  return (
    <>
      {/* Collocations */}
      {hasCollocations && <ChipSection label="Collocations" items={card.collocations!} />}

      {/* Synonyms */}
      {hasSynonyms && <ChipSection label="Synonyms" items={card.synonyms!} />}

      {/* Antonyms — with ArrowLeftRight icon in the label */}
      {hasAntonyms && (
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <ArrowLeftRightIcon className="h-3 w-3" aria-hidden="true" />
            Antonyms
          </p>
          <div className="flex flex-wrap gap-1.5">
            {card.antonyms!.map((item) => (
              <Badge key={item} variant="outline" className="text-xs text-destructive/80">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Word family — 4-cell mini-grid (verb / noun / adj / adv) */}
      {hasWordFamily && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Word family
          </p>
          <div className="grid grid-cols-4 gap-2 rounded-md border p-2 text-center text-xs">
            {(['verb', 'noun', 'adj', 'adv'] as const).map((pos) => {
              const form = card.wordFamily?.[pos];
              return (
                <div key={pos} className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground uppercase tracking-wide">{pos}</span>
                  <span className={form ? 'font-medium' : 'text-muted-foreground/40'}>
                    {form ?? '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Etymology */}
      {hasEtymology && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Etymology
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">{card.etymology}</p>
        </div>
      )}
    </>
  );
}
