'use client';

/**
 * Install prompt — listens for the browser's beforeinstallprompt event and
 * exposes a hook for triggering the native A2HS dialog.
 *
 * useInstallPrompt() is consumed by TopBar to conditionally render an
 * "Install Lexio" menu item in the avatar dropdown.
 *
 * The deferred prompt is stored in a ref so it never triggers a re-render
 * until canInstall state flips.
 */
import { useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptResult {
  /** True when the browser has a pending A2HS prompt ready to show. */
  canInstall: boolean;
  /** Trigger the native install dialog. Resolves after user choice. */
  install: () => Promise<void>;
}

export function useInstallPrompt(): InstallPromptResult {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    }

    function handleAppInstalled() {
      deferredPrompt.current = null;
      setCanInstall(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  async function install(): Promise<void> {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanInstall(false);
  }

  return { canInstall, install };
}
