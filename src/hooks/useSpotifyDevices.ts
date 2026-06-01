'use client';

import { useCallback, useEffect, useState } from 'react';

import type { SpotifyConnectDevice } from '@/types/spotifyDevice';

type DevicesState = {
  devices: SpotifyConnectDevice[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export const useSpotifyDevices = (): DevicesState => {
  const [devices, setDevices] = useState<SpotifyConnectDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/spotify/devices', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`failed to load devices (${response.status})`);
      }
      const data = (await response.json()) as { devices?: SpotifyConnectDevice[] };
      setDevices(data.devices ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown error');
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { devices, isLoading, error, refresh: () => void load() };
};
