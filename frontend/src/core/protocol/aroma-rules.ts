import type { DayType } from "./rules";

export interface AromaOut {
  morning: string; morning_detail: string;
  daytime: string; daytime_detail: string;
  evening: string; evening_detail: string;
}

export const AROMAS: Record<DayType, AromaOut> = {
  stable_day: { morning: "frankincense", morning_detail: "Ладан, 1 капля на запястье. Помогает собраться утром.", daytime: "geranium", daytime_detail: "Герань, 1 капля. Ровный фон без возбуждения.", evening: "rose", evening_detail: "Роза, 1 капля. Перед сном, без активных ароматов." },
  drainage_day: { morning: "rosemary", morning_detail: "Розмарин, 1 капля. Проясняет голову, помогает двигаться.", daytime: "geranium", daytime_detail: "Герань, 1 капля. Ровный фон.", evening: "frankincense", evening_detail: "Ладан, 1 капля. Только если голова не перегружена." },
  caution_day: { morning: "geranium", morning_detail: "Герань, 1 капля. Не стимулирует, снимает тяжесть в голове.", daytime: "anti_stress_blend", daytime_detail: "Смесь «Антистресс», 20 мин через аромалампу.", evening: "rose", evening_detail: "Роза, 1 капля. Без стимулирующих ароматов вечером." },
  high_sensitivity_day: { morning: "rose", morning_detail: "Роза, 1 капля на запястье. Не перегружать нос ароматами.", daytime: "anti_stress_blend", daytime_detail: "Смесь «Антистресс», 15 мин через аромалампу.", evening: "rose", evening_detail: "Роза, 1 капля. Тихий вечер, без новых запахов." },
  ekadashi_day: { morning: "rose", morning_detail: "Роза, 1 капля. Не стимулировать аппетит ароматами.", daytime: "anti_stress_blend", daytime_detail: "Смесь «Антистресс», если появится раздражительность от голода.", evening: "rose", evening_detail: "Роза, 1 капля. Вечером без стимуляции." },
  pradosh_day: { morning: "frankincense", morning_detail: "Ладан, 1 капля. Собранность с утра.", daytime: "rose", daytime_detail: "Роза, 1 капля. Если нервный фон повышен.", evening: "geranium", evening_detail: "Герань, 1 капля коротко. Не позже чем за час до сна." },
  recovery_day_after_reduction: { morning: "rosemary", morning_detail: "Розмарин, 1 капля. Помогает проснуться после разгрузки.", daytime: "geranium", daytime_detail: "Герань, 1 капля. Ровный фон.", evening: "frankincense", evening_detail: "Ладан, 1 капля. Не использовать при жаре в голове." },
  pre_full_moon_retention_day: { morning: "geranium", morning_detail: "Герань, 1 капля. Не стимулирует, снимает тяжесть.", daytime: "anti_stress_blend", daytime_detail: "Смесь «Антистресс», 20 мин через аромалампу.", evening: "rose", evening_detail: "Роза, 1 капля. Без стимулирующих ароматов." },
  pre_new_moon_precision_day: { morning: "frankincense", morning_detail: "Ладан, 1 капля. Помогает удержать фокус.", daytime: "leuzea", daytime_detail: "Левзея, 1 капля. Только при сонливости, не при тревоге.", evening: "rose", evening_detail: "Роза, 1 капля. Вечером без тонизирующих ароматов." },
};
