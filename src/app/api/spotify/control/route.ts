import { NextResponse } from 'next/server';

import { getAccessToken } from '@/lib/spotify';

type ControlAction =
  | 'play'
  | 'pause'
  | 'next'
  | 'previous'
  | 'shuffle'
  | 'repeat'
  | 'volume'
  | 'seek'
  | 'play_track';
type ControlBody = {
  action?: ControlAction;
  value?: string | number | boolean;
  uris?: string[];
  contextUri?: string;
  deviceId?: string;
  offset?: number;
};

const endpointFor = (action: ControlAction, value?: string | number | boolean): { url: string; method: string } => {
  switch (action) {
    case 'play':
      return { url: 'https://api.spotify.com/v1/me/player/play', method: 'PUT' };
    case 'pause':
      return { url: 'https://api.spotify.com/v1/me/player/pause', method: 'PUT' };
    case 'next':
      return { url: 'https://api.spotify.com/v1/me/player/next', method: 'POST' };
    case 'previous':
      return { url: 'https://api.spotify.com/v1/me/player/previous', method: 'POST' };
    case 'shuffle':
      return { url: `https://api.spotify.com/v1/me/player/shuffle?state=${value ? 'true' : 'false'}`, method: 'PUT' };
    case 'repeat':
      return { url: `https://api.spotify.com/v1/me/player/repeat?state=${value ? 'context' : 'off'}`, method: 'PUT' };
    case 'volume':
      return {
        url: `https://api.spotify.com/v1/me/player/volume?volume_percent=${Math.max(
          0,
          Math.min(100, Number(value) || 0),
        )}`,
        method: 'PUT',
      };
    case 'seek':
      return {
        url: `https://api.spotify.com/v1/me/player/seek?position_ms=${Math.max(0, Math.floor(Number(value) || 0))}`,
        method: 'PUT',
      };
    default:
      return { url: '', method: 'POST' };
  }
};

export async function POST(request: Request): Promise<NextResponse> {
  const token = getAccessToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'missing_access_token' }, { status: 401 });
  }

  const body = (await request.json()) as ControlBody;
  if (!body.action) {
    return NextResponse.json({ ok: false, error: 'missing_action' }, { status: 400 });
  }

  if (body.action === 'play_track') {
    const deviceQuery = body.deviceId ? `?device_id=${encodeURIComponent(body.deviceId)}` : '';
    const playBody: Record<string, unknown> = {};
    if (body.uris?.length) {
      playBody.uris = body.uris;
    }
    if (body.contextUri) {
      playBody.context_uri = body.contextUri;
    }
    if (body.offset !== undefined) {
      playBody.offset = { position: body.offset };
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/play${deviceQuery}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playBody),
      cache: 'no-store',
    });

    if (!response.ok && response.status !== 204) {
      return NextResponse.json({ ok: false, error: await response.text() }, { status: response.status });
    }
    return NextResponse.json({ ok: true });
  }

  const endpoint = endpointFor(body.action, body.value);
  const volumeDeviceQuery =
    body.action === 'volume' && body.deviceId
      ? `&device_id=${encodeURIComponent(body.deviceId)}`
      : '';
  const response = await fetch(`${endpoint.url}${volumeDeviceQuery}`, {
    method: endpoint.method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json({ ok: false, error: await response.text() }, { status: response.status });
  }

  return NextResponse.json({ ok: true });
}
