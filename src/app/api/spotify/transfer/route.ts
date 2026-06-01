import { NextResponse } from 'next/server';

import { getAccessToken, SpotifyApiError } from '@/lib/spotify';

type TransferBody = {
  deviceId?: string;
  play?: boolean;
};

export async function POST(request: Request): Promise<NextResponse> {
  const token = getAccessToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'missing_access_token' }, { status: 401 });
  }

  const body = (await request.json()) as TransferBody;
  if (!body.deviceId) {
    return NextResponse.json({ ok: false, error: 'missing_device_id' }, { status: 400 });
  }

  const response = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      device_ids: [body.deviceId],
      play: body.play !== false,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new SpotifyApiError(`failed to transfer playback: ${message}`, response.status);
    return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
  }

  return NextResponse.json({ ok: true });
}
