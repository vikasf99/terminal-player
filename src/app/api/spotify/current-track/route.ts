import { NextResponse } from 'next/server';

import { getAccessToken, getPlaybackSnapshot, SpotifyApiError } from '@/lib/spotify';

export async function GET(): Promise<NextResponse> {
  const token = getAccessToken();

  if (!token) {
    return NextResponse.json({ track: null, volumePercent: null }, { status: 401 });
  }

  try {
    const snapshot = await getPlaybackSnapshot(token);
    return NextResponse.json({
      track: snapshot.track,
      volumePercent: snapshot.volumePercent,
      isPlaying: snapshot.isPlaying,
      progressMs: snapshot.progressMs,
      device: snapshot.device,
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'failed_to_fetch_current_track' }, { status: 500 });
  }
}
