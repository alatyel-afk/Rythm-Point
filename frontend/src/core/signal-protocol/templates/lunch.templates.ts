import type { LunchTemplate, LunchTemplateId } from "../protocol-rules";

const L = (
  id: LunchTemplateId,
  partial: Omit<LunchTemplate, "id">,
): LunchTemplate => ({ id, ...partial });

/** Реестр обедов: только данные, отдельно от правил. */
export const LUNCH_TEMPLATES: Record<LunchTemplateId, LunchTemplate> = {
  stable_chicken: L("stable_chicken", {
    timeWindow: "12:00–14:00",
    items: [
      { product: "Курица запечённая", amount_g: 150 },
      { product: "Овощи на пару", amount_g: 200 },
    ],
    riceAllowed: true,
    meatAllowed: true,
  }),
  stable_veal: L("stable_veal", {
    timeWindow: "12:00–14:00",
    items: [
      { product: "Телятина тушёная", amount_g: 130 },
      { product: "Овощи на пару", amount_g: 200 },
    ],
    riceAllowed: true,
    meatAllowed: true,
  }),
  retention_chicken: L("retention_chicken", {
    timeWindow: "12:00–13:30",
    items: [
      { product: "Курица отварная", amount_g: 120 },
      { product: "Тушёные овощи без соли", amount_g: 220 },
    ],
    riceAllowed: false,
    meatAllowed: true,
  }),
  retention_veal: L("retention_veal", {
    timeWindow: "12:00–13:30",
    items: [
      { product: "Телятина на пару", amount_g: 110 },
      { product: "Тушёные овощи без соли", amount_g: 220 },
    ],
    riceAllowed: false,
    meatAllowed: true,
  }),
  low_energy_rice_chicken: L("low_energy_rice_chicken", {
    timeWindow: "12:00–14:00",
    items: [
      { product: "Курица", amount_g: 120 },
      { product: "Рис белый", amount_g: 80 },
      { product: "Овощи", amount_g: 150 },
    ],
    riceAllowed: true,
    meatAllowed: true,
  }),
  low_energy_rice_veal: L("low_energy_rice_veal", {
    timeWindow: "12:00–14:00",
    items: [
      { product: "Телятина", amount_g: 110 },
      { product: "Рис белый", amount_g: 80 },
      { product: "Овощи", amount_g: 150 },
    ],
    riceAllowed: true,
    meatAllowed: true,
  }),
  ekadashi_veg: L("ekadashi_veg", {
    timeWindow: "12:00–14:00",
    items: [
      { product: "Суп овощной", amount_g: 300 },
      { product: "Крупа разрешённая (по списку дня)", amount_g: 100 },
    ],
    riceAllowed: false,
    meatAllowed: false,
  }),
  pradosh_chicken: L("pradosh_chicken", {
    timeWindow: "12:00–13:30",
    items: [
      { product: "Курица лёгкая", amount_g: 110 },
      { product: "Овощи", amount_g: 200 },
    ],
    riceAllowed: false,
    meatAllowed: true,
  }),
  pradosh_veal: L("pradosh_veal", {
    timeWindow: "12:00–13:30",
    items: [
      { product: "Телятина лёгкая", amount_g: 100 },
      { product: "Овощи", amount_g: 200 },
    ],
    riceAllowed: false,
    meatAllowed: true,
  }),
  pre_new_moon_light: L("pre_new_moon_light", {
    timeWindow: "12:00–13:30",
    items: [
      { product: "Лёгкий белок", amount_g: 90 },
      { product: "Овощи тушёные", amount_g: 250 },
    ],
    riceAllowed: false,
    meatAllowed: true,
  }),
};
