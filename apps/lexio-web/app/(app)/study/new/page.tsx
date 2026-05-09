'use client';

/**
 * /study/new — reads deckId from searchParams, immediately renders the
 * StudySession component (which calls startSession on mount and loads queue).
 * Keeping this client-side avoids a round-trip redirect and lets the Zustand
 * store load naturally.
 */
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { StudySession } from '@/features/learning/components/study-session';

export default function StudyNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deckId = searchParams.get('deckId');

  // Guard: if no deckId, redirect to decks list
  useEffect(() => {
    if (!deckId) {
      router.replace('/decks');
    }
  }, [deckId, router]);

  if (!deckId) return null;

  return (
    <div className="mx-auto w-full max-w-xl">
      <StudySession deckId={deckId} />
    </div>
  );
}
