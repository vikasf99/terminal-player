import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { refreshAccessToken, setAuthCookies } from '@/lib/auth';

export async function POST(): Promise<NextResponse> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ ok: false, error: 'missing_refresh_token' }, { status: 401 });
  }

  try {
    const token = await refreshAccessToken(refreshToken);
    const response = NextResponse.json({ ok: true });
    setAuthCookies(response, token);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'refresh_failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
