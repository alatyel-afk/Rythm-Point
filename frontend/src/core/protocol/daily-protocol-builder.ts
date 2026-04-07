import type { DailyProtocol, CalendarDay, BodySignal } from "../../lib/api";
import { computeSnap } from "../astrology/engine";
import { findHits } from "../astrology/transit-modifiers";
import { matrixIndex } from "../astrology/lunar-day";
import { computeScales, resolveDayType, clamp } from "./rules";
import type { Scales, DayType } from "./rules";
import { MEALS, DAY_MATRIX, pickMeal, decideRice, lunchTime } from "./meal-matrix";
import { BREATH_MAP } from "./breathing-rules";
import { selectMudra } from "./mudra-rules";
import { AROMAS } from "./aroma-rules";
import { THYROID_NOTES } from "./thyroid-safety";
import { BREAKFAST, WEEKDAYS, buildSupplements } from "../profile/fixed-rules";
import { interpretSignals } from "../tracking/signal-interpreter";
import { mealMatrixLabel } from "@/lib/meal-matrix-labels";

const LOAD_MAP: Record<DayType, { profile: string; detail: string }> = {
  stable_day: { profile: "moderate", detail: "25 минут умеренно + 25 минут ходьбы." },
  drainage_day: { profile: "lymph_stretch", detail: "Сухая щётка 5 мин + ноги вверх 12 мин + растяжка 10 мин." },
  caution_day: { profile: "no_overload", detail: "Только мягкое движение и прогулка 35 мин, без силовых." },
  high_sensitivity_day: { profile: "no_overload", detail: "Прогулка 35 мин + мягкая мобилизация грудного отдела." },
  ekadashi_day: { profile: "lymph_stretch", detail: "Прогулка 30 мин + растяжка 20 мин, мягко." },
  pradosh_day: { profile: "no_overload", detail: "Ходьба 30 мин + мягкая мобилизация стоп." },
  recovery_day_after_reduction: { profile: "walk_soft", detail: "45 мин ходьбы ровным темпом." },
  pre_full_moon_retention_day: { profile: "no_overload", detail: "Только прогулка 35 мин, без силовых и прыжков." },
  pre_new_moon_precision_day: { profile: "walk_soft", detail: "50 мин ходьбы суммарно, без ускорений." },
};

const EFFECTS: Record<DayType, string> = {
  stable_day: "Сегодня тело легче держит форму, если не утяжелять обед.",
  drainage_day: "Хороший день для выведения лишней воды. Обед ранний и лёгкий, больше движения, без обезвоживания.",
  caution_day: "Одновременно высокий риск отёков и перегруз нервной системы. Обед лёгкий, без гарнира, нагрузку снизить.",
  high_sensitivity_day: "Нервная система перегружена. Обед проще, порции меньше, дыхание на успокоение.",
  ekadashi_day: "Экадаши — обед без мяса, порции меньше. Горячая вода, дыхание. Не голодать до срыва вечером.",
  pradosh_day: "Прадош — ранний обед с мясом, но без гарнира. Вечером не компенсировать усталость едой.",
  recovery_day_after_reduction: "Вчера была разгрузка. Сегодня не увеличивать порции и не добавлять новые продукты.",
  pre_full_moon_retention_day: "Канун полнолуния — тело копит воду. Без гарнира, без соусов, без жареного. Обед лёгкий.",
  pre_new_moon_precision_day: "Канун новолуния — важно не сбить режим. Обед ровный и предсказуемый, время еды без сдвигов.",
};

function buildWarnings(dt: DayType, scales: Scales): string[] {
  const w: string[] = [];
  if (scales.water_retention_risk >= 65) w.push("Вечером посмотреть на лодыжки. Если отёк больше обычного — утром проверить зону под глазами.");
  if (scales.nervous_system_load >= 70) w.push("Вечером без лишнего кофеина. Только вечерний слот добавок (магний, ГАМК, 5-HTP).");
  if (dt === "ekadashi_day") w.push("Голод — не повод есть после 18:00. Если тяжело — горячая вода.");
  if (dt === "pradosh_day") w.push("Вечером не принимать серьёзных решений и не ввязываться в споры. Желудок пустой, нервная система на взводе.");
  if (dt === "pre_full_moon_retention_day") w.push("Полнолуние ухудшает сон. Никаких острых специй сверх фиксированного завтрака.");
  return w;
}

