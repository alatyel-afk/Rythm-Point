import { nakName } from "./nakshatra";

/**
 * Долгота в навамше (D9): 0–360° сидерическая.
 * Правило: для знака-раши (cardinal/fixed/mutable) старт первой навамсы — как в классической ведической школе.
 */
export function navamsaLongitude(siderealLon: number): number {
  const lon = ((siderealLon % 360) + 360) % 360;
  const rashi = Math.floor(lon / 30) % 12;
  const pos = lon % 30;
  const navPiece = 30 / 9;
  const navIdx = Math.min(Math.floor(pos / navPiece), 8);
  const movable = [0, 3, 6, 9];
  const fixed = [1, 4, 7, 10];
  let start: number;
  if (movable.includes(rashi)) start = rashi;
  else if (fixed.includes(rashi)) start = (rashi + 8) % 12;
  else start = (rashi + 4) % 12;
  const navSign = (start + navIdx) % 12;
  const posInNav = pos % navPiece;
  const degInNav = (posInNav / navPiece) * 30;
  return navSign * 30 + degInNav;
}

export function nakshatraD1(lon: number): string {
  return nakName(lon);
}

export function nakshatraD9(lon: number): string {
  return nakName(navamsaLongitude(lon));
}
