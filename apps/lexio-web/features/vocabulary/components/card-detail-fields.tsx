/**
 * CardDetailFields — body content rendered inside the card preview drawer.
 * Extracted to keep card-preview-drawer.tsx under 200 LOC.
 *
 * Renders all available §4.2 fields from the Card entity.
 * File is split at the 200-line boundary: extended fields (IPA US/UK, collocations,
 * synonyms, antonyms, word family, etymology, frequency rank) are rendered by
 * card-detail-extended-fields.tsx and composed here.
 */
import { Volume2Icon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
// eslint-disable-next-line boundaries/dependencies
import { useAudioPlayback } from '../hooks/use-audio-playback';
import type { Card } from '@/core/entities/card';
import { CardDetailExtendedFields } from './card-detail-extended-fields';

interface AudioButtonProps {
  url: string | null;
  label: string;
}

/** Play/disabled audio button — single responsibility sub-component. */
function AudioButton({ url, label }: AudioButtonProps) {
  const { play, isPlaying } = useAudioPlayback(url);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!url}
      onClick={play}
      aria-label={label}
      className="gap-1.5"
    >
      <Volume2Icon className={`h-4 w-4 ${isPlaying ? 'text-primary' : ''}`} />
      {label}
    </Button>
  );
}

interface CardDetailFieldsProps {
  card: Card;
}

export function CardDetailFields({ card }: CardDetailFieldsProps) {
  const hasTags = card.tags.length > 0;
  const posTag = card.tags.find((t) =>
    ['noun', 'verb', 'adjective', 'adverb', 'phrase'].includes(t),
  );

  return (
    <div className="flex flex-col gap-5 px-6 py-4">
      {/* Word + POS + CEFR */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-2xl font-semibold">{card.word}</span>
        {posTag && (
          <Badge variant="secondary" className="text-xs">
            {posTag}
          </Badge>
        )}
        {card.cefrLevel && (
          <Badge variant="outline" className="text-xs font-mono">
            {card.cefrLevel}
          </Badge>
        )}
      </div>

      {/* IPA US / UK — rendered in Charis SIL via --font-ipa CSS variable */}
      {(card.ipaUs || card.ipaUk) && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Pronunciation
          </p>
          <div className="flex flex-wrap gap-4">
            {card.ipaUs && (
              <span className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">US</span>
                {/* font-ipa class maps to var(--font-ipa) = Charis SIL */}
                <span
                  className="font-ipa text-lg text-foreground"
                  aria-label={`IPA US: ${card.ipaUs}`}
                >
                  /{card.ipaUs}/
                </span>
              </span>
            )}
            {card.ipaUk && (
              <span className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">UK</span>
                <span
                  className="font-ipa text-lg text-foreground"
                  aria-label={`IPA UK: ${card.ipaUk}`}
                >
                  /{card.ipaUk}/
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Audio buttons */}
      {(card.audioWordUrl || card.audioSentenceUrl) && (
        <div className="flex flex-wrap gap-2">
          <AudioButton url={card.audioWordUrl} label="Word" />
          <AudioButton url={card.audioSentenceUrl} label="Sentence" />
        </div>
      )}
      {!card.audioWordUrl && !card.audioSentenceUrl && (
        <div className="flex flex-wrap gap-2">
          <AudioButton url={null} label="Word" />
          <AudioButton url={null} label="Sentence" />
        </div>
      )}

      {/* Definition (meaning) */}
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Meaning
        </p>
        <p className="text-sm leading-relaxed">{card.definition}</p>
      </div>

      {/* Example sentence */}
      {card.exampleSentence && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Example
          </p>
          <p className="text-sm italic leading-relaxed text-foreground">{card.exampleSentence}</p>
          {card.exampleTranslation && (
            <p className="mt-1 text-xs text-muted-foreground">{card.exampleTranslation}</p>
          )}
        </div>
      )}

      {/* Tags */}
      {hasTags && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {card.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Extended §4.2 fields: collocations, synonyms, antonyms, word family, etymology, freq rank */}
      <CardDetailExtendedFields card={card} />

      {/* Meta row */}
      <div className="flex flex-wrap gap-4 border-t pt-3">
        {card.cefrLevel && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">CEFR level</span>
            <span className="text-sm font-medium">{card.cefrLevel}</span>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Exercise types</span>
          <span className="text-sm font-medium">{card.exerciseTypes.join(', ') || '—'}</span>
        </div>
        {card.frequencyRank != null && (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Freq. rank</span>
            <span className="text-sm font-medium text-muted-foreground">#{card.frequencyRank}</span>
          </div>
        )}
      </div>
    </div>
  );
}
