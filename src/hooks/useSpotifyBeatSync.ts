'use client';

import { useEffect, useRef } from 'react';

import {
  sampleTrackBass,
  type TrackAudioAnalysis,
  type TrackAudioFeatures,
} from '@/lib/trackAudioAnalysis';
import { usePlayerStore } from '@/stores/playerStore';
import type { BeatData } from '@/types/beat';
import type { SpotifyTrack } from '@/types/spotify';

const defaultFeatures = (): TrackAudioFeatures => ({
  energy: 0.5,
  tempo: 120,
  danceability: 0.5,
});

export const useSpotifyBeatSync = (track: SpotifyTrack | null, isPlaying: boolean): void => {
  const setBeatData = usePlayerStore((state) => state.setBeatData);
  const volumePercent = usePlayerStore((state) => state.volumePercent);
  const featuresRef = useRef<TrackAudioFeatures>(defaultFeatures());
  const analysisRef = useRef<TrackAudioAnalysis | null>(null);
  const lastBeatIndexRef = useRef(-1);

  useEffect(() => {
    lastBeatIndexRef.current = -1;
    analysisRef.current = null;
    featuresRef.current = defaultFeatures();

    if (!track?.id) {
      return;
    }

    let cancelled = false;

    const load = async (): Promise<void> => {
      const [featuresRes, analysisRes] = await Promise.all([
        fetch(`/api/spotify/audio-features?trackId=${encodeURIComponent(track.id)}`, { cache: 'no-store' }),
        fetch(`/api/spotify/audio-analysis?trackId=${encodeURIComponent(track.id)}`, { cache: 'no-store' }),
      ]);

      if (cancelled) {
        return;
      }

      if (featuresRes.ok) {
        const data = (await featuresRes.json()) as {
          energy?: number;
          tempo?: number;
          danceability?: number;
        };
        featuresRef.current = {
          energy: Math.max(0, Math.min(1, data.energy ?? 0.5)),
          tempo: Math.max(60, Math.min(200, data.tempo ?? 120)),
          danceability: Math.max(0, Math.min(1, data.danceability ?? 0.5)),
        };
      }

      if (analysisRes.ok) {
        const data = (await analysisRes.json()) as TrackAudioAnalysis;
        if (data.beats?.length && data.segments?.length) {
          analysisRef.current = data;
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [track?.id]);

  useEffect(() => {
    if (!track?.id || !isPlaying || volumePercent <= 0) {
      setBeatData({ isBeat: false, intensity: 0, bpm: 0, bassEnergy: 0 });
      lastBeatIndexRef.current = -1;
      return;
    }

    const tick = (): void => {
      const features = featuresRef.current;
      const progressMs = usePlayerStore.getState().getInterpolatedProgressMs();
      const vol = volumePercent / 100;

      let isNewBeat = false;
      let bassEnergy = features.energy * vol;
      let beatEnvelope = 0;
      let bpm = Math.round(features.tempo);

      const analysis = analysisRef.current;
      if (analysis) {
        const sample = sampleTrackBass(analysis, features, progressMs);
        isNewBeat = sample.beatIndex !== lastBeatIndexRef.current && sample.beatIndex >= 0;
        if (isNewBeat) {
          lastBeatIndexRef.current = sample.beatIndex;
        }

        const beat = analysis.beats[sample.beatIndex];
        const phase =
          beat && beat.duration > 0
            ? Math.max(0, Math.min(1, (progressMs / 1000 - beat.start) / beat.duration))
            : 0;

        const kickShape = isNewBeat ? 1 : Math.max(0, 1 - phase * 2.4);
        const subBassHold = Math.pow(sample.segmentLoudness, 0.85);
        beatEnvelope = kickShape * (0.55 + sample.beatConfidence * 0.45);
        bassEnergy = (sample.bassEnergy * 0.85 + subBassHold * 0.15) * vol;

        if (sample.isDownbeat && isNewBeat) {
          bassEnergy = Math.min(1, bassEnergy * 1.35);
        }

        if (beat && beat.duration > 0) {
          bpm = Math.round(60 / beat.duration);
        }
      } else {
        const msPerBeat = 60_000 / features.tempo;
        const beatIndex = Math.floor(progressMs / msPerBeat);
        isNewBeat = beatIndex !== lastBeatIndexRef.current;
        if (isNewBeat) {
          lastBeatIndexRef.current = beatIndex;
        }
        const phase = msPerBeat > 0 ? (progressMs % msPerBeat) / msPerBeat : 0;
        const isDownbeat = beatIndex % 4 === 0;
        beatEnvelope = isNewBeat ? 1 : Math.max(0, 1 - phase * 2);
        bassEnergy =
          (features.energy * 0.6 + features.danceability * 0.4) *
          vol *
          (isDownbeat && isNewBeat ? 1.25 : 1);
      }

      const intensity = Math.min(1, bassEnergy * (0.35 + beatEnvelope * 0.65));

      const beatData: BeatData = {
        isBeat: isNewBeat,
        intensity,
        bpm,
        bassEnergy,
      };
      setBeatData(beatData);
    };

    tick();
    const timer = window.setInterval(tick, 32);
    return () => window.clearInterval(timer);
  }, [isPlaying, setBeatData, track?.id, volumePercent]);
};
