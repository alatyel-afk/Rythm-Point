export const NAKSHATRAS = [
  "Ашвини", "Бхарани", "Криттика", "Рохини", "Мригашира", "Ардра",
  "Пунарвасу", "Пушья", "Ашлеша", "Магха", "Пурва Пхалгуни",
  "Уттара Пхалгуни", "Хаста", "Читра", "Свати", "Вишакха", "Анурадха",
  "Джйештха", "Мула", "Пурва Ашадха", "Уттара Ашадха", "Шравана",
  "Дхаништха", "Шатабхиша", "Пурва Бхадрапада", "Уттара Бхадрапада", "Ревати",
];

export const NAK_SPAN = 360 / 27;

export function nakIndex(moonDeg: number): number {
  const i = Math.floor((moonDeg % 360) / NAK_SPAN);
  return Math.min(i, 26);
}

export function nakName(moonDeg: number): string {
  return NAKSHATRAS[nakIndex(moonDeg)];
}

export function nakPada(moonDeg: number): number {
  const off = (moonDeg % 360) % NAK_SPAN;
  return Math.min(Math.floor(off / (NAK_SPAN / 4)) + 1, 4);
}
