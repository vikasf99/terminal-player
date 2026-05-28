'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { BeatDetector } from '@/lib/beat';
import { getOrCreateAudioGraph } from '@/lib/audioGraph';
import { usePlayerStore } from '@/stores/playerStore';

type UseBeatDetectionResult = {
  isActive: boolean;
  audioContext: AudioContext | null;
};

export const useBeatDetection = (audioElement: RefObject<HTMLAudioElement | null>): UseBeatDetectionResult => {
  const [isActive, setIsActive] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const detectorRef = useRef<BeatDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const setBeatData = usePlayerStore((state) => state.setBeatData);

  useEffect(() => {
    const el = audioElement.current;
    if (!el) {
      return;
    }

    const stopLoop = (): void => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const startLoop = (): void => {
      stopLoop();
      const loop = (): void => {
        if (!detectorRef.current || pausedRef.current) {
          return;
        }
        const data = detectorRef.current.detectBeat();
        setBeatData(data);
        rafRef.current = window.requestAnimationFrame(loop);
      };
      rafRef.current = window.requestAnimationFrame(loop);
    };

    const start = async (): Promise<void> => {
      if (detectorRef.current || !audioElement.current) {
        return;
      }

      try {
        const { context, source } = await getOrCreateAudioGraph(audioElement.current);
        setAudioContext(context);
        detectorRef.current = new BeatDetector(context, source);
        setIsActive(true);
        startLoop();
      } catch (error) {
        console.warn('beat detection unavailable', error);
      }
    };

    const onFirstInteraction = (): void => {
      void start();
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };

    const onVisibility = (): void => {
      pausedRef.current = document.hidden;
      if (document.hidden) {
        stopLoop();
        return;
      }
      if (detectorRef.current) {
        startLoop();
      }
    };

    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      document.removeEventListener('visibilitychange', onVisibility);
      stopLoop();
      detectorRef.current?.destroy();
      detectorRef.current = null;
      setIsActive(false);
    };
  }, [audioElement, setBeatData]);

  return { isActive, audioContext };
};
