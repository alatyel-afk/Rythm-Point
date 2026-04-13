import type { DayType } from "./rules";

export interface MovementGuidance {
  profile: string;
  /** Краткий абзац для совместимости */
  detail: string;
  /** Пункты рекомендаций (низкая физическая нагрузка) */
  items: string[];
}

/** Рекомендации по движению с опорой на титхи, фазу и тип дня; без «спортивного» тона. */
export function buildMovementGuidance(
  dayType: DayType,
  tithi: number,
  elongDeg: number,
  opts: { noIntensifyExercise?: boolean } = {},
): MovementGuidance {
  const e = elongDeg % 360;
  const waxing = e < 180;
  const nearFull = e >= 135 && e < 195;
  const nearNew = e < 36 || e >= 324;

  let walkMinLo = 20;
  let walkMinHi = 32;
  let vibLo = 5;
  let vibHi = 8;

  switch (dayType) {
    case "drainage_day":
    case "ekadashi_day":
      walkMinLo = 25;
      walkMinHi = 38;
      vibLo = 5;
      vibHi = 10;
      break;
    case "caution_day":
    case "high_sensitivity_day":
    case "pradosh_day":
      walkMinLo = 18;
      walkMinHi = 28;
      vibLo = 5;
      vibHi = 7;
      break;
    case "recovery_day_after_reduction":
      walkMinLo = 30;
      walkMinHi = 45;
      vibLo = 5;
      vibHi = 8;
      break;
    case "pre_full_moon_retention_day":
    case "pre_new_moon_precision_day":
      walkMinLo = 22;
      walkMinHi = 35;
      vibLo = 5;
      vibHi = 9;
      break;
    default:
      break;
  }

  if (opts.noIntensifyExercise) {
    walkMinLo = Math.min(walkMinLo, 22);
    walkMinHi = Math.min(walkMinHi, 35);
    vibHi = Math.min(vibHi, 8);
  }

  const phaseNote = waxing
    ? nearFull
      ? "Фаза: растущая Луна, близко к полнолунию — не перегружать суставы."
      : "Фаза: растущая Луна — умеренное движение без рывков."
    : nearNew
      ? "Фаза: убывающая Луна, близко к новолунию — мягкий режим."
      : "Фаза: убывающая Луна — спокойная ходьба и восстановление.";

  const tithiNote =
    tithi === 11
      ? "Титхи экадаши: пост только на воде — без гонок по шагам; при слабости только прогулка или только виброплатформа."
      : tithi === 13
        ? "Титхи трайодаши (прадоша): пост только на воде — вечером без лишней стимуляции через нагрузку."
        : "";

  const items: string[] = [
    `Виброплатформа: низкая амплитуда ${vibLo}–${vibHi} мин (не замена кардио и не «тряска до пота»).`,
    `Ходьба: ${walkMinLo}–${walkMinHi} мин спокойным шагом, без ускорений; если не любите нагрузки — ближе к нижней границе или разбейте на два выхода.`,
    "Без прыжков, без силовых и без интервальных ускорений сегодня.",
    phaseNote,
  ];
  if (tithiNote) items.push(tithiNote);
  items.push(
    "При желании: лёгкая растяжка 5–7 мин или ноги чуть выше уровня тела 8–10 мин — только если это приятно телу.",
  );

  const profile =
    dayType === "drainage_day" || dayType === "ekadashi_day"
      ? "lymph_stretch"
      : dayType === "caution_day" || dayType === "high_sensitivity_day" || dayType === "pradosh_day"
        ? "no_overload"
        : dayType === "recovery_day_after_reduction" || dayType === "pre_new_moon_precision_day"
          ? "walk_soft"
          : "moderate";

  const detail = items.join(" ");

  return { profile, detail, items };
}
