import { NextResponse } from 'next/server';

import { buildAuthUrl } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  return NextResponse.redirect(buildAuthUrl());
}
