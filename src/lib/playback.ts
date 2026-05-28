export const playPlaylistTrack = async (options: {
  playlistId: string;
  offset: number;
  deviceId?: string | null;
}): Promise<boolean> => {
  const response = await fetch('/api/spotify/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'play_track',
      contextUri: toPlaylistUri(options.playlistId),
      offset: options.offset,
      deviceId: options.deviceId ?? undefined,
    }),
  });
  return response.ok;
};

export const toTrackUri = (trackId: string): string => `spotify:track:${trackId}`;

export const toPlaylistUri = (playlistId: string): string => `spotify:playlist:${playlistId}`;
