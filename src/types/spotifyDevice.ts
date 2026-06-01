export type SpotifyConnectDevice = {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  is_restricted: boolean;
  volume_percent: number | null;
};

export type ActivePlaybackDevice = {
  id: string;
  name: string;
  type: string;
};
