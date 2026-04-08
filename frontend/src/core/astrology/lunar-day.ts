export function elongation(sun: number, moon: number): number {
  return ((moon - sun) % 360 + 360) % 360;
}

export function tithi(elong: number): number {
  return Math.max(1, Math.min(30, Math.floor(elong / 12) + 1));
}

export function illumination(elong: number): number {
  return 0.5 * (1 - Math.cos(Math.PI * elong / 180));
}

export function phaseLabel(elong: number): string {
  const e = elong % 360;
  if (e < 45 || e >= 315) return "новолуние — растущая";
  if (e < 90) return "растущая Луна";
  if (e < 135) return "первая четверть";
  if (e < 180) return "растущая — к полнолунию";
  if (e < 225) return "убывающая после полнолуния";
  if (e < 270) return "последняя четверть";
  return "убывающая Луна";
}

/** Одна строка для карточки: фаза + доля освещённости диска (0–100%). */
export function moonPhaseLineRu(elong: number, illumination01: number): string {
  const pct = Math.round(illumination01 * 1000) / 10;
  return `${phaseLabel(elong)} · диск ~${pct}%`;
}

export function matrixIndex(t: number): number {
  return t >= 30 ? 29 : Math.max(1, t);
}
