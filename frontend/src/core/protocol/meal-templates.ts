import type { LunchTemplate, LunchTemplateId } from "./protocol-types";

export const lunchTemplates: Record<LunchTemplateId, LunchTemplate> = {
  stable_chicken: {
    id: "stable_chicken",
    timeWindow: "13:00-14:30",
    items: [
      { product: "chicken", amount_g: 120 },
      { product: "zucchini", amount_g: 140 },
      { product: "broccoli", amount_g: 140 },
    ],
    riceAllowed: false,
  },

  stable_veal: {
    id: "stable_veal",
    timeWindow: "13:00-14:30",
    items: [
      { product: "veal", amount_g: 100 },
      { product: "cauliflower", amount_g: 160 },
      { product: "sweet_pepper", amount_g: 80 },
    ],
    riceAllowed: false,
  },

  retention_chicken: {
    id: "retention_chicken",
    timeWindow: "12:30-14:00",
    items: [
      { product: "chicken", amount_g: 100 },
      { product: "zucchini", amount_g: 140 },
      { product: "cauliflower", amount_g: 140 },
    ],
    riceAllowed: false,
  },

  retention_veal: {
    id: "retention_veal",
    timeWindow: "12:30-14:00",
    items: [
      { product: "veal", amount_g: 90 },
      { product: "broccoli", amount_g: 140 },
      { product: "asparagus", amount_g: 60 },
    ],
    riceAllowed: false,
  },

  low_energy_rice_chicken: {
    id: "low_energy_rice_chicken",
    timeWindow: "13:00-14:30",
    items: [
      { product: "chicken", amount_g: 120 },
      { product: "rice_with_pepper_mint", amount_g: 60 },
      { product: "zucchini", amount_g: 120 },
    ],
    riceAllowed: true,
  },

  low_energy_rice_veal: {
    id: "low_energy_rice_veal",
    timeWindow: "13:00-14:30",
    items: [
      { product: "veal", amount_g: 100 },
      { product: "rice_with_pepper_mint", amount_g: 50 },
      { product: "sweet_pepper", amount_g: 80 },
    ],
    riceAllowed: true,
  },

  ekadashi_veg: {
    id: "ekadashi_veg",
    timeWindow: "13:00-14:00",
    items: [
      { product: "zucchini", amount_g: 100 },
      { product: "cauliflower", amount_g: 100 },
      { product: "green_beans", amount_g: 80 },
      { product: "sweet_pepper", amount_g: 50 },
    ],
    riceAllowed: false,
    meatAllowed: false,
  },

  pradosh_chicken: {
    id: "pradosh_chicken",
    timeWindow: "12:30-14:00",
    items: [
      { product: "chicken", amount_g: 100 },
      { product: "zucchini", amount_g: 140 },
      { product: "cauliflower", amount_g: 140 },
    ],
    riceAllowed: false,
  },

  pradosh_veal: {
    id: "pradosh_veal",
    timeWindow: "12:30-14:00",
    items: [
      { product: "veal", amount_g: 90 },
      { product: "broccoli", amount_g: 140 },
      { product: "asparagus", amount_g: 60 },
    ],
    riceAllowed: false,
  },

  pre_new_moon_light: {
    id: "pre_new_moon_light",
    timeWindow: "12:00-13:30",
    items: [
      { product: "warm_vegetable_mix", amount_g: 220 },
      { product: "chicken", amount_g: 80 },
    ],
    riceAllowed: false,
  },
};
