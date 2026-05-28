'use client';

import { useEffect, useRef, useState } from 'react';

type AudioFeaturesState = {
  tempo: number | null;
  energy: number | null;
  danceability: number | null;
  isLoading: boolean;
};

type AudioFeatureResponse = {
  tempo: number;
  energy: number;
  danceability: number;
};

export const useAudioFeatures = (trackId: string | null | undefined): AudioFeaturesState => {
  const cacheRef = useRef<Map<string, AudioFeatureResponse>>(new Map());
  const [tempo, setTempo] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [danceability, setDanceability] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!trackId) {
      setTempo(null);
      setEnergy(null);
      setDanceability(null);
      setIsLoading(false);
      return;
    }

    const cached = cacheRef.current.get(trackId);
    if (cached) {
      setTempo(cached.tempo);
      setEnergy(cached.energy);
      setDanceability(cached.danceability);
      setIsLoading(false);
      return;
    }

    let active = true;

    const run = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/spotify/audio-features?trackId=${encodeURIComponent(trackId)}`);
        if (!response.ok) {
          throw new Error(`failed to fetch audio features (${response.status})`);
        }

        const data = (await response.json()) as AudioFeatureResponse;
        cacheRef.current.set(trackId, data);

        if (!active) {
          return;
        }

        setTempo(data.tempo);
        setEnergy(data.energy);
        setDanceability(data.danceability);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [trackId]);

  return { tempo, energy, danceability, isLoading };
};
