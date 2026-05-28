'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

type ShellProps = {
  children: ReactNode;
};

export function Shell({ children }: ShellProps) {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const requestUrl =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      let response = await originalFetch(input, init);
      if (response.status !== 401) {
        return response;
      }

      if (requestUrl.includes('/api/spotify/token') || requestUrl.includes('/api/auth/')) {
        return response;
      }

      const refresh = await originalFetch('/api/auth/refresh', { method: 'POST' });
      if (!refresh.ok) {
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login?reason=session_expired');
        }
        return response;
      }

      response = await originalFetch(input, init);
      if (response.status === 401 && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login?reason=session_expired');
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}