function buildTracking(dt: DayType, scales: Scales): string[] {
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

export function buildProtocol(dateStr: string, bodySignals?: BodySignal | null): DailyProtocol {
  const d = new Date(dateStr + "T12:00:00");
  const doy = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);

  const snap = computeSnap(d);
  const hits = findHits(snap);

  const prevD = new Date(d.getTime() - 86400000);
  const prevSnap = computeSnap(prevD);
  const prevReduction = prevSnap.isEkadashi || prevSnap.isPradosh;

  const { scales: baseScales, trace: scalesTrace } = computeScales(snap, hits, prevReduction);

  const ov = bodySignals ? interpretSignals(bodySignals) : null;
  const scales: Scales = ov ? {
    water_retention_risk: clamp(baseScales.water_retention_risk + ov.scaleDeltas.wr),
    release_drainage_potential: clamp(baseScales.release_drainage_potential + ov.scaleDeltas.rel),
    nervous_system_load: clamp(baseScales.nervous_system_load + ov.scaleDeltas.nrv),
    need_for_rhythm_precision: clamp(baseScales.need_for_rhythm_precision + ov.scaleDeltas.rhy),
  } : baseScales;

  if (ov) {
    scalesTrace.pop();
    scalesTrace.push(`Самочувствие сдвинуло шкалы: задержка +${ov.scaleDeltas.wr}, выведение +${ov.scaleDeltas.rel}, нервы +${ov.scaleDeltas.nrv}, режим +${ov.scaleDeltas.rhy}`);
    scalesTrace.push(`Итого: задержка ${scales.water_retention_risk}, выведение ${scales.release_drainage_potential}, нервная нагрузка ${scales.nervous_system_load}, режим ${scales.need_for_rhythm_precision}`);
  }

  const { dayType, trace: dtTrace } = resolveDayType(scales, snap, prevReduction);

  let matrix = DAY_MATRIX[dayType];
  const mmTrace = [`По типу дня подобран обед: ${mealMatrixLabel(matrix)}`];

  if (ov?.forceRetentionMatrix && matrix !== "C_retention" && matrix !== "D_ekadashi") {
    matrix = "C_retention";
    mmTrace.push("Лодыжки отекли — обед переключён на лёгкий вариант при отёках");
  }
  if (ov?.reduceMealComplexity && matrix === "A_stable") {
    matrix = "B_nervous";
    mmTrace.push("Голова перегружена — полноценный обед заменён на более простой");
  }

  const rice = decideRice(dayType, scales);
  if (ov?.forceNoRice && rice.allowed) {
    rice.allowed = false;
    rice.reason = "Отёк под глазами утром — гарнир и тяжёлая еда исключены.";
    rice.trace.push("Отёк под глазами — гарнир запрещён");
  }
  if (ov?.riceConditionallyAllowed && !rice.allowed && dayType === "stable_day" && !ov.forceNoRice && !ov.forceRetentionMatrix) {
    rice.allowed = true;
    rice.reason = "Мало сил, отёков нет — малая порция крупы допустима.";
    rice.trace.push("Мало сил, отёков нет — гарнир допустим в ровный день");
  }

  let finalMatrix = matrix;
  if (rice.allowed && finalMatrix !== "F_grain" && finalMatrix !== "D_ekadashi") {
    finalMatrix = "F_grain";
    mmTrace.push("Крупа разрешена по правилам дня — в обед добавлен гарнир");
  }
  const meal = pickMeal(finalMatrix, doy);
  mmTrace.push(`Итого: ${mealMatrixLabel(finalMatrix)}`);

  let br = BREATH_MAP[dayType];
  const breathTrace = [`По типу дня назначена практика: ${br.title}`];
  if (ov?.forceCalmBreathing && br.practice !== "bhramari" && br.practice !== "diaphragmatic") {
    if (scales.nervous_system_load >= 70) {
      br = BREATH_MAP.high_sensitivity_day;
      breathTrace.push("Голова сильно перегружена (нервная нагрузка ≥ 70) — переключено на бхрамари");
    } else {
      br = { practice: "lengthened_exhale", title: "Удлинённый выдох 1:2 (голова перегружена)", min: 10, time: "Как только почувствовали перегруз, но не позже 17:30.", posture: "Сидя с прямой спиной, стопы на полу.", technique: "Вдох через нос на 4 счёта. Выдох через нос на 8 счётов — очень плавно, без усилия.", tongue: "Кончик языка к верхнему нёбу.", contra: "Не делать на полный желудок. При головокружении — остановиться." };
      breathTrace.push("Голова перегружена — переключено на удлинённый выдох для успокоения");
    }
  }
  breathTrace.push(`Выбрано: ${br.title}, ${br.min} мин`);

  const highRetention = scales.water_retention_risk >= 65 || (ov?.forceRetentionMatrix ?? false);
  const { mudra, trace: mudraTrace } = selectMudra(dayType, highRetention);
  if (ov?.forceCalmBreathing && !mudra.suggested) {
    mudraTrace.push("Голова перегружена — рассматривается ваю-мудра");
    if (!highRetention) {
      Object.assign(mudra, {
        mudra: "vayu", suggested: true, name_ru: "Ваю-мудра", duration_minutes: 3,
        reason: "Голова перегружена — снижение напряжения.",
        finger_technique: "Указательный палец к основанию большого, большой прижимает сверху.",
        posture: "Сидя, руки на коленях.", breathing_during: "Ровное, 4:4.",
        tongue_position: "Язык свободно.", when_to_do: "При нервном напряжении, максимум 3 мин.",
        caution: "При тревоге сократить до 2 мин.",
      });
      mudraTrace.push("Голова перегружена, задержка невысокая — назначена ваю-мудра");
    }
  }

  let load = LOAD_MAP[dayType];
  const loadTrace = [`По типу дня назначена нагрузка: ${load.detail}`];
  if (ov?.noIntensifyExercise && load.profile === "moderate") {
    load = { profile: "walk_soft", detail: "Плохой сон — нагрузка снижена. Только ходьба 35 мин ровным темпом, без ускорений." };
    loadTrace.push("Плохой сон — умеренная нагрузка снижена до мягкой ходьбы");
  }
  if (ov?.noIntensifyExercise && load.profile === "lymph_stretch") {
    load = { ...load, detail: load.detail + " Без интенсивных элементов — плохой сон." };
    loadTrace.push("Плохой сон — интенсивные элементы убраны из растяжки");
  }

  let aroma = AROMAS[dayType];
  const aromaTrace = [`По типу дня выбраны ароматы`];
  if (ov?.forceCalmBreathing) {
    aroma = {
      morning: "rose", morning_detail: "Роза, 1 капля. Голова перегружена — никаких тонизирующих ароматов.",
      daytime: "anti_stress_blend", daytime_detail: "Смесь «Антистресс», 15–20 мин через аромалампу. Перегруз головы.",
      evening: "rose", evening_detail: "Роза, 1 капля. Вечером без стимуляции.",
    };
    aromaTrace.push("Голова перегружена — ароматы переключены на успокаивающие");
  }
  aromaTrace.push(`Утро: ${aroma.morning_detail}`, `День: ${aroma.daytime_detail}`, `Вечер: ${aroma.evening_detail}`);

  const warnings = buildWarnings(dayType, scales);
  if (ov?.forceRetentionMatrix) warnings.push("Лодыжки отекли — обед переведён на лёгкий вариант, без гарнира.");
  if (ov?.forceNoRice) warnings.push("Отёк под глазами — гарнир и тяжёлая еда исключены.");
  if (ov?.forceCalmBreathing) warnings.push("Голова перегружена — дыхание переключено на успокаивающее.");
  if (ov?.noIntensifyExercise) warnings.push("Плохой сон — без силовых, только ходьба.");

  const tracking = buildTracking(dayType, scales);
  if (ov?.forceRetentionMatrix) tracking.push("Лодыжки завтра утром — стало лучше или нет");
  if (ov?.forceCalmBreathing) tracking.push("Голова к вечеру — снизился ли перегруз после дыхания");
  if (bodySignals?.weight_kg) tracking.push(`Вес сегодня: ${bodySignals.weight_kg} кг — сравнить через 2 дня`);

  const lt = lunchTime(dayType);
  const thyroidTrace = [`Щитовидная железа: консервативный режим, ${THYROID_NOTES.length} ограничений`];

  return {
    date: dateStr,
    weekday: WEEKDAYS[d.getDay()],
    lunar_day_number: snap.tithi,
    moon_phase: snap.phase,
    nakshatra: snap.nakshatra,
    ekadashi_flag: snap.isEkadashi,
    pradosh_flag: snap.isPradosh,
    day_type: dayType,
    body_effect_summary: EFFECTS[dayType],
    nutrition: {
      breakfast: BREAKFAST,
      lunch: {
        matrix_used: finalMatrix,
        protein: meal.protein,
        vegetables: meal.vegetables,
        full_description: meal.full_description,
        time_window: lt.window,
        early_lunch: lt.early,
      },
      rice: { allowed: rice.allowed, reason: rice.reason },
      no_food_after_18: true,
    },
    supplements: buildSupplements(d),
    breathing_practice: {
      practice: br.practice, title_ru: br.title, minutes: br.min,
      best_time: br.time, posture: br.posture, technique: br.technique,
      tongue_position: br.tongue, contraindication: br.contra,
    },
    mudra_recommendation: mudra,
    aroma_protocol: aroma,
    movement_load: load,
    thyroid_safety_notes: { mode: "conservative_thyroid_safe", notes: THYROID_NOTES },
    body_markers_to_track: tracking,
    warnings,
    scales,
    moon_illumination_pct: Math.round(snap.illum * 1000) / 10,
    matrix_index: matrixIndex(snap.tithi),
    rule_trace: {
      day_type_rules: dtTrace,
      scales_modifiers: scalesTrace,
      rice_rules: rice.trace,
      breathing_rules: breathTrace,
      mudra_rules: mudraTrace,
      thyroid_rules: thyroidTrace,
      body_signal_rules: ov?.trace ?? ["Самочувствие не записано, протокол по умолчанию"],
      meal_matrix_rules: mmTrace,
      load_rules: loadTrace,
      aroma_rules: aromaTrace,
    },
  };
}

export function buildCalendarMonth(year: number, month: number): CalendarDay[] {
  const days: CalendarDay[] = [];
  const last = new Date(year, month, 0).getDate();
  for (let day = 1; day <= last; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const d = new Date(dateStr + "T12:00:00");
    const snap = computeSnap(d);
    const hits = findHits(snap);
    const prevD = new Date(d.getTime() - 86400000);
    const prevSnap = computeSnap(prevD);
    const prevReduction = prevSnap.isEkadashi || prevSnap.isPradosh;
    const { scales } = computeScales(snap, hits, prevReduction);
    const { dayType } = resolveDayType(scales, snap, prevReduction);
    days.push({
      date: dateStr,
      lunar_day_number: snap.tithi,
      nakshatra: snap.nakshatra,
      ekadashi_flag: snap.isEkadashi,
      pradosh_flag: snap.isPradosh,
      day_type: dayType,
      water_retention_risk: scales.water_retention_risk,
      release_drainage_potential: scales.release_drainage_potential,
      matrix_index: matrixIndex(snap.tithi),
    });
  }
  return days;
}

export function getMealMatrices(): Record<string, { protein: string; vegetables: string; full_description: string }[]> {
  return { ...MEALS };
}

export { LOAD_MAP, EFFECTS };
