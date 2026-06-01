import { NextResponse } from 'next/server';

import { getAccessToken, SpotifyApiError } from '@/lib/spotify';
import type { SpotifyConnectDevice } from '@/types/spotifyDevice';

export async function GET(): Promise<NextResponse> {
  const token = getAccessToken();

  if (!token) {
    return NextResponse.json({ error: 'missing_access_token' }, { status: 401 });
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new SpotifyApiError(`spotify devices failed: ${response.status} ${errorBody}`, response.status);
    }

    const data = (await response.json()) as {
      devices?: Array<{
        id: string | null;
        name: string;
        type: string;
        is_active: boolean;
        is_restricted: boolean;
        volume_percent: number | null;
      }>;
    };

    const devices: SpotifyConnectDevice[] = (data.devices ?? [])
      .filter((device): device is typeof device & { id: string } => Boolean(device.id))
      .map((device) => ({
        id: device.id,
        name: device.name,
        type: device.type,
        is_active: device.is_active,
        is_restricted: device.is_restricted,
        volume_percent: device.volume_percent,
      }));

    return NextResponse.json({ devices });
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'failed_to_fetch_devices' }, { status: 500 });
  }
}
