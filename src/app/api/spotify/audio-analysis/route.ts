import { NextResponse } from 'next/server';

import { getAccessToken, SpotifyApiError } from '@/lib/spotify';
import type { AnalysisBeat, AnalysisSegment, TrackAudioAnalysis } from '@/lib/trackAudioAnalysis';

type SpotifyAnalysisResponse = {
  beats?: AnalysisBeat[];
  segments?: AnalysisSegment[];
};

export async function GET(request: Request): Promise<NextResponse> {
  const token = getAccessToken();
  const trackId = new URL(request.url).searchParams.get('trackId');

  if (!token) {
    return NextResponse.json({ error: 'missing_access_token' }, { status: 401 });
  }

  if (!trackId) {
    return NextResponse.json({ error: 'missing_track_id' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/audio-analysis/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new SpotifyApiError(
        `spotify audio analysis failed: ${response.status} ${errorBody}`,
        response.status,
      );
    }

    const data = (await response.json()) as SpotifyAnalysisResponse;
    const analysis: TrackAudioAnalysis = {
      beats: (data.beats ?? []).map((beat) => ({
        start: beat.start,
        duration: beat.duration,
        confidence: beat.confidence,
      })),
      segments: (data.segments ?? []).map((segment) => ({
        start: segment.start,
        duration: segment.duration,
        loudness_max: segment.loudness_max,
      })),
    };

    return NextResponse.json(analysis);
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'failed_to_fetch_audio_analysis' }, { status: 500 });
  }
}
