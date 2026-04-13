import type {
  BodySignals,
  DayContext,
  SignalRuleId,
  LunchTemplateId,
  BreathingTemplateId,
  LoadTemplateId,
} from "./protocol-rules";
import type { Scales, DayType } from "./rules";

import { toFive } from "@/lib/utils";
import { resolveDailyProtocol } from "./rule-engine";
import {
  buildRussianUiProtocol,
  formatSupplementsBlock,
  SIGNAL_BASELINE_SELF_ASSESSMENT_HINT_RU,
} from "./protocol-ui-texts";

export interface DailyMeta {
  date: string;
  /** Ключ по-английски (monday … sunday) или уже русское слово из WEEKDAYS — см. weekdayToRussian */
  weekday: string;
  lunarDayNumber?: number;
  moonPhaseLabel?: string;
  nakshatraLabel?: string;
  ekadashiFlag?: boolean;
  pradoshFlag?: boolean;
}

export interface DailyScores {
  waterRetentionRisk: 1 | 2 | 3 | 4 | 5;
  drainagePotential: 1 | 2 | 3 | 4 | 5;
  nervousSystemLoad: 1 | 2 | 3 | 4 | 5;
  rhythmPrecisionNeed: 1 | 2 | 3 | 4 | 5;
}

export interface DailyStatusBadge {
  label: string;
  tone: "neutral" | "info" | "good" | "warning" | "danger";
}

export interface DailyProtocolUi {
  meta: {
    date: string;
    weekday: string;
    lunarDayText: string;
    moonPhaseText: string;
    nakshatraText: string;
    badges: DailyStatusBadge[];
  };
  summary: {
    title: string;
    bodyEffect: string;
    warning: string;
  };
  scores: DailyScores;
  protocol: {
    breakfast: string;
    lunchTitle: string;
    lunchText: string;
    supplements: string[];
    breathingTitle: string;
    breathingText: string;
    loadTitle: string;
    loadText: string;
  };
  safety: {
    thyroidSafetyTitle: string;
    thyroidSafetyText: string;
  };
  tracking: {
    title: string;
    markers: string[];
  };
  technical: {
    matchedRule: string;
    ruleTrace: string[];
    templateIds: {
      lunchTemplateId: string;
      breathingTemplateId: string;
      loadTemplateId: string;
    };
  };
}

function weekdayToRussian(weekday: string): string {
  const map: Record<string, string> = {
    monday: "Понедельник",
    tuesday: "Вторник",
    wednesday: "Среда",
    thursday: "Четверг",
    friday: "Пятница",
    saturday: "Суббота",
    sunday: "Воскресенье",
  };

  const lower = weekday.toLowerCase();
  if (map[lower]) return map[lower];
  if (/^[а-яё]+$/i.test(weekday.trim())) {
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }
  return weekday;
}

function buildBadges(meta: DailyMeta, matchedRule: SignalRuleId): DailyStatusBadge[] {
  const badges: DailyStatusBadge[] = [];

  if (meta.ekadashiFlag) {
    badges.push({ label: "Экадаши", tone: "info" });
  }

  if (meta.pradoshFlag) {
    badges.push({ label: "Прадош", tone: "warning" });
  }

  const ruleBadgeMap: Partial<Record<SignalRuleId, DailyStatusBadge>> = {
    stable_state: { label: "Устойчивый день", tone: "neutral" },
    mental_overheat: { label: "Перегрев головы", tone: "warning" },
    ankle_swelling: { label: "Удержание в тканях", tone: "danger" },
    eye_swelling: { label: "Риск отека лица", tone: "danger" },
    poor_sleep: { label: "После плохого сна", tone: "warning" },
    low_energy_no_swelling: { label: "Низкая энергия", tone: "info" },
    low_energy_with_swelling: { label: "Слабость и удержание", tone: "danger" },
    ekadashi_day: { label: "День уменьшения", tone: "good" },
    day_after_ekadashi: { label: "День закрепления", tone: "neutral" },
    pradosh_day: { label: "Удержание формы", tone: "warning" },
    pre_full_moon_retention: { label: "Канун полнолуния", tone: "danger" },
    waning_mid_cycle_drainage: { label: "Окно выведения", tone: "good" },
    pre_new_moon_tail: { label: "Предноволунный хвост", tone: "warning" },
    salt_craving: { label: "Тяга к соленому", tone: "warning" },
    sweet_craving_on_fatigue: { label: "Тяга к сладкому", tone: "warning" },
    tissue_heaviness: { label: "Плотность тканей", tone: "danger" },
    baseline_no_signals: { label: "Без записи самочувствия", tone: "neutral" },
  };

  const mainBadge = ruleBadgeMap[matchedRule];
  if (mainBadge) {
    badges.push(mainBadge);
  }

  return badges;
}

