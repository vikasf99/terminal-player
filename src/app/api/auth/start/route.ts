import { NextResponse } from 'next/server';

import { buildAuthUrl } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const reauth = new URL(request.url).searchParams.get('reauth') === '1';
  return NextResponse.redirect(buildAuthUrl({ showDialog: reauth }));
}
