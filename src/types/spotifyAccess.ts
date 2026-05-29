export type SpotifyAccessReason = 'session_expired' | 'dev_mode_allowlist' | 'unknown';

export type SpotifyAccessErrorBody = {
  error?: string;
  reason?: SpotifyAccessReason;
  needsReauth?: boolean;
  needsAllowlist?: boolean;
};
