import { NextResponse } from 'next/server';

import { getAccessToken, getPlaylistTrackCount, getPlaylistTracks, SpotifyApiError } from '@/lib/spotify';

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
    const [tracks, playlistTotal] = await Promise.all([
      getPlaylistTracks(token, playlistId),
      getPlaylistTrackCount(token, playlistId),
    ]);
    return NextResponse.json({ tracks, playlistTotal });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      const isForbidden = error.status === 403;
      return NextResponse.json(
        {
          error: error.message,
          reason: isForbidden ? 'dev_mode_allowlist' : error.status === 401 ? 'session_expired' : 'unknown',
          needsReauth: error.status === 401,
          needsAllowlist: isForbidden,
        },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: 'failed_to_fetch_playlist_tracks' }, { status: 500 });
  }
}
