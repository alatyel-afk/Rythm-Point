import type { SignalRuleId } from "./protocol-types";

/** Порядок оценки: раньше в списке — выше приоритет (первое совпадение побеждает). */
export const rulePriority: SignalRuleId[] = [
  "ekadashi_day",
  "pradosh_day",
  "pre_full_moon_retention",
  "pre_new_moon_tail",
  "ankle_swelling",
  "eye_swelling",
  "low_energy_with_swelling",
  "mental_overheat",
  "poor_sleep",
  "salt_craving",
  "sweet_craving_on_fatigue",
  "tissue_heaviness",
  "waning_mid_cycle_drainage",
  "day_after_ekadashi",
  "low_energy_no_swelling",
  "stable_state",
  "baseline_no_signals",
];
