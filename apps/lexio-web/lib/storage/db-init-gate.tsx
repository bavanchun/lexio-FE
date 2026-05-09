'use client';

/**
 * DbInitGate — client component that opens Dexie and seeds data on mount.
 * Renders a lightweight loading state while seeding, then exposes children.
 *
 * Place in app/(app)/layout.tsx (phase-06) or the showcase route group layout
 * for testing the persistence layer in isolation.
 *
 * Safe under React StrictMode: seedIfFresh is idempotent (checked inside a
 * read-write transaction so concurrent double-invokes are handled correctly).
 */

import { useEffect, useState } from 'react';
import { getDb } from './database';
import { seedIfFresh } from './seed-loader';

type InitState = 'pending' | 'ready' | 'error';

interface DbInitGateProps {
  children: React.ReactNode;
  /** Optional fallback rendered while DB initialises (defaults to null). */
  loadingFallback?: React.ReactNode;
}

export function DbInitGate({ children, loadingFallback = null }: DbInitGateProps) {
  const [state, setState] = useState<InitState>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const db = getDb();
        await db.open();
        await seedIfFresh(db);
        if (!cancelled) setState('ready');
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('[DbInitGate] Failed to initialise database:', msg);
          setErrorMessage(msg);
          setState('error');
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'error') {
    return (
      <div role="alert" style={{ padding: '1rem', color: 'red' }}>
        <strong>Database error:</strong> {errorMessage}
      </div>
    );
  }

  if (state === 'pending') {
    return <>{loadingFallback}</>;
  }

  return <>{children}</>;
}
