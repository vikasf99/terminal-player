import { NextResponse } from 'next/server';

import { getAccessToken, getAudioFeatures, SpotifyApiError } from '@/lib/spotify';

export async function GET(request: Request): Promise<NextResponse> {
  const token = getAccessToken();
  const requestUrl = new URL(request.url);
  const trackId = requestUrl.searchParams.get('trackId');

  if (!token) {
    return NextResponse.json({ error: 'missing_access_token' }, { status: 401 });
  }

  if (!trackId) {
    return NextResponse.json({ error: 'missing_track_id' }, { status: 400 });
  }

  try {
    const features = await getAudioFeatures(token, trackId);
    return NextResponse.json({
      tempo: features.tempo,
      energy: features.energy,
      danceability: features.danceability,
      valence: features.valence,
    });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'failed_to_fetch_audio_features' }, { status: 500 });
  }
}