function buildScores(matchedRule: SignalRuleId): DailyScores {
  const scoreMap: Partial<Record<SignalRuleId, DailyScores>> = {
    stable_state: {
      waterRetentionRisk: 2,
      drainagePotential: 3,
      nervousSystemLoad: 2,
      rhythmPrecisionNeed: 3,
    },
    mental_overheat: {
      waterRetentionRisk: 4,
      drainagePotential: 2,
      nervousSystemLoad: 5,
      rhythmPrecisionNeed: 5,
    },
    ankle_swelling: {
      waterRetentionRisk: 5,
      drainagePotential: 2,
      nervousSystemLoad: 3,
      rhythmPrecisionNeed: 5,
    },
    eye_swelling: {
      waterRetentionRisk: 5,
      drainagePotential: 2,
      nervousSystemLoad: 3,
      rhythmPrecisionNeed: 5,
    },
    poor_sleep: {
      waterRetentionRisk: 4,
      drainagePotential: 2,
      nervousSystemLoad: 4,
      rhythmPrecisionNeed: 5,
    },
    low_energy_no_swelling: {
      waterRetentionRisk: 2,
      drainagePotential: 3,
      nervousSystemLoad: 3,
      rhythmPrecisionNeed: 4,
    },
    low_energy_with_swelling: {
      waterRetentionRisk: 4,
      drainagePotential: 2,
      nervousSystemLoad: 4,
      rhythmPrecisionNeed: 5,
    },
    ekadashi_day: {
      waterRetentionRisk: 1,
      drainagePotential: 5,
      nervousSystemLoad: 2,
      rhythmPrecisionNeed: 4,
    },
    day_after_ekadashi: {
      waterRetentionRisk: 3,
      drainagePotential: 3,
      nervousSystemLoad: 2,
      rhythmPrecisionNeed: 4,
    },
    pradosh_day: {
      waterRetentionRisk: 4,
      drainagePotential: 3,
      nervousSystemLoad: 3,
      rhythmPrecisionNeed: 5,
    },
    pre_full_moon_retention: {
      waterRetentionRisk: 5,
      drainagePotential: 1,
      nervousSystemLoad: 4,
      rhythmPrecisionNeed: 5,
    },
    waning_mid_cycle_drainage: {
      waterRetentionRisk: 2,
      drainagePotential: 5,
      nervousSystemLoad: 2,
      rhythmPrecisionNeed: 4,
    },
    pre_new_moon_tail: {
      waterRetentionRisk: 4,
      drainagePotential: 4,
      nervousSystemLoad: 3,
      rhythmPrecisionNeed: 5,
    },
    salt_craving: {
      waterRetentionRisk: 4,
      drainagePotential: 2,
      nervousSystemLoad: 3,
      rhythmPrecisionNeed: 5,
    },
    sweet_craving_on_fatigue: {
      waterRetentionRisk: 3,
      drainagePotential: 2,
      nervousSystemLoad: 4,
      rhythmPrecisionNeed: 4,
    },
    tissue_heaviness: {
      waterRetentionRisk: 5,
      drainagePotential: 2,
      nervousSystemLoad: 3,
      rhythmPrecisionNeed: 5,
    },
    baseline_no_signals: {
      waterRetentionRisk: 2,
      drainagePotential: 3,
      nervousSystemLoad: 2,
      rhythmPrecisionNeed: 3,
    },
  };

  return scoreMap[matchedRule] ?? scoreMap.stable_state!;
}

function buildTrackingMarkers(matchedRule: SignalRuleId): string[] {
  const defaultMarkers = [
    "лодыжки к вечеру",
    "область под глазами утром",
    "тяга к соленому",
    "тяга к сладкому",
    "уровень энергии",
    "перегрев головы",
  ];

  const ruleSpecific: Partial<Record<SignalRuleId, string[]>> = {
    mental_overheat: [
      "внутренняя спешка",
      "насколько хочется плотной еды ради успокоения",
      "стало ли тише в голове после дыхания",
    ],
    ankle_swelling: [
      "плотность обуви к вечеру",
      "ощущение тяжести в голенях",
      "реакция на ранний обед",
    ],
    eye_swelling: [
      "лицо утром следующего дня",
      "ощущение плотности под глазами",
      "влияние спокойного вечера",
    ],
    poor_sleep: [
      "не появилась ли тяга к углеводной компенсации",
      "упала ли ясность после обеда",
      "не усилились ли отеки к вечеру",
    ],
    ekadashi_day: [
      "не тянет ли вечером компенсировать едой",
      "как ведет себя тело утром следующего дня",
      "стало ли легче по тканям",
    ],
    pradosh_day: [
      "не пошел ли откат по еде",
      "лодыжки к вечеру",
      "ощущение собранности тела",
    ],
    pre_full_moon_retention: [
      "лицо к вечеру",
      "лодыжки к вечеру",
      "ощущение телесной плотности",
    ],
    pre_new_moon_tail: [
      "усталость",
      "желание добрать сил едой",
      "реакция на минимализм в обеде",
    ],
  };

  return [...defaultMarkers, ...(ruleSpecific[matchedRule] ?? [])];
}

