'use client';

/**
 * CardPreviewDrawer — right-side Sheet showing full card details.
 * Controlled externally via open/onClose props.
 */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet';
// eslint-disable-next-line boundaries/dependencies
import { CardDetailFields } from './card-detail-fields';
import type { Card } from '@/core/entities/card';

interface CardPreviewDrawerProps {
  card: Card | null;
  open: boolean;
  onClose: () => void;
}

export function CardPreviewDrawer({ card, open, onClose }: CardPreviewDrawerProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent side="right" className="w-full max-w-[500px] overflow-y-auto p-0">
        <SheetHeader>
          <SheetTitle>{card?.word ?? 'Card preview'}</SheetTitle>
          <SheetDescription>
            {card?.cefrLevel ? `${card.cefrLevel} · ` : ''}
            {card ? 'Full card details' : 'Select a card to preview'}
          </SheetDescription>
        </SheetHeader>
        {card && <CardDetailFields card={card} />}
      </SheetContent>
    </Sheet>
  );
}
