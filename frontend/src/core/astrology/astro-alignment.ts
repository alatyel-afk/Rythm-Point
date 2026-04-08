import type { Snap } from "./engine";
import { nakIndex } from "./nakshatra";
import { nakshatraD1, nakshatraD9 } from "./navamsa";
import { NATAL } from "../profile/natal-profile";

export interface AlignmentDeltas {
  wr: number;
  rel: number;
  nrv: number;
  rhy: number;
}

export interface AstroAlignmentResult {
  summary: string;
  checks: string[];
  deltas: AlignmentDeltas;
  natal_moon: { d1_nak: string; d9_nak: string };
  transit_moon: { d1_nak: string; d9_nak: string };
  natal_sun: { d1_nak: string; d9_nak: string };
  transit_sun: { d1_nak: string; d9_nak: string };
}

const Z = (d: AlignmentDeltas): AlignmentDeltas => ({
  wr: d.wr,
  rel: d.rel,
  nrv: d.nrv,
  rhy: d.rhy,
});

function add(a: AlignmentDeltas, b: AlignmentDeltas): AlignmentDeltas {
  return Z({ wr: a.wr + b.wr, rel: a.rel + b.rel, nrv: a.nrv + b.nrv, rhy: a.rhy + b.rhy });
}

/** Минимальное угловое расстояние между накшатрами (0–13). */
function nakSeparation(lonA: number, lonB: number): number {
  const ia = nakIndex(lonA);
  const ib = nakIndex(lonB);
  const d = Math.abs(ia - ib);
  return Math.min(d, 27 - d);
}

/**
 * Сверка натала (D1/D9 по долготам из профиля) с транзитным снимком дня.
 * Поправки к шкалам идут до выбора типа дня и матрицы обеда.
 */
export function evaluateD1D9Alignment(
  natal: typeof NATAL,
  transit: Snap
): AstroAlignmentResult {
  const natal_moon = { d1_nak: nakshatraD1(natal.moon), d9_nak: nakshatraD9(natal.moon) };
  const transit_moon = { d1_nak: nakshatraD1(transit.moon), d9_nak: nakshatraD9(transit.moon) };
  const natal_sun = { d1_nak: nakshatraD1(natal.sun), d9_nak: nakshatraD9(natal.sun) };
  const transit_sun = { d1_nak: nakshatraD1(transit.sun), d9_nak: nakshatraD9(transit.sun) };

  let deltas: AlignmentDeltas = Z({ wr: 0, rel: 0, nrv: 0, rhy: 0 });
  const checks: string[] = [];

  function luminary(
    label: string,
    nLon: number,
    tLon: number,
    nD1: string,
    nD9: string,
    tD1: string,
    tD9: string
  ) {
    if (tD1 === nD1) {
      checks.push(`${label} (D1): транзит в той же накшатре, что и натал — синхронность.`);
      deltas = add(deltas, Z({ wr: -1, rel: 0, nrv: -3, rhy: -2 }));
    }
    if (tD9 === nD9) {
      checks.push(`${label} (D9): накшатра транзита совпадает с натальной в D9.`);
      deltas = add(deltas, Z({ wr: -1, rel: 0, nrv: -2, rhy: -2 }));
    }
    if (tD1 === nD9) {
      checks.push(`${label}: транзит D1 в накшатре натальной позиции в D9.`);
      deltas = add(deltas, Z({ wr: 0, rel: 0, nrv: -2, rhy: -1 }));
    }
    if (tD9 === nD1) {
      checks.push(`${label}: транзит D9 в накшатре натальной позиции в D1.`);
      deltas = add(deltas, Z({ wr: 0, rel: 0, nrv: -2, rhy: -2 }));
    }
    const sep = nakSeparation(tLon, nLon);
    if (sep === 13 || sep === 14) {
      checks.push(
        `${label}: транзитная и натальная позиции в «оппозиции» по кругу накшатр (≈180°) — выше чувствительность и удержание.`
      );
      deltas = add(deltas, Z({ wr: 4, rel: 0, nrv: 5, rhy: 2 }));
    }
  }

  luminary("Луна", natal.moon, transit.moon, natal_moon.d1_nak, natal_moon.d9_nak, transit_moon.d1_nak, transit_moon.d9_nak);
  luminary("Солнце", natal.sun, transit.sun, natal_sun.d1_nak, natal_sun.d9_nak, transit_sun.d1_nak, transit_sun.d9_nak);

  if (checks.length === 0) {
    checks.push(
      "Явных совпадений Луны/Солнца по D1↔D9 (как выше) сегодня нет; шкалы по транзитам считаются по базовым правилам дня."
    );
  }

  const summary =
    checks.length > 1
      ? "Сверка D1 и D9 для Луны и Солнца (натал vs транзит): учтено перед выбором типа дня и обеда."
      : checks[0] ?? "Сверка D1/D9 выполнена.";

  return {
    summary,
    checks,
    deltas,
    natal_moon,
    transit_moon,
    natal_sun,
    transit_sun,
  };
}
