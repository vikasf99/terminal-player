export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images?: Array<{ url: string; width?: number; height?: number }>;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  is_playing?: boolean;
  progress_ms?: number;
}

export interface SpotifyAudioFeatures {
  id: string;
  tempo: number;
  energy: number;
  danceability: number;
  valence: number;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: { total: number };
}

export interface SpotifyPlaylistTrackItem {
  track: SpotifyTrack | null;
}
