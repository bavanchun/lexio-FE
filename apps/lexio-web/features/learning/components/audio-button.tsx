'use client';

/**
 * AudioButton — plays word audio via HTMLAudioElement, falls back to
 * Web Speech API if no URL provided. Hidden if neither source is available.
 */
import { useCallback, useRef, useState } from 'react';
import { Volume2Icon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface AudioButtonProps {
  /** Audio URL — null triggers Web Speech API fallback. */
  url: string | null;
  /** Word to speak via Web Speech API when url is null. */
  word: string;
  className?: string;
}

function hasSpeechSynthesis(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function AudioButton({ url, word, className }: AudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const canPlay = Boolean(url) || hasSpeechSynthesis();

  const play = useCallback(() => {
    if (!canPlay) return;

    if (url) {
      // Stop any current playback
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.addEventListener('playing', () => setIsPlaying(true));
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('error', () => setIsPlaying(false));
      audio.play().catch(() => setIsPlaying(false));
      return;
    }

    // Web Speech API fallback
    if (hasSpeechSynthesis()) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(word);
      utt.lang = 'en-US';
      utt.onstart = () => setIsPlaying(true);
      utt.onend = () => setIsPlaying(false);
      utt.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utt);
    }
  }, [url, word, canPlay]);

  if (!canPlay) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={play}
      aria-label={`Play pronunciation of ${word}`}
      className={className}
    >
      <Volume2Icon className={`h-5 w-5 ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`} />
    </Button>
  );
}
