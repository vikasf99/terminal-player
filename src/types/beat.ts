export interface BeatEvent {
  timestamp: number;
  intensity: number;
}

export interface BeatData {
  intensity: number;
  bpm: number;
  isBeat: boolean;
  bassEnergy: number;
}
