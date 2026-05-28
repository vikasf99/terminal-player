import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

import { getAccessToken } from '@/lib/spotify';

export async function GET(): Promise<NextResponse> {
  const cookieHeader = headers().get('cookie') ?? '';
  const cookieNames = cookieHeader
    .split(';')
    .map((chunk) => chunk.split('=')[0]?.trim())
    .filter(Boolean);
  const parsedCookieNames = cookies().getAll().map((item) => item.name);
  console.log('[spotify/token] incoming cookies', { cookieNames, parsedCookieNames });

  const accessToken = getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'missing_access_token' }, { status: 401 });
  }
  return NextResponse.json({ accessToken });
}
