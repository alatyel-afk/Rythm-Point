import type { BreathingTemplate, BreathingTemplateId, LoadTemplate, LoadTemplateId } from "./protocol-types";

export const breathingTemplates: Record<BreathingTemplateId, BreathingTemplate> = {
  sama_vritti_6: {
    id: "sama_vritti_6",
    practice: "sama_vritti",
    durationMin: 6,
    time: "afternoon_or_evening",
  },
  sama_vritti_8: {
    id: "sama_vritti_8",
    practice: "sama_vritti",
    durationMin: 8,
    time: "afternoon_or_evening",
  },
  extended_exhale_6: {
    id: "extended_exhale_6",
    practice: "extended_exhale",
    durationMin: 6,
    time: "afternoon_or_evening",
  },
  extended_exhale_8: {
    id: "extended_exhale_8",
    practice: "extended_exhale",
    durationMin: 8,
    time: "afternoon_or_evening",
  },
  bhramari_5: {
    id: "bhramari_5",
    practice: "bhramari",
    durationMin: 5,
    time: "afternoon_or_evening",
  },
  diaphragmatic_8: {
    id: "diaphragmatic_8",
    practice: "diaphragmatic_breathing",
    durationMin: 8,
    time: "afternoon_or_evening",
  },
  full_soft_6: {
    id: "full_soft_6",
    practice: "soft_full_breath",
    durationMin: 6,
    time: "daytime",
  },
};

export const loadTemplates: Record<LoadTemplateId, LoadTemplate> = {
  normal_walk: {
    id: "normal_walk",
    mode: "normal_walk",
    description: "обычная ходьба, спокойная бытовая активность",
  },
  reduced_load: {
    id: "reduced_load",
    mode: "reduced_load",
    description: "сниженная нагрузка, без форсажа",
  },
  soft_movement: {
    id: "soft_movement",
    mode: "soft_movement",
    description: "мягкое движение, ходьба, без силовой нагрузки",
  },
  very_light: {
    id: "very_light",
    mode: "very_light",
    description: "минимальная нагрузка, только мягкое движение и обычные дела",
  },
};
