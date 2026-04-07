import { elongation, tithi, illumination, phaseLabel } from "./lunar-day";
import { nakName, nakPada } from "./nakshatra";
import { isEkadashi } from "./ekadashi";
import { isPradosh } from "./pradosh";

export interface Snap {
  sun: number; moon: number; elong: number; tithi: number;
  nakshatra: string; pada: number; illum: number; phase: string;
  isEkadashi: boolean; isPradosh: boolean;
  saturn: number; jupiter: number; rahu: number; ketu: number;
}

export function computeSnap(d: Date): Snap {
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const sun = (doy * 0.9856) % 360;
  const moon = (doy * 13.176) % 360;
  const el = elongation(sun, moon);
  const t = tithi(el);
  return {
    sun, moon, elong: el, tithi: t,
    nakshatra: nakName(moon), pada: nakPada(moon),
    illum: illumination(el), phase: phaseLabel(el),
    isEkadashi: isEkadashi(t), isPradosh: isPradosh(t),
    saturn: (doy * 0.033) % 360,
    jupiter: (doy * 0.083) % 360,
    rahu: (315 - doy * 0.053 + 360) % 360,
    ketu: (135 - doy * 0.053 + 360) % 360,
  };
}