function buildThyroidSafetyText(): string {
  return "Держим консервативный режим: стабильное время еды, без экспериментов с добавками и без стимуляторного форсажа.";
}

function buildLunarDayText(lunarDayNumber?: number): string {
  return lunarDayNumber ? `${lunarDayNumber} лунный день` : "Лунный день не рассчитан";
}

function buildMoonPhaseText(moonPhaseLabel?: string): string {
  return moonPhaseLabel ?? "Фаза Луны не рассчитана";
}

function buildNakshatraText(nakshatraLabel?: string): string {
  return nakshatraLabel ?? "Накшатра не рассчитана";
}

export interface BuildDailyProtocolInput {
  meta: DailyMeta;
  bodySignals: BodySignals;
  context: DayContext;
  hasCombinedZincSelenium?: boolean;
}

/** Правила, сработавшие по шкалам самочувствия (не календарные). */
const SELF_REPORT_ADJUST_RULES: ReadonlySet<SignalRuleId> = new Set([
  "mental_overheat",
  "ankle_swelling",
  "eye_swelling",
  "poor_sleep",
  "low_energy_no_swelling",
  "low_energy_with_swelling",
  "salt_craving",
  "sweet_craving_on_fatigue",
  "tissue_heaviness",
]);

const DAY_TYPE_STATUS_BADGE: Record<DayType, DailyStatusBadge> = {
  stable_day: { label: "устойчивый день", tone: "neutral" },
  drainage_day: { label: "день дренажа", tone: "info" },
  caution_day: { label: "день осторожности", tone: "warning" },
  high_sensitivity_day: { label: "чувствительный день", tone: "warning" },
  ekadashi_day: { label: "экадаши", tone: "good" },
  pradosh_day: { label: "прадош", tone: "warning" },
  recovery_day_after_reduction: { label: "день восстановления", tone: "neutral" },
  pre_full_moon_retention_day: { label: "канун полнолуния", tone: "danger" },
  pre_new_moon_precision_day: { label: "канун новолуния", tone: "warning" },
};

const LOAD_PROFILE_LABEL_RU: Record<string, string> = {
  walk_soft: "мягкое движение",
  moderate: "умеренная нагрузка",
  lymph_stretch: "лимфодренаж + растяжка",
  no_overload: "без силовой нагрузки",
};

function scalesToSignalScores(scales: Scales): DailyScores {
  return {
    waterRetentionRisk: toFive(scales.water_retention_risk) as DailyScores["waterRetentionRisk"],
    drainagePotential: toFive(scales.release_drainage_potential) as DailyScores["drainagePotential"],
    nervousSystemLoad: toFive(scales.nervous_system_load) as DailyScores["nervousSystemLoad"],
    rhythmPrecisionNeed: toFive(scales.need_for_rhythm_precision) as DailyScores["rhythmPrecisionNeed"],
  };
}

function formatBreathingCanonical(bp: {
  title_ru: string;
  minutes: number;
  best_time: string;
  posture: string;
  technique: string;
  tongue_position: string;
  contraindication: string;
}): string {
  const lines = [
    `${bp.title_ru}, ${bp.minutes} мин, ${bp.best_time}.`,
    `Поза: ${bp.posture}`,
    `Техника: ${bp.technique}`,
    `Язык: ${bp.tongue_position}`,
  ];
  if (bp.contraindication?.trim()) lines.push(bp.contraindication);
  return lines.join("\n");
}

function formatMovementCanonical(profile: string, items: string[]): string {
  const head = LOAD_PROFILE_LABEL_RU[profile] ?? profile;
  return [head, ...items].join("\n");
}

function buildCanonicalSignalBadges(meta: DailyMeta, dayType: DayType, matchedRule: SignalRuleId): DailyStatusBadge[] {
  const badges: DailyStatusBadge[] = [];
  if (meta.ekadashiFlag && dayType !== "ekadashi_day") {
    badges.push({ label: "Экадаши", tone: "info" });
  }
  if (meta.pradoshFlag && dayType !== "pradosh_day") {
    badges.push({ label: "Прадош", tone: "warning" });
  }
  badges.push(DAY_TYPE_STATUS_BADGE[dayType]);
  if (SELF_REPORT_ADJUST_RULES.has(matchedRule)) {
    badges.push({ label: "Подстройка по самочувствию", tone: "info" });
  }
  return badges;
}

