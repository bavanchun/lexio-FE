'use client';

/**
 * CardsTable — lists deck cards in a ShadCN-styled table.
 * Columns: Word | POS | CEFR | IPA | Meaning | Actions
 * Click row → opens CardPreviewDrawer.
 * Meaning column truncates; full text available in drawer.
 */
import { useState } from 'react';
import { BookOpenIcon } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
// eslint-disable-next-line boundaries/dependencies
import { CardPreviewDrawer } from './card-preview-drawer';
import type { Card } from '@/core/entities/card';

interface CardsTableProps {
  cards: Card[];
  isLoading?: boolean;
}

/** Extracts part-of-speech tag from card.tags list. */
function getPosTag(tags: string[]): string | null {
  const posTags = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'preposition', 'conjunction'];
  return tags.find((t) => posTags.includes(t.toLowerCase())) ?? null;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
      <BookOpenIcon className="h-6 w-6" />
      <p className="text-sm">No cards in this deck yet.</p>
    </div>
  );
}

export function CardsTable({ cards, isLoading }: CardsTableProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  if (isLoading) return <LoadingSkeleton />;
  if (!cards.length) return <EmptyState />;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Word</TableHead>
            <TableHead className="w-[80px]">POS</TableHead>
            <TableHead className="w-[70px]">CEFR</TableHead>
            <TableHead className="w-[160px]">IPA</TableHead>
            <TableHead>Meaning</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => {
            const pos = getPosTag(card.tags);
            return (
              <TableRow
                key={card.id}
                className="cursor-pointer"
                onClick={() => setSelectedCard(card)}
                aria-label={`Preview card: ${card.word}`}
              >
                <TableCell className="font-medium">{card.word}</TableCell>
                <TableCell>
                  {pos ? (
                    <Badge variant="secondary" className="text-xs">
                      {pos}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {card.cefrLevel ? (
                    <Badge variant="outline" className="text-xs font-mono">
                      {card.cefrLevel}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {card.ipa ? (
                    /* font-ipa maps to var(--font-ipa) = Charis SIL */
                    <span className="font-ipa text-sm" title={card.ipa}>
                      /{card.ipa}/
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell
                  className="max-w-[200px] truncate text-muted-foreground"
                  title={card.definition}
                >
                  {card.definition}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <CardPreviewDrawer
        card={selectedCard}
        open={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
      />
    </>
  );
}
