import { usePlayerStore } from '@/stores/playerStore';

export type SpotifyControlAction =
  | 'play'
  | 'pause'
  | 'next'
  | 'previous'
  | 'shuffle'
  | 'repeat'
  | 'volume'
  | 'seek'
  | 'play_track';

type SendControlOptions = {
  action: SpotifyControlAction;
  value?: string | number | boolean;
  contextUri?: string;
  offset?: number;
  deviceId?: string | null;
};

export const resolvePlaybackDeviceId = (deviceId?: string | null): string | undefined => {
  const resolved = deviceId ?? usePlayerStore.getState().playbackDeviceId;
  return resolved ?? undefined;
};

export const sendSpotifyControl = async ({
  action,
  value,
  contextUri,
  offset,
  deviceId,
}: SendControlOptions): Promise<boolean> => {
  const response = await fetch('/api/spotify/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      value,
      contextUri,
      offset,
      deviceId: resolvePlaybackDeviceId(deviceId),
    }),
  });
  return response.ok;
};

export const transferPlayback = async (deviceId: string, play = true): Promise<boolean> => {
  const response = await fetch('/api/spotify/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, play }),
  });
  return response.ok;
};
