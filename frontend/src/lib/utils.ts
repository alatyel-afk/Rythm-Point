export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function clampValue(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

/** Convert internal 0–100 scale to human-readable 1–5 */
export function toFive(v: number): number {
  if (v <= 0) return 1;
  return Math.min(5, Math.ceil(v / 20));
}
