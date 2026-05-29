import { NextResponse } from 'next/server';

import { getAccessToken, getUserPlaylists, SpotifyApiError } from '@/lib/spotify';

export async function GET(): Promise<NextResponse> {
  const token = getAccessToken();

  if (!token) {
    return NextResponse.json({ playlists: [] }, { status: 401 });
  }

  try {
    const playlists = await getUserPlaylists(token);
    return NextResponse.json({ playlists });
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
    return NextResponse.json({ error: 'failed_to_fetch_playlists' }, { status: 500 });
  }
}
