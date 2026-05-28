import { NextResponse } from 'next/server';

import { exchangeCode, setAuthCookies } from '@/lib/auth';

export async function GET(request: Request): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin), { status: 302 });
  }

  try {
    const token = await exchangeCode(code);
    const response = NextResponse.redirect(new URL('/player', requestUrl.origin), { status: 302 });
    setAuthCookies(response, token);
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin), { status: 302 });
  }
}
