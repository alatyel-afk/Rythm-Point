import type { DayType } from "./rules";

export interface MudraOut {
  mudra: string; suggested: boolean; name_ru: string; duration_minutes: number;
  reason: string; finger_technique: string; posture: string;
  breathing_during: string; tongue_position: string; when_to_do: string; caution: string;
}

export const NONE_MUDRA: MudraOut = {
  mudra: "none", suggested: false, name_ru: "нет", duration_minutes: 0,
  reason: "Сегодня мудра не нужна.", finger_technique: "—",
  posture: "—", breathing_during: "—", tongue_position: "—", when_to_do: "—", caution: "—",
};

export function selectMudra(dt: DayType, highRetention: boolean): { mudra: MudraOut; trace: string[] } {
  const trace: string[] = [];
  if (dt === "drainage_day" || dt === "ekadashi_day" || dt === "pradosh_day") {
    trace.push("День выведения или разгрузки — апана-мудра для поддержки дренажа");
    return { mudra: { mudra: "apana", suggested: true, name_ru: "Апана-мудра", duration_minutes: 4, reason: "Помогает выведению лишней воды. Подходит для дней с дренажем или разгрузкой.", finger_technique: "Соединить подушечки среднего и безымянного пальцев с подушечкой большого. Указательный и мизинец выпрямлены.", posture: "Сидя с прямой спиной, руки на коленях ладонями вверх.", breathing_during: "Дышать носом. Выдох чуть длиннее вдоха (4:6).", tongue_position: "Кончик языка к верхнему нёбу.", when_to_do: "Через 30–40 минут после обеда. Не раньше.", caution: "Не делать на полный желудок, если есть тяжесть." }, trace };
  }
  if (dt === "high_sensitivity_day") {
    trace.push("Нервная система перегружена — ваю-мудра для снижения напряжения");
    return { mudra: { mudra: "vayu", suggested: true, name_ru: "Ваю-мудра", duration_minutes: 3, reason: "Нервная система перегружена. Снижает внутреннее напряжение.", finger_technique: "Согнуть указательный палец так, чтобы его подушечка касалась основания большого пальца. Большой палец прижимает указательный сверху. Остальные пальцы выпрямлены.", posture: "Сидя с прямой спиной, руки на коленях ладонями вверх.", breathing_during: "Ровное дыхание носом, вдох и выдох одинаковые (4:4).", tongue_position: "Язык свободно лежит во рту.", when_to_do: "Когда чувствуете напряжение или шум в голове. Максимум 3 минуты за раз.", caution: "Если нарастает тревога — сократить до 2 минут и остановиться." }, trace };
  }
  if (dt === "pre_full_moon_retention_day" || highRetention) {
    trace.push("Высокий риск задержки воды — мудра не рекомендуется");
    return { mudra: { ...NONE_MUDRA }, trace };
  }
  trace.push("Нет показаний для мудры сегодня");
  return { mudra: { ...NONE_MUDRA }, trace };
}
