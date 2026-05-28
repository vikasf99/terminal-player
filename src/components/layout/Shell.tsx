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

      // Token bootstrap checks can briefly 401 right after oauth redirect.
      // Let caller handle retries instead of forcing immediate login bounce.
      if (requestUrl.includes('/api/spotify/token')) {
        return response;
      }

      const refresh = await originalFetch('/api/auth/refresh', { method: 'POST' });
      if (!refresh.ok) {
        return response;
      }

      response = await originalFetch(input, init);
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}
