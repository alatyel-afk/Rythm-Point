/** Минимальные объявления для ESM-пакета astronomia (без @types). */
declare module "astronomia/julian" {
  export class CalendarGregorian {
    constructor(year: number, month?: number, day?: number);
    toJDE(): number;
  }
}

declare module "astronomia/base" {
  const base: {
    J2000Century(jde: number): number;
  };
  export default base;
}

declare module "astronomia/solar" {
  export function apparentLongitude(T: number): number;
}

declare module "astronomia/moonposition" {
  export function position(jde: number): { lon: number };
}
