'use client';

/**
 * useAudioPlayback — plays a single audio URL via HTMLAudioElement.
 * Returns { play, isPlaying }. Cleans up audio on unmount.
 *
 * Edge cases:
 *   - url is null → play() is a no-op, isPlaying stays false.
 *   - audio ends → isPlaying resets to false automatically.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioPlaybackResult {
  play: () => void;
  isPlaying: boolean;
}

export function useAudioPlayback(url: string | null): AudioPlaybackResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup audio element when url changes or component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [url]);

  const play = useCallback(() => {
    if (!url) return;

    // If already playing the same audio, stop it
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
  }, [url]);

  return { play, isPlaying };
}
