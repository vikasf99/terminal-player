'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useSpotifyDevices } from '@/hooks/useSpotifyDevices';
import { transferPlayback } from '@/lib/spotifyControl';
import { usePlayerStore } from '@/stores/playerStore';
import type { SpotifyConnectDevice } from '@/types/spotifyDevice';

const deviceLabel = (device: SpotifyConnectDevice): string => {
  const type = device.type ? device.type.toLowerCase() : 'device';
  return `${device.name} (${type})`;
};

export function DevicePicker() {
  const { devices, isLoading, error, refresh } = useSpotifyDevices();
  const playbackDeviceId = usePlayerStore((s) => s.playbackDeviceId);
  const playbackDeviceName = usePlayerStore((s) => s.playbackDeviceName);
  const sdkDeviceId = usePlayerStore((s) => s.sdkDeviceId);
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

  const activeId = playbackDeviceId;

  return (
    <section style={{ marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--white)' }}>[PLAY ON]</span>
        <Button variant="ghost" fullWidth={false} onClick={refresh}>
          [REFRESH]
        </Button>
      </div>
      <p style={{ margin: '6px 0 8px', color: 'var(--gray-muted)', lineHeight: 1.5, fontSize: 11 }}>
        pick tv, speaker, or this browser. phone spotify app can control the same device.
      </p>
      {playbackDeviceName ? (
        <p style={{ margin: '0 0 8px', color: 'var(--green-mid)', fontSize: 11 }}>
          active: {playbackDeviceName}
        </p>
      ) : null}
      {isLoading ? <p style={{ color: 'var(--gray-muted)', margin: '6px 0' }}>loading devices...</p> : null}
      {error ? <p style={{ color: 'var(--magenta)', margin: '6px 0' }}>[ERROR] {error}</p> : null}
      {!isLoading && !error ? (
        <div
          role="listbox"
          aria-label="spotify connect devices"
          style={{ maxHeight: 120, overflowY: 'auto', borderBottom: '1px solid var(--gray-muted)' }}
        >
          {devices.length === 0 ? (
            <p style={{ color: 'var(--gray-muted)', margin: '6px 0' }}>
              no devices found — open spotify on your tv or phone, then refresh
            </p>
          ) : (
            devices.map((device) => {
              const isSelected = device.id === activeId || (device.is_active && !activeId);
              const isBrowser = device.id === sdkDeviceId;
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
                    padding: '5px 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: isSelected ? 'var(--green-bright)' : 'var(--white)',
                    cursor: device.is_restricted ? 'not-allowed' : 'pointer',
                    opacity: device.is_restricted ? 0.45 : 1,
                  }}
                >
                  <span style={{ color: 'var(--gray-muted)', marginRight: 6 }}>{isSelected ? '>' : ' '}</span>
                  {deviceLabel(device)}
                  {isBrowser ? <span style={{ color: 'var(--gray-muted)' }}> · browser</span> : null}
                  {device.is_active ? <span style={{ color: 'var(--green-mid)' }}> · spotify active</span> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </section>
  );
}
