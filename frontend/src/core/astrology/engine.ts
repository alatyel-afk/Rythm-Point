import { CalendarGregorian } from "astronomia/julian";
import base from "astronomia/base";
import { apparentLongitude } from "astronomia/solar";
import { position as moonPosition } from "astronomia/moonposition";
import { elongation, tithi, illumination, phaseLabel } from "./lunar-day";
import { nakName, nakPada } from "./nakshatra";
import { isEkadashi } from "./ekadashi";
import { isPradosh } from "./pradosh";

export interface Snap {
  sun: number;
  moon: number;
  elong: number;
  tithi: number;
  nakshatra: string;
  pada: number;
  illum: number;
  phase: string;
  isEkadashi: boolean;
  isPradosh: boolean;
  mars: number;
  mercury: number;
  venus: number;
  saturn: number;
  jupiter: number;
  rahu: number;
  ketu: number;
}

function normDeg(x: number): number {
  let v = x % 360;
  if (v < 0) v += 360;
  return v;
}

/** Лахири (линейное приближение к Chitrapaksha), градусы — для сидерических долгот Луны/Солнца. */
function lahiriAyanamshaDegrees(jde: number): number {
  const precessionPerDay = (50.29 / 3600) / 365.25;
  return 23.854444 + (jde - 2451545.0) * precessionPerDay;
}

/**
 * Момент снимка: полдень UT на календарную дату (год/месяц/день в локальной зоне браузера).
 * Тропические долготы Солнца/Луны — Meeus (astronomia: solar + moonposition); титхи из элонгации.
 * Остальные планеты — прежняя детерминированная модель по номеру дня года (без эфемерид).
 */
export function computeSnap(d: Date): Snap {
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const y = d.getFullYear();
  const mo = d.getMonth() + 1;
  const day = d.getDate();
  const jde = new CalendarGregorian(y, mo, day + 0.5).toJDE();
  const T = base.J2000Century(jde);
  const sunTrop = normDeg(apparentLongitude(T) * (180 / Math.PI));
  const moonTrop = normDeg(moonPosition(jde).lon * (180 / Math.PI));
  const el = elongation(sunTrop, moonTrop);
  const t = tithi(el);
  const ayan = lahiriAyanamshaDegrees(jde);
  const sun = normDeg(sunTrop - ayan);
  const moon = normDeg(moonTrop - ayan);
  return {
    sun,
    moon,
    elong: el,
    tithi: t,
    nakshatra: nakName(moon),
    pada: nakPada(moon),
    illum: illumination(el),
    phase: phaseLabel(el),
    isEkadashi: isEkadashi(t),
    isPradosh: isPradosh(t),
    mars: (doy * 0.524 + 50.2) % 360,
    mercury: (doy * 1.383 + 25.167) % 360,
    venus: (doy * 1.0 + 49.883) % 360,
    saturn: (doy * 0.033) % 360,
    jupiter: (doy * 0.083) % 360,
    rahu: (315 - doy * 0.053 + 360) % 360,
    ketu: (135 - doy * 0.053 + 360) % 360,
  };
}
