import { NextResponse } from 'next/server';

import { getAccessToken } from '@/lib/spotify';

export async function GET(): Promise<NextResponse> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'missing_access_token' }, { status: 401 });
  }
  return NextResponse.json({ accessToken });
}
