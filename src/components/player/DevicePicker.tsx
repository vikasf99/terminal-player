'use client';

import { useState } from 'react';

import { useSpotifyDevices } from '@/hooks/useSpotifyDevices';
import { transferPlayback } from '@/lib/spotifyControl';
import { usePlayerStore } from '@/stores/playerStore';
import type { SpotifyConnectDevice } from '@/types/spotifyDevice';

export function DevicePicker() {
  const { devices, isLoading, error, refresh } = useSpotifyDevices();
  const playbackDeviceId = usePlayerStore((s) => s.playbackDeviceId);
  const setPlaybackDevice = usePlayerStore((s) => s.setPlaybackDevice);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const selectDevice = async (device: SpotifyConnectDevice): Promise<void> => {
    setPendingId(device.id);
    const ok = await transferPlayback(device.id, true);
    if (ok) {
      setPlaybackDevice(device.id, device.name);
    }
    setPendingId(null);
    refresh();
  };

  return (
    <section style={{ marginBottom: 10, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: 'var(--white)' }}>[OUTPUT]</span>
        <button
          type="button"
          onClick={refresh}
          style={{
            padding: 0,
            border: 'none',
            background: 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--gray-muted)',
            cursor: 'pointer',
          }}
        >
          refresh
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--gray-muted)', margin: 0, fontSize: 11 }}>loading...</p>
      ) : null}
      {error ? <p style={{ color: 'var(--magenta)', margin: 0, fontSize: 11 }}>{error}</p> : null}

      {!isLoading && !error ? (
        <div
          role="listbox"
          aria-label="playback device"
          style={{ maxHeight: 88, overflowY: 'auto' }}
        >
          {devices.length === 0 ? (
            <p style={{ color: 'var(--gray-muted)', margin: 0, fontSize: 11 }}>no devices — open spotify, refresh</p>
          ) : (
            devices.map((device) => {
              const isSelected =
                device.id === playbackDeviceId || (device.is_active && !playbackDeviceId);
              return (
                <button
                  key={device.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={device.is_restricted || pendingId === device.id}
                  onClick={() => void selectDevice(device)}
                  style={{
                    width: '100%',
                    border: 'none',
                    borderLeft: isSelected ? '2px solid var(--green-bright)' : '2px solid transparent',
                    background: 'transparent',
                    textAlign: 'left',
                    padding: '4px 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: isSelected ? 'var(--green-bright)' : 'var(--white)',
                    textShadow: isSelected ? 'var(--glow-green)' : 'none',
                    cursor: device.is_restricted ? 'not-allowed' : 'pointer',
                    opacity: device.is_restricted ? 0.45 : 1,
                  }}
                >
                  <span style={{ color: 'var(--gray-muted)', marginRight: 6 }}>{isSelected ? '>' : ' '}</span>
                  {device.name}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </section>
  );
}
