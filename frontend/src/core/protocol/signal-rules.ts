import type { SignalRule } from "./protocol-types";
import { SIGNAL_BASELINE_SELF_ASSESSMENT_HINT_RU } from "./protocol-ui-texts";

export const signalRules: SignalRule[] = [
  {
    id: "stable_state",
    signal: "stable_state",
    condition: {
      and: [
        { field: "ankleSwellingEvening", op: "lte", value: 1 },
        { field: "eyeSwellingMorning", op: "lte", value: 1 },
        { field: "mentalOverload", op: "lte", value: 2 },
        { field: "energy", op: "gte", value: 3 },
      ],
    },
    lunchTemplateIds: ["stable_chicken", "stable_veal"],
    breathingTemplateIds: ["sama_vritti_6"],
    loadTemplateId: "normal_walk",
    warning: "держать обычный ритм, не утяжелять обед без причины",
  },
  {
    id: "mental_overheat",
    signal: "mental_overheat",
    condition: {
      and: [
        { field: "mentalOverload", op: "gte", value: 4 },
        { field: "ankleSwellingEvening", op: "lte", value: 2 },
      ],
    },
    lunchTemplateIds: ["retention_chicken", "retention_veal"],
    breathingTemplateIds: ["bhramari_5", "extended_exhale_8"],
    loadTemplateId: "reduced_load",
    warning: "не компенсировать перегрев плотной едой и рисом",
  },
  {
    id: "ankle_swelling",
    signal: "ankle_swelling",
    condition: {
      field: "ankleSwellingEvening",
      op: "gte",
      value: 3,
    },
    lunchTemplateIds: ["retention_chicken", "retention_veal"],
    breathingTemplateIds: ["diaphragmatic_8"],
    loadTemplateId: "soft_movement",
    warning: "рис убрать, обед раньше, не сидеть долго без движения",
  },
  {
    id: "eye_swelling",
    signal: "eye_swelling",
    condition: {
      field: "eyeSwellingMorning",
      op: "gte",
      value: 3,
    },
    lunchTemplateIds: ["retention_veal", "retention_chicken"],
    breathingTemplateIds: ["extended_exhale_8"],
    loadTemplateId: "soft_movement",
    warning: "не допускать вечерней плотной еды и поздней жидкости",
  },
  {
    id: "poor_sleep",
    signal: "poor_sleep",
    condition: {
      and: [
        { field: "sleepQuality", op: "lte", value: 2 },
        { field: "energy", op: "lte", value: 2 },
      ],
    },
    lunchTemplateIds: ["retention_chicken"],
    breathingTemplateIds: ["sama_vritti_6"],
    loadTemplateId: "reduced_load",
    warning: "не добирать усталость едой; рис только если отеков нет",
  },
  {
    id: "low_energy_no_swelling",
    signal: "low_energy_no_swelling",
    condition: {
      and: [
        { field: "energy", op: "lte", value: 2 },
        { field: "ankleSwellingEvening", op: "lte", value: 1 },
        { field: "eyeSwellingMorning", op: "lte", value: 1 },
      ],
    },
    lunchTemplateIds: ["low_energy_rice_chicken", "low_energy_rice_veal"],
    breathingTemplateIds: ["full_soft_6"],
    loadTemplateId: "normal_walk",
    warning: "рис допустим малой порцией только при отсутствии отеков",
  },
  {
    id: "low_energy_with_swelling",
    signal: "low_energy_with_swelling",
    condition: {
      and: [
        { field: "energy", op: "lte", value: 2 },
        {
          or: [
            { field: "ankleSwellingEvening", op: "gte", value: 2 },
            { field: "eyeSwellingMorning", op: "gte", value: 2 },
          ],
        },
      ],
    },
    lunchTemplateIds: ["retention_veal", "retention_chicken"],
    breathingTemplateIds: ["extended_exhale_8"],
    loadTemplateId: "soft_movement",
    warning: "не путать дефицит энергии с правом на плотный обед; рис запрещен",
  },
  {
    id: "ekadashi_day",
    signal: "ekadashi_day",
    condition: {
      field: "ekadashiFlag",
      op: "true",
      value: true,
    },
    lunchTemplateIds: ["ekadashi_veg"],
    breathingTemplateIds: ["sama_vritti_8"],
    loadTemplateId: "very_light",
    warning: "день уменьшения: не компенсировать вечером",
  },
  {
    id: "day_after_ekadashi",
    signal: "day_after_ekadashi",
    condition: {
      field: "dayAfterEkadashiFlag",
      op: "true",
      value: true,
    },
    lunchTemplateIds: ["stable_chicken", "stable_veal"],
    breathingTemplateIds: ["sama_vritti_6"],
    loadTemplateId: "normal_walk",
    warning: "не делать откат в плотную или наградную еду",
  },
  {
    id: "pradosh_day",
    signal: "pradosh_day",
    condition: {
      field: "pradoshFlag",
      op: "true",
      value: true,
    },
    lunchTemplateIds: ["pradosh_chicken", "pradosh_veal"],
    breathingTemplateIds: ["extended_exhale_8"],
    loadTemplateId: "reduced_load",
    warning: "ранний обед без гарнира, удержание формы без отката",
  },
  {
    id: "pre_full_moon_retention",
    signal: "pre_full_moon_retention",
    condition: {
      field: "preFullMoonFlag",
      op: "true",
      value: true,
    },
    lunchTemplateIds: ["retention_veal", "retention_chicken"],
    breathingTemplateIds: ["bhramari_5", "extended_exhale_8"],
    loadTemplateId: "reduced_load",
    warning: "высокий риск задержки воды: рис запрещен, вечер спокойный",
  },
  {
    id: "waning_mid_cycle_drainage",
    signal: "waning_mid_cycle_drainage",
    condition: {
      and: [
        { field: "waningPhase", op: "true", value: true },
        { field: "lunarDay", op: "gte", value: 17 },
        { field: "lunarDay", op: "lte", value: 24 },
      ],
    },
    lunchTemplateIds: ["retention_chicken", "retention_veal"],
    breathingTemplateIds: ["diaphragmatic_8"],
    loadTemplateId: "normal_walk",
    warning: "хорошее окно для выведения воды без жесткости",
  },
  {
    id: "pre_new_moon_tail",
    signal: "pre_new_moon_tail",
    condition: {
      field: "preNewMoonFlag",
      op: "true",
      value: true,
    },
    lunchTemplateIds: ["pre_new_moon_light"],
    breathingTemplateIds: ["diaphragmatic_8"],
    loadTemplateId: "very_light",
    warning: "уменьшать шум и объем, но не голодать",
  },
  {
    id: "salt_craving",
    signal: "salt_craving",
    condition: {
      field: "saltCraving",
      op: "gte",
      value: 4,
    },
    lunchTemplateIds: ["retention_chicken", "retention_veal"],
    breathingTemplateIds: ["extended_exhale_6"],
    loadTemplateId: "normal_walk",
    warning: "не компенсировать тягой к соленому; соусы и сыр исключить",
  },
  {
    id: "sweet_craving_on_fatigue",
    signal: "sweet_craving_on_fatigue",
    condition: {
      and: [
        { field: "sweetCraving", op: "gte", value: 4 },
        { field: "energy", op: "lte", value: 2 },
      ],
    },
    lunchTemplateIds: ["stable_chicken", "low_energy_rice_chicken"],
    breathingTemplateIds: ["sama_vritti_6"],
    loadTemplateId: "normal_walk",
    warning: "рис возможен только если нет отеков; не добирать усталость сладким",
  },
  {
    id: "tissue_heaviness",
    signal: "tissue_heaviness",
    condition: {
      field: "tissueHeaviness",
      op: "gte",
      value: 3,
    },
    lunchTemplateIds: ["retention_chicken", "retention_veal"],
    breathingTemplateIds: ["diaphragmatic_8"],
    loadTemplateId: "soft_movement",
    warning: "тело уже держит: нужен ранний чистый обед без гарнира",
  },
  {
    id: "baseline_no_signals",
    signal: "baseline_no_signals",
    condition: { and: [] },
    lunchTemplateIds: ["stable_chicken", "stable_veal"],
    breathingTemplateIds: ["sama_vritti_6"],
    loadTemplateId: "normal_walk",
    warning: SIGNAL_BASELINE_SELF_ASSESSMENT_HINT_RU,
  },
];
