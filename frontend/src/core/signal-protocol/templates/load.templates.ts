import type { LoadTemplate, LoadTemplateId } from "../protocol-rules";

const D = (id: LoadTemplateId, partial: Omit<LoadTemplate, "id">): LoadTemplate => ({
  id,
  ...partial,
});

export const LOAD_TEMPLATES: Record<LoadTemplateId, LoadTemplate> = {
  normal_walk: D("normal_walk", {
    mode: "normal",
    description: "Прогулка 30–45 мин, лёгкая растяжка по самочувствию.",
  }),
  reduced_load: D("reduced_load", {
    mode: "reduced",
    description: "Прогулка 20–30 мин, без ускорений и силовых.",
  }),
  soft_movement: D("soft_movement", {
    mode: "soft",
    description: "Только мягкая ходьба 20–30 мин, без пота и перегруза.",
  }),
  very_light: D("very_light", {
    mode: "very_light",
    description: "10–15 мин ходьбы или дыхательные практики вместо нагрузки.",
  }),
};
