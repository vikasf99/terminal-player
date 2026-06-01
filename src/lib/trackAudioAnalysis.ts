export type AnalysisBeat = {
  start: number;
  duration: number;
  confidence: number;
};

export type AnalysisSegment = {
  start: number;
  duration: number;
  loudness_max: number;
};

export type TrackAudioAnalysis = {
  beats: AnalysisBeat[];
  segments: AnalysisSegment[];
};

export type TrackAudioFeatures = {
  energy: number;
  tempo: number;
  danceability: number;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

/** Spotify loudness is in dB; typical music range ~-50 to ~0. */
export const loudnessToEnergy = (loudnessDb: number): number =>
  clamp01((loudnessDb + 48) / 48);

const findIndexAtTime = <T extends { start: number }>(items: T[], timeSec: number): number => {
  if (items.length === 0) {
    return -1;
  }
  let lo = 0;
  let hi = items.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const item = items[mid];
    const nextStart = items[mid + 1]?.start ?? Number.POSITIVE_INFINITY;
    if (timeSec >= item.start && timeSec < nextStart) {
      return mid;
    }
    if (timeSec < item.start) {
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return items.length - 1;
};

export type SampledBassState = {
  beatIndex: number;
  isDownbeat: boolean;
  bassEnergy: number;
  segmentLoudness: number;
  beatConfidence: number;
};

export const sampleTrackBass = (
  analysis: TrackAudioAnalysis,
  features: TrackAudioFeatures,
  progressMs: number,
): SampledBassState => {
  const timeSec = progressMs / 1000;
  const beatIndex = findIndexAtTime(analysis.beats, timeSec);
  const beat = beatIndex >= 0 ? analysis.beats[beatIndex] : null;
  const segmentIndex = findIndexAtTime(analysis.segments, timeSec);
  const segment = segmentIndex >= 0 ? analysis.segments[segmentIndex] : null;

  const segmentLoudness = segment ? loudnessToEnergy(segment.loudness_max) : features.energy;
  const beatConfidence = beat?.confidence ?? 0.5;
  const isDownbeat = beatIndex >= 0 && beatIndex % 4 === 0;

  const bassBlend =
    segmentLoudness * 0.72 +
    features.energy * 0.18 +
    features.danceability * 0.1;

  const downbeatBoost = isDownbeat ? 0.22 : 0;
  const bassEnergy = clamp01(bassBlend * (0.75 + beatConfidence * 0.35) + downbeatBoost);

  return {
    beatIndex,
    isDownbeat,
    bassEnergy,
    segmentLoudness,
    beatConfidence,
  };
};
