/**
 * Re-export facade — all logic lives in core/ modules.
 * This file exists for backward compatibility with API routes and tests.
 */

export { buildProtocol, buildCalendarMonth, getMealMatrices } from "../core/protocol/daily-protocol-builder";

import { NATAL } from "../core/profile/natal-profile";
import { NAKSHATRAS, NAK_SPAN, nakIndex, nakName, nakPada } from "../core/astrology/nakshatra";
import { elongation, tithi, illumination, phaseLabel, matrixIndex } from "../core/astrology/lunar-day";
import { computeSnap } from "../core/astrology/engine";
import { navamsaLongitude } from "../core/astrology/navamsa";
import { evaluateD1D9Alignment } from "../core/astrology/astro-alignment";
import { angleDist, findHits } from "../core/astrology/transit-modifiers";
import { computeScales, resolveDayType, clamp, ASPECT_RU, PLANET_RU } from "../core/protocol/rules";
import { MEALS, DAY_MATRIX, GRAIN_FORBIDDEN, pickMeal, decideRice, lunchTime } from "../core/protocol/meal-matrix";
import { BREATH_MAP } from "../core/protocol/breathing-rules";
import { selectMudra } from "../core/protocol/mudra-rules";
import { AROMAS } from "../core/protocol/aroma-rules";
import { THYROID_NOTES } from "../core/protocol/thyroid-safety";
import { EFFECTS } from "../core/protocol/daily-protocol-builder";
import { BREAKFAST, WEEKDAYS, ENDOLUTEN_ANCHOR, buildSupplements } from "../core/profile/fixed-rules";
import { interpretSignals } from "../core/tracking/signal-interpreter";
import { buildProtocol } from "../core/protocol/daily-protocol-builder";

function buildWarnings(dt: string, scales: { water_retention_risk: number; nervous_system_load: number }): string[] {
  const w: string[] = [];
  if (scales.water_retention_risk >= 65) w.push("Вечером посмотреть на лодыжки. Если отёк больше обычного — утром проверить зону под глазами.");
  if (scales.nervous_system_load >= 70) w.push("Вечером без лишнего кофеина. Только вечерний слот добавок (магний, ГАМК, 5-HTP).");
  if (dt === "ekadashi_day") w.push("Только вода — не есть после 18:00. Если тяжело, добавить тёплой воды малыми глотками, без соков и сладких напитков.");
  if (dt === "pradosh_day")
    w.push("Вечером не принимать серьёзных решений и не ввязываться в споры. Пищи по протоколу нет — нервная система чувствительнее.");
  if (dt === "pre_full_moon_retention_day") w.push("Полнолуние ухудшает сон. Никаких острых специй сверх фиксированного завтрака.");
  return w;
}

function buildTracking(dt: string, scales: { need_for_rhythm_precision: number }): string[] {
  const t = [
    "Лодыжки к вечеру — есть ли отёк, больше или меньше, чем вчера",
    "Глаза утром следующего дня — припухлость, мешки",
    "Тянет ли на плотную или солёную еду — записать, если да",
    "Голова перегружена или раздражительность — отметить уровень",
  ];
  if (scales.need_for_rhythm_precision >= 70) t.push("Обед точно по времени — сдвиг не больше 15 минут");
  if (dt === "recovery_day_after_reduction") t.push("Есть ли тяжесть в теле после вчерашней разгрузки");
  return t;
}

/** @internal — exported only for unit testing */
export const _testing = {
  NATAL, NAKSHATRAS, NAK_SPAN, MEALS, DAY_MATRIX, GRAIN_FORBIDDEN,
  BREATH_MAP, AROMAS, EFFECTS, THYROID_NOTES, BREAKFAST,
  ENDOLUTEN_ANCHOR, WEEKDAYS, ASPECT_RU, PLANET_RU,
  elongation, tithi, illumination, phaseLabel, matrixIndex,
  nakIndex, nakName, nakPada,
  computeSnap, findHits, angleDist,
  navamsaLongitude, evaluateD1D9Alignment,
  computeScales, clamp,
  resolveDayType,
  decideRice, pickMeal, lunchTime,
  selectMudra,
  interpretSignals,
  buildSupplements, buildWarnings, buildTracking,
};
