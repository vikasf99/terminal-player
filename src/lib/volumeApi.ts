let debounceTimer: number | null = null;

export const sendVolumeToSpotify = (volumePercent: number): void => {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    void fetch('/api/spotify/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'volume', value: volumePercent }),
    });
  }, 120);
};
