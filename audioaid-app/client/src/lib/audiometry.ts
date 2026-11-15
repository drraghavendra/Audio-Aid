import { FREQUENCIES_HZ } from "@shared/schema";

export type AudiometryStep = "idle" | "playing" | "recorded" | "done";

export class PureToneAudiometry {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;

  async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    return this.ctx;
  }

  async playTone(freqHz: number, startGain = 0.0001, rampSeconds = 2.5): Promise<void> {
    await this.stop();
    const ctx = await this.ensureContext();
    this.osc = ctx.createOscillator();
    this.gain = ctx.createGain();
    this.osc.type = "sine";
    this.osc.frequency.value = freqHz;
    this.gain.gain.value = startGain;
    this.osc.connect(this.gain);
    this.gain.connect(ctx.destination);
    const now = ctx.currentTime;
    this.gain.gain.setValueAtTime(startGain, now);
    this.gain.gain.exponentialRampToValueAtTime(0.35, now + rampSeconds);
    this.osc.start(now);
  }

  async stop(): Promise<void> {
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {
        /* already stopped */
      }
      this.osc = null;
    }
    if (this.gain) {
      this.gain.disconnect();
      this.gain = null;
    }
  }

  currentGainDbEstimate(): number {
    if (!this.gain || !this.ctx) return -40;
    const linear = this.gain.gain.value;
    return 20 * Math.log10(Math.max(linear, 1e-6));
  }

  dispose() {
    void this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }
}

export { FREQUENCIES_HZ };