function signalSummaryWarning(matchedRule: SignalRuleId, engineWarning: string): string {
  if (matchedRule === "baseline_no_signals") return SIGNAL_BASELINE_SELF_ASSESSMENT_HINT_RU;
  if (SELF_REPORT_ADJUST_RULES.has(matchedRule) && engineWarning.trim()) return engineWarning;
  return "";
}

export interface AlignSignalProtocolCanonicalInput {
  matchedRule: SignalRuleId;
  dayType: DayType;
  scales: Scales;
  breakfast: string;
  lunchTitle: string;
  lunchText: string;
  supplementSlots: { time: string; items: string }[];
  breathing: {
    title_ru: string;
    minutes: number;
    best_time: string;
    posture: string;
    technique: string;
    tongue_position: string;
    contraindication: string;
  };
  movement: { profile: string; items: string[] };
  bodyEffectSummary: string;
  trackingMarkers: string[];
  engineWarning: string;
  meta: DailyMeta;
}

/** Синхронизирует блок «Сигнальный протокол» с расчётным протоколом (питание, дыхание, нагрузка, шкалы). */
export function alignSignalProtocolUiWithCanonical(
  base: DailyProtocolUi,
  input: AlignSignalProtocolCanonicalInput,
): DailyProtocolUi {
  const supplementLines = input.supplementSlots.map((s) => `${s.time}: ${s.items}`);

  return {
    ...base,
    meta: {
      ...base.meta,
      badges: buildCanonicalSignalBadges(input.meta, input.dayType, input.matchedRule),
    },
    summary: {
      title: "Протокол на сегодня",
      bodyEffect: input.bodyEffectSummary,
      warning: signalSummaryWarning(input.matchedRule, input.engineWarning),
    },
    scores: scalesToSignalScores(input.scales),
    protocol: {
      ...base.protocol,
      breakfast: input.breakfast,
      lunchTitle: input.lunchTitle,
      lunchText: input.lunchText,
      supplements: supplementLines,
      breathingTitle: base.protocol.breathingTitle,
      breathingText: formatBreathingCanonical(input.breathing),
      loadTitle: base.protocol.loadTitle,
      loadText: formatMovementCanonical(input.movement.profile, input.movement.items),
    },
    tracking: {
      ...base.tracking,
      markers: input.trackingMarkers,
    },
  };
}

export function buildDailyProtocolUi(input: BuildDailyProtocolInput): DailyProtocolUi {
  const { meta, bodySignals, context, hasCombinedZincSelenium = true } = input;

  const engineResult = resolveDailyProtocol({
    ...bodySignals,
    ...context,
    date: meta.date,
  });

  if (!engineResult) {
    throw new Error("Не удалось подобрать протокол дня: ни одно правило не сработало.");
  }

  const matchedRule = engineResult.matchedRule as SignalRuleId;
  const lunchTemplateId = engineResult.lunchTemplate.id as LunchTemplateId;
  const breathingTemplateId = engineResult.breathingTemplate.id as BreathingTemplateId;
  const loadTemplateId = engineResult.loadTemplate.id as LoadTemplateId;

  const uiTexts = buildRussianUiProtocol({
    matchedRule,
    lunchTemplateId,
    breathingTemplateId,
    loadTemplateId,
    warning: engineResult.warning,
  });

  const supplements = formatSupplementsBlock(hasCombinedZincSelenium);

  return {
    meta: {
      date: meta.date,
      weekday: weekdayToRussian(meta.weekday),
      lunarDayText: buildLunarDayText(meta.lunarDayNumber),
      moonPhaseText: buildMoonPhaseText(meta.moonPhaseLabel),
      nakshatraText: buildNakshatraText(meta.nakshatraLabel),
      badges: buildBadges(meta, matchedRule),
    },
    summary: {
      title: uiTexts.title,
      bodyEffect: uiTexts.bodyEffect,
      warning: uiTexts.warning,
    },
    scores: buildScores(matchedRule),
    protocol: {
      breakfast: uiTexts.breakfast,
      lunchTitle: uiTexts.lunchTitle,
      lunchText: uiTexts.lunchText,
      supplements,
      breathingTitle: uiTexts.breathingTitle,
      breathingText: uiTexts.breathingText,
      loadTitle: uiTexts.loadTitle,
      loadText: uiTexts.loadText,
    },
    safety: {
      thyroidSafetyTitle: "Защита щитовидной железы",
      thyroidSafetyText: buildThyroidSafetyText(),
    },
    tracking: {
      title: "Что отслеживать сегодня",
      markers: buildTrackingMarkers(matchedRule),
    },
    technical: {
      matchedRule,
      ruleTrace: engineResult.ruleTrace,
      templateIds: {
        lunchTemplateId,
        breathingTemplateId,
        loadTemplateId,
      },
    },
  };
}
