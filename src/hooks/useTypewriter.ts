'use client';

import { useEffect, useState } from 'react';

export const useTypewriter = (text: string, intervalMs = 35): string => {
  const [visible, setVisible] = useState('');

  useEffect(() => {
    setVisible('');
    let index = 0;

    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [text, intervalMs]);

  return visible;
};
