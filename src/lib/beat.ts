import type { BeatData } from '@/types/beat';

export class BeatDetector {
  private analyser: AnalyserNode;

  private dataArray: Uint8Array<ArrayBuffer>;

  private source: MediaElementAudioSourceNode;

  private audioContext: AudioContext;

  private lastBeatAtMs = 0;

  private beatIntervalsMs: number[] = [];

  private lastBpm = 0;

  constructor(audioContext: AudioContext, source: MediaElementAudioSourceNode) {
    this.audioContext = audioContext;
    this.source = source;
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;
    this.dataArray = new Uint8Array<ArrayBuffer>(new ArrayBuffer(this.analyser.frequencyBinCount));
    this.connectNodes();
  }

  private connectNodes(): void {
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  getFrequencyData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  private estimateBpm(nowMs: number): number {
    if (this.lastBeatAtMs > 0) {
      const interval = nowMs - this.lastBeatAtMs;
      if (interval >= 100 && interval <= 2000) {
        this.beatIntervalsMs.push(interval);
        if (this.beatIntervalsMs.length > 12) {
          this.beatIntervalsMs.shift();
        }
      }
    }

    if (this.beatIntervalsMs.length === 0) {
      return this.lastBpm;
    }

    const avgInterval =
      this.beatIntervalsMs.reduce((sum, value) => sum + value, 0) / this.beatIntervalsMs.length;
    const bpm = Math.round(60000 / avgInterval);
    this.lastBpm = bpm;
    return bpm;
  }

  detectBeat(threshold = 125): BeatData {
    const data = this.getFrequencyData();
    const bassBins = data.slice(0, 11);
    const bassEnergy = bassBins.reduce((sum, value) => sum + value, 0) / bassBins.length;
    const intensity = Math.max(0, Math.min(1, bassEnergy / 255));
    const nowMs = performance.now();
    const cooldownElapsed = nowMs - this.lastBeatAtMs >= 100;

    if (bassEnergy > threshold && cooldownElapsed) {
      const bpm = this.estimateBpm(nowMs);
      this.lastBeatAtMs = nowMs;
      return { isBeat: true, intensity, bpm, bassEnergy: intensity };
    }

    return { isBeat: false, intensity, bpm: this.lastBpm, bassEnergy: intensity };
  }

  destroy(): void {
    try {
      this.source.disconnect(this.analyser);
    } catch {
      // no-op: disconnect may throw if already disconnected
    }
    try {
      this.analyser.disconnect();
    } catch {
      // no-op: disconnect may throw if already disconnected
    }
  }
}
