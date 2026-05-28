'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { BeatDetector } from '@/lib/beat';
import { usePlayerStore } from '@/stores/playerStore';

type UseBeatDetectionResult = {
  isActive: boolean;
  audioContext: AudioContext | null;
};

export const useBeatDetection = (audioElement: RefObject<HTMLAudioElement | null>): UseBeatDetectionResult => {
  const [isActive, setIsActive] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const detectorRef = useRef<BeatDetector | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const setBeatData = usePlayerStore((state) => state.setBeatData);

  useEffect(() => {
    const el = audioElement.current;
    if (!el) {
      return;
    }

    let localContext: AudioContext | null = null;

    const start = async (): Promise<void> => {
      if (detectorRef.current || !audioElement.current) {
        return;
      }

      localContext = new AudioContext();
      await localContext.resume();
      setAudioContext(localContext);

      sourceRef.current = localContext.createMediaElementSource(audioElement.current);
      detectorRef.current = new BeatDetector(localContext, sourceRef.current);
      setIsActive(true);

      const loop = (): void => {
        if (!detectorRef.current) {
          return;
        }
        const data = detectorRef.current.detectBeat();
        setBeatData(data);
        rafRef.current = window.requestAnimationFrame(loop);
      };

      rafRef.current = window.requestAnimationFrame(loop);
    };

    const onFirstInteraction = (): void => {
      void start();
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };

    window.addEventListener('pointerdown', onFirstInteraction, { once: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      detectorRef.current?.destroy();
      detectorRef.current = null;
      sourceRef.current = null;
      if (localContext) {
        void localContext.close();
      }
      setIsActive(false);
      setAudioContext(null);
    };
  }, [audioElement, setBeatData]);

  return { isActive, audioContext };
};
