import type { NextResponse } from 'next/server';

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

const SCOPES = [
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-email',
  'user-read-private',
].join(' ');

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`missing environment variable: ${key}`);
  }
  return value;
};

const getRedirectUri = (): string => {
  const resolvedBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  return `${resolvedBaseUrl}/api/auth/callback`;
};

const toBasicAuth = (): string => {
  const clientId = getRequiredEnv('SPOTIFY_CLIENT_ID');
  const clientSecret = getRequiredEnv('SPOTIFY_CLIENT_SECRET');
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
};

export const buildAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: getRequiredEnv('SPOTIFY_CLIENT_ID'),
    response_type: 'code',
    redirect_uri: getRedirectUri(),
    scope: SCOPES,
    show_dialog: 'false',
  });

  return `${SPOTIFY_AUTH_BASE}?${params.toString()}`;
};

const requestToken = async (body: URLSearchParams): Promise<TokenResponse> => {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${toBasicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`spotify token request failed: ${response.status} ${errorBody}`);
  }

  const data = (await response.json()) as Partial<TokenResponse>;

  if (!data.access_token || !data.expires_in || !data.token_type) {
    throw new Error('spotify token response missing required fields');
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? '',
    expires_in: data.expires_in,
    token_type: data.token_type,
  };
};

export const exchangeCode = async (code: string): Promise<TokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
  });

  return requestToken(body);
};

export const refreshAccessToken = async (refreshToken: string): Promise<TokenResponse> => {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const token = await requestToken(body);
  return {
    ...token,
    refresh_token: token.refresh_token || refreshToken,
  };
};

export const setAuthCookies = (response: NextResponse, token: TokenResponse): void => {
  const secure = process.env.NODE_ENV === 'production';
  const expiresAt = Date.now() + token.expires_in * 1000;

  response.cookies.set('access_token', token.access_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: token.expires_in,
  });

  response.cookies.set('refresh_token', token.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  response.cookies.set('expires_at', String(expiresAt), {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: token.expires_in,
  });
};
