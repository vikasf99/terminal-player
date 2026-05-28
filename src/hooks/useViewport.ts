'use client';

import { useEffect, useState } from 'react';

export type ViewportTier = 'mobile' | 'tablet' | 'desktop';

export const useViewport = (): ViewportTier => {
  const [tier, setTier] = useState<ViewportTier>('desktop');

  useEffect(() => {
    const update = (): void => {
      const width = window.innerWidth;
      if (width < 768) {
        setTier('mobile');
      } else if (width < 1024) {
        setTier('tablet');
      } else {
        setTier('desktop');
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return tier;
};
