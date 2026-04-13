/**
 * Экадаши — 11-й титхи каждой половины лунного месяца (нумерация 1–30 в приложении):
 * шукла-экадаши = 11, кришна-экадаши = 26 (15 + 11).
 */
export function isEkadashi(tithiNum: number): boolean {
  return tithiNum === 11 || tithiNum === 26;
}
