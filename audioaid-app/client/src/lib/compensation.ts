import { FREQUENCIES_HZ } from "@shared/schema";

/** Map dB hearing threshold (higher = worse) to peaking EQ gain (capped). */
export function thresholdsToCompensationGains(thresholds: number[]): number[] {
  if (thresholds.length !== FREQUENCIES_HZ.length) {
    throw new Error(`Expected ${FREQUENCIES_HZ.length} thresholds`);
  }
  const baseline = Math.min(...thresholds);
  return thresholds.map((t) => {
    const need = t - baseline;
    return Math.min(24, Math.max(0, Math.round(need * 0.85)));
  });
}