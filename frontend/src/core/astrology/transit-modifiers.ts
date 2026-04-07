import { NATAL } from "../profile/natal-profile";

export interface Hit { planet: string; aspect: string; target: string; delta: number }

export function angleDist(a: number, b: number): number {
  const d = Math.abs((a - b + 360) % 360);
  return Math.min(d, 360 - d);
}

export function findHits(snap: { saturn: number; jupiter: number; rahu: number; ketu: number }): Hit[] {
  const hits: Hit[] = [];
  const movers: Record<string, number> = {
    Saturn: snap.saturn, Jupiter: snap.jupiter, Rahu: snap.rahu, Ketu: snap.ketu,
  };
  const targets: Record<string, number> = {
    moon: NATAL.moon, venus: NATAL.venus, mercury: NATAL.mercury,
    mars: NATAL.mars, saturn: NATAL.saturn,
  };
  for (const [mn, ml] of Object.entries(movers)) {
    for (const [tn, tl] of Object.entries(targets)) {
      const d = angleDist(tl, ml);
      let asp: string | null = null;
      if (d <= 6) asp = "conjunction";
      else if (Math.abs(d - 180) <= 5) asp = "opposition";
      else if (Math.abs(d - 90) <= 5) asp = "square";
      else if (Math.abs(d - 120) <= 5) asp = "trine";
      if (asp) hits.push({ planet: mn, aspect: asp, target: tn, delta: Math.round(d * 100) / 100 });
    }
  }
  return hits;
}
