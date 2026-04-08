/** Название титхи (1–30) в традиции шукла/кришна, для подписи в UI. */

const TITHI_IN_PAKSHA = [
  "Пратийада",
  "Двития",
  "Трития",
  "Чатуртхи",
  "Панчами",
  "Шаштхи",
  "Саптами",
  "Аштами",
  "Навами",
  "Дашами",
  "Экадаши",
  "Двадаши",
  "Трайодаши",
  "Чатурдаши",
] as const;

export function tithiNameRu(tithiNum: number): string {
  if (tithiNum < 1 || tithiNum > 30) return "";
  if (tithiNum === 15) return "Шукла Пурнима (полнолуние)";
  if (tithiNum === 30) return "Амавасья (новолуние)";
  if (tithiNum <= 14) return `Шукла ${TITHI_IN_PAKSHA[tithiNum - 1]}`;
  return `Кришна ${TITHI_IN_PAKSHA[tithiNum - 16]}`;
}
