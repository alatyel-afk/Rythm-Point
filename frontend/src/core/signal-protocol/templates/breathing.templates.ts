import type { BreathingTemplate, BreathingTemplateId } from "../protocol-rules";

const B = (
  id: BreathingTemplateId,
  partial: Omit<BreathingTemplate, "id">,
): BreathingTemplate => ({ id, ...partial });

export const BREATHING_TEMPLATES: Record<BreathingTemplateId, BreathingTemplate> = {
  sama_vritti_6: B("sama_vritti_6", {
    practice: "Сама вритти 1:1, 6 счётов",
    durationMin: 6,
    time: "Утро или до обеда",
  }),
  sama_vritti_8: B("sama_vritti_8", {
    practice: "Сама вритти 1:1, 8 счётов",
    durationMin: 8,
    time: "Утро",
  }),
  extended_exhale_6: B("extended_exhale_6", {
    practice: "Удлинённый выдох (вдох 4 / выдох 6)",
    durationMin: 6,
    time: "После обеда или вечер",
  }),
  extended_exhale_8: B("extended_exhale_8", {
    practice: "Удлинённый выдох (вдох 4 / выдох 8)",
    durationMin: 8,
    time: "Вечер",
  }),
  bhramari_5: B("bhramari_5", {
    practice: "Бхрамари",
    durationMin: 5,
    time: "Вечер, до сна",
  }),
  diaphragmatic_8: B("diaphragmatic_8", {
    practice: "Диафрагмальное дыхание",
    durationMin: 8,
    time: "Утро или до обеда",
  }),
  full_soft_6: B("full_soft_6", {
    practice: "Полное йогическое, мягкий темп",
    durationMin: 6,
    time: "Утро",
  }),
};
