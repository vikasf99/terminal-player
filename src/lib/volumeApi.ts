const DEBOUNCE_MS = 100;
const LOCAL_AUTHORITY_MS = 3000;

let debounceTimer: number | null = null;
let lastSentVolume = -1;
let pendingVolume = 0;
let remoteGuardUntil = 0;
let activeDeviceId: string | null = null;

export const setVolumeDeviceId = (deviceId: string | null): void => {
  activeDeviceId = deviceId;
};

export const markLocalVolumeAuthority = (durationMs = LOCAL_AUTHORITY_MS): void => {
  remoteGuardUntil = Date.now() + durationMs;
};

export const shouldApplyRemoteVolume = (): boolean => Date.now() >= remoteGuardUntil;

const clampVolume = (volumePercent: number): number =>
  Math.max(0, Math.min(100, Math.round(volumePercent)));

const commitVolume = async (volumePercent: number, deviceId?: string | null): Promise<void> => {
  const next = clampVolume(volumePercent);
  if (next === lastSentVolume) {
    return;
  }
  lastSentVolume = next;

  const resolvedDevice = deviceId ?? activeDeviceId;
  await fetch('/api/spotify/control', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'volume',
      value: next,
      ...(resolvedDevice ? { deviceId: resolvedDevice } : {}),
    }),
  });
};

type SendVolumeOptions = {
  immediate?: boolean;
  deviceId?: string | null;
};

export const sendVolumeToSpotify = (volumePercent: number, options?: SendVolumeOptions): void => {
  markLocalVolumeAuthority();
  pendingVolume = clampVolume(volumePercent);

  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  if (options?.immediate) {
    void commitVolume(pendingVolume, options.deviceId);
    return;
  }

  debounceTimer = window.setTimeout(() => {
    debounceTimer = null;
    void commitVolume(pendingVolume, options?.deviceId);
  }, DEBOUNCE_MS);
};

export const flushVolumeToSpotify = (volumePercent: number, deviceId?: string | null): void => {
  sendVolumeToSpotify(volumePercent, { immediate: true, deviceId });
};
