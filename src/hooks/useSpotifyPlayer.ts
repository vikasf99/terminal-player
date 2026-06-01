'use client';

import { useEffect, useRef, useState } from 'react';

import { usePlayerStore } from '@/stores/playerStore';
import type { SpotifyTrack } from '@/types/spotify';

type SpotifyPlayerState = {
  player: Spotify.Player | null;
  deviceId: string | null;
  isReady: boolean;
};

declare global {
  interface Window {
    Spotify?: {
      Player: new (options: Spotify.PlayerInit) => Spotify.Player;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

export namespace Spotify {
  export type WebPlaybackState = {
    paused: boolean;
    position: number;
    track_window: { current_track: SpotifyTrack };
  };

  export type PlayerInit = {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
  };

  export type Player = {
    connect: () => Promise<boolean>;
    disconnect: () => void;
    addListener: (event: string, cb: (payload: any) => void) => void;
  };
}

const loadSpotifySdk = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.Spotify) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    script.onerror = () => reject(new Error('failed to load spotify web playback sdk'));
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    document.body.appendChild(script);
  });

const getAccessToken = async (): Promise<string> => {
  for (let i = 0; i < 6; i += 1) {
    const response = await fetch('/api/spotify/token', { cache: 'no-store' });
    if (response.ok) {
      const data = (await response.json()) as { accessToken: string };
      return data.accessToken;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 200));
  }
  throw new Error('failed to fetch spotify access token');
};

export const useSpotifyPlayer = (): SpotifyPlayerState => {
  const playerRef = useRef<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const setTrack = usePlayerStore((state) => state.setTrack);
  const setPlayback = usePlayerStore((state) => state.setPlayback);

  useEffect(() => {
    let mounted = true;

    const init = async (): Promise<void> => {
      try {
        await loadSpotifySdk();
        if (!window.Spotify || !mounted) {
          return;
        }

        const player = new window.Spotify.Player({
        name: 'terminal-playlist',
        getOAuthToken: async (callback) => {
          try {
            callback(await getAccessToken());
          } catch (error) {
            console.warn('failed to resolve spotify token', error);
          }
        },
        volume: 0.7,
      });

      player.addListener('player_state_changed', (state: Spotify.WebPlaybackState | null) => {
        if (!state?.track_window?.current_track) {
          return;
        }
        setPlayback(!state.paused, state.position);
        const sdkTrack = state.track_window.current_track;
        setTrack({
          id: sdkTrack.id,
          name: sdkTrack.name ?? 'unknown track',
          artists: sdkTrack.artists ?? [],
          album: sdkTrack.album ?? { id: '', name: 'unknown' },
          duration_ms: sdkTrack.duration_ms ?? 0,
        });
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
        setIsReady(true);
        usePlayerStore.getState().setSdkDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.warn(`spotify player device offline: ${device_id}`);
        setIsReady(false);
      });

        await player.connect();
        playerRef.current = player;
      } catch (error) {
        console.warn('spotify player init failed', error);
      }
    };

    void init();

    return () => {
      mounted = false;
      playerRef.current?.disconnect();
      playerRef.current = null;
      setIsReady(false);
      setDeviceId(null);
      usePlayerStore.getState().setSdkDeviceId(null);
    };
  }, [setPlayback, setTrack]);

  return { player: playerRef.current, deviceId, isReady };
};
