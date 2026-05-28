import { NextResponse } from 'next/server';

import { getAccessToken, getCurrentTrack, SpotifyApiError } from '@/lib/spotify';

export async function GET(): Promise<NextResponse> {
  const token = getAccessToken();

  if (!token) {
    return NextResponse.json({ track: null }, { status: 401 });
  }

  try {
    const track = await getCurrentTrack(token);
    return NextResponse.json({ track });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'failed_to_fetch_current_track' }, { status: 500 });
  }
}
