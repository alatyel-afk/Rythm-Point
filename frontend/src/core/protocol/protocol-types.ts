export type LunchTemplateId =
  | "stable_chicken"
  | "stable_veal"
  | "retention_chicken"
  | "retention_veal"
  | "low_energy_rice_chicken"
  | "low_energy_rice_veal"
  | "ekadashi_veg"
  | "pradosh_chicken"
  | "pradosh_veal"
  | "pre_new_moon_light";

export type BreathingTemplateId =
  | "sama_vritti_6"
  | "sama_vritti_8"
  | "extended_exhale_6"
  | "extended_exhale_8"
  | "bhramari_5"
  | "diaphragmatic_8"
  | "full_soft_6";

export type LoadTemplateId =
  | "normal_walk"
  | "reduced_load"
  | "soft_movement"
  | "very_light";

export type SignalRuleId =
  | "stable_state"
  | "mental_overheat"
  | "ankle_swelling"
  | "eye_swelling"
  | "poor_sleep"
  | "low_energy_no_swelling"
  | "low_energy_with_swelling"
  | "ekadashi_day"
  | "day_after_ekadashi"
  | "pradosh_day"
  | "pre_full_moon_retention"
  | "waning_mid_cycle_drainage"
  | "pre_new_moon_tail"
  | "salt_craving"
  | "sweet_craving_on_fatigue"
  | "tissue_heaviness"
  /** Запасной матч, если ни одно условие не выполнилось (например, нет записи самочувствия). */
  | "baseline_no_signals";

export type Comparator = "eq" | "gte" | "lte" | "true" | "false";

export interface LunchItem {
  product: string;
  amount_g: number;
}

export interface LunchTemplate {
  id: LunchTemplateId;
  timeWindow: string;
  items: LunchItem[];
  riceAllowed: boolean;
  meatAllowed?: boolean;
}

export interface BreathingTemplate {
  id: BreathingTemplateId;
  practice: string;
  durationMin: number;
  time: string;
}

export interface LoadTemplate {
  id: LoadTemplateId;
  mode: string;
  description: string;
}

export interface BodySignals {
  ankleSwellingEvening?: number;
  eyeSwellingMorning?: number;
  mentalOverload?: number;
  sleepQuality?: number;
  saltCraving?: number;
  sweetCraving?: number;
  tissueHeaviness?: number;
  energy?: number;
}

export interface DayContext {
  ekadashiFlag?: boolean;
  pradoshFlag?: boolean;
  dayAfterEkadashiFlag?: boolean;
  preFullMoonFlag?: boolean;
  preNewMoonFlag?: boolean;
  waningPhase?: boolean;
  lunarDay?: number;
}

export interface ConditionNode {
  field?: keyof (BodySignals & DayContext);
  op?: Comparator;
  value?: number | boolean;
  and?: ConditionNode[];
  or?: ConditionNode[];
}

/** Порядок оценки задаётся отдельно (`rule-priority.ts`), не полем в объекте. */
export interface SignalRule {
  id: SignalRuleId;
  signal: string;
  condition: ConditionNode;
  lunchTemplateIds: LunchTemplateId[];
  breathingTemplateIds: BreathingTemplateId[];
  loadTemplateId: LoadTemplateId;
  warning: string;
}

export interface ProtocolEngineInput {
  date: string;
  bodySignals: BodySignals;
  dayContext: DayContext;
}

export interface ProtocolEngineOutput {
  date: string;
  matched_rule: string;
  rule_trace: string[];
  lunch_template: LunchTemplate;
  breathing_template: BreathingTemplate;
  load_template: LoadTemplate;
  warning: string;
  notes: string;
}

export type RuleEvaluationContext = BodySignals & DayContext;
