/**
 * Дробные карты и специальные лагны — справочно для «Настройки» и ручной сверки.
 * Расчёт дневного протокола в приложении по-прежнему на D1 + транзиты; D9/спец. лагны — контекст.
 */

export const NAVAMSA_D9_NOTICE =
  "Навамша (D9) — дробная карта для тонкой проверки (в т.ч. накшатры в 1/9 знака). Полные координаты планет в D9 в движок протокола не подставляются: ориентир — ваша таблица в настройках и специальные лагны ниже.";

/** Специальные лагны (знак + градусы), как в расчёте карты. */
export const SPECIAL_LAGNAS: { id: string; label: string; signEn: string; signRu: string; dms: string }[] = [
  { id: "pranapada", label: "Pranapada", signEn: "Virgo", signRu: "Дева", dms: "5°14′" },
  { id: "indu", label: "Indu", signEn: "Sagittarius", signRu: "Стрелец", dms: "2°55′" },
  { id: "bhrigu_bindhu", label: "Bhrigu Bindhu", signEn: "Aries", signRu: "Овен", dms: "9°18′" },
  { id: "sree", label: "Sree", signEn: "Virgo", signRu: "Дева", dms: "14°06′" },
  { id: "kunda", label: "Kunda", signEn: "Scorpio", signRu: "Скорпион", dms: "22°22′" },
  { id: "bhava", label: "Bhava", signEn: "Aquarius", signRu: "Водолей", dms: "1°37′" },
  { id: "hora", label: "Hora", signEn: "Scorpio", signRu: "Скорпион", dms: "8°28′" },
  { id: "ghati", label: "Ghati", signEn: "Aquarius", signRu: "Водолей", dms: "29°03′" },
  { id: "vighati", label: "Vighati", signEn: "Gemini", signRu: "Близнецы", dms: "16°26′" },
];

export function formatSpecialLagnaRow(row: (typeof SPECIAL_LAGNAS)[number]): string {
  return `${row.signRu} (${row.signEn}) ${row.dms}`;
}
