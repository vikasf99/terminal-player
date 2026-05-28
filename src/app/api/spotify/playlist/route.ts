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
      return NextResponse.json(
        {
          error: error.message,
          needsReauth: error.status === 403,
        },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: 'failed_to_fetch_playlists' }, { status: 500 });
  }
}
