const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export interface RiceDecision {
  allowed: boolean;
  reason: string;
}

export interface LunchSpec {
  matrix_used: string;
  protein: string;
  vegetables: string;
  full_description: string;
  time_window: string;
  early_lunch: boolean;
}

export interface SupplementSlot {
  time: string;
  items: string;
}

export interface DailyProtocol {
  date: string;
  weekday: string;
  lunar_day_number: number;
  moon_phase: string;
  nakshatra: string;
  ekadashi_flag: boolean;
  pradosh_flag: boolean;
  day_type: string;
  body_effect_summary: string;
  nutrition: {
    breakfast: string;
    lunch: LunchSpec;
    rice: RiceDecision;
    no_food_after_18: boolean;
  };
  supplements: {
    slots: SupplementSlot[];
    endoluten_today: boolean;
    endoluten_note: string;
  };
  breathing_practice: {
    practice: string;
    title_ru: string;
    minutes: number;
    best_time: string;
    posture: string;
    technique: string;
    tongue_position: string;
    contraindication: string;
  };
  mudra_recommendation: {
    mudra: string;
    suggested: boolean;
    name_ru: string;
    duration_minutes: number;
    reason: string;
    finger_technique: string;
    posture: string;
    breathing_during: string;
    tongue_position: string;
    when_to_do: string;
    caution: string;
  };
  aroma_protocol: {
    morning: string;
    morning_detail: string;
    daytime: string;
    daytime_detail: string;
    evening: string;
    evening_detail: string;
  };
  movement_load: {
    profile: string;
    detail: string;
  };
  thyroid_safety_notes: {
    mode: string;
    notes: string[];
  };
  body_markers_to_track: string[];
  warnings: string[];
  scales: {
    water_retention_risk: number;
    release_drainage_potential: number;
    nervous_system_load: number;
    need_for_rhythm_precision: number;
  };
  moon_illumination_pct: number;
  matrix_index: number;
  rule_trace: RuleTrace;
}

export interface RuleTrace {
  day_type_rules: string[];
  scales_modifiers: string[];
  rice_rules: string[];
  breathing_rules: string[];
  mudra_rules: string[];
  thyroid_rules: string[];
  body_signal_rules: string[];
  meal_matrix_rules: string[];
  load_rules: string[];
  aroma_rules: string[];
}

export interface CalendarDay {
  date: string;
  lunar_day_number: number;
  nakshatra: string;
  ekadashi_flag: boolean;
  pradosh_flag: boolean;
  day_type: string;
  water_retention_risk: number;
  release_drainage_potential: number;
  matrix_index: number;
}

export interface BodySignal {
  day_date: string;
  ankles_evening?: number | null;
  eye_area_morning?: number | null;
  weight_kg?: number | null;
  tissue_density?: number | null;
  head_overload?: number | null;
  sleep_quality?: number | null;
  sweet_craving?: number | null;
  salty_craving?: number | null;
  energy_level?: number | null;
  notes?: string | null;
}

export interface NutritionLog {
  day_date: string;
  lunch_type?: string | null;
  had_rice?: boolean | null;
  heaviness?: number | null;
  rebound_after_ekadashi_pradosh?: boolean | null;
  notes?: string | null;
}

export interface BodySignalWithContext {
  signal: BodySignal;
  nutrition?: NutritionLog | null;
  tithi_number?: number | null;
  nakshatra_ru?: string | null;
  day_kind?: string | null;
  water_retention_risk?: number | null;
  release_drainage_potential?: number | null;
  nervous_system_load?: number | null;
}

export const api = {
  getToday: (on?: string) =>
    get<DailyProtocol>(`/today${on ? `?on=${on}` : ""}`),
  getCalendar: (year: number, month: number) =>
    get<CalendarDay[]>(`/calendar?year=${year}&month=${month}`),
  getLunarMatrix: () =>
    get<Record<string, { protein: string; vegetables: string; full_description: string }[]>>("/lunar-matrix"),
  postBodySignal: (entry: BodySignal) =>
    post<BodySignal>("/body-signals", entry),
  getBodySignal: (d: string) =>
    get<BodySignal>(`/body-signals/${d}`),
  postNutritionLog: (entry: NutritionLog) =>
    post<NutritionLog>("/nutrition-log", entry),
  getHistory: (from: string, to: string) =>
    get<BodySignalWithContext[]>(`/history?from_date=${from}&to_date=${to}`),
};
