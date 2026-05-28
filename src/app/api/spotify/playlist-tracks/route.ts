import { NextResponse } from 'next/server';

import { getAccessToken, getPlaylistTracks, SpotifyApiError } from '@/lib/spotify';

export async function GET(request: Request): Promise<NextResponse> {
  const token = getAccessToken();
  const playlistId = new URL(request.url).searchParams.get('playlistId');

  if (!token) {
    return NextResponse.json({ error: 'missing_access_token' }, { status: 401 });
  }

  if (!playlistId) {
    return NextResponse.json({ error: 'missing_playlist_id' }, { status: 400 });
  }

  try {
    const tracks = await getPlaylistTracks(token, playlistId);
    return NextResponse.json({ tracks });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'failed_to_fetch_playlist_tracks' }, { status: 500 });
  }
}
