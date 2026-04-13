"""
Deterministic recommendation engine.
No LLM.  No vague text.  Every field concrete.
Builds DailyProtocol from: astro snapshot + natal + body signals + fixed rules.
Every decision is recorded in RuleTrace.

This module is the protocol layer.  It consumes data from the astrology engine
but does NOT compute planetary positions itself.
"""

from dataclasses import asdict
from datetime import date, timedelta
from typing import Any

from app.domain.models.body_signals import BodySignalEntry
from app.domain.models.enums import (
    AyanamshaMode,
    DayType,
    LoadProfile,
    MealMatrix,
)
from app.domain.models.natal import NatalChartD1, default_user_natal
from app.domain.models.protocol import (
    CalendarDaySummary,
    DailyProtocol,
    DailyScales,
    LoadBlock,
    LunchSpec,
    NutritionBlock,
    RuleTrace,
)
from app.domain.services.astro_alignment_rules import evaluate_d1_d9_alignment
from app.domain.services.aroma_selector import select_aroma
from app.domain.services.astro_math import tithi_to_matrix_index
from app.domain.services.astro_models import TransitHit, TransitSnapshot
from app.domain.services.body_signal_interpreter import SignalOverride, interpret_signals
from app.domain.services.breath_selector import select_breathing
from app.domain.services.meal_matrices import pick_meal
from app.domain.services.meal_matrix_labels_ru import meal_matrix_label_ru
from app.domain.services.mudra_selector import select_mudra
from app.domain.services.rice_policy import decide_rice
from app.domain.services.supplements import (
    WATER_ONLY_FAST_DAY_TEXT,
    build_supplements,
    build_supplements_water_fast_day,
)
from app.domain.services.thyroid_safety import THYROID_NOTES, build_thyroid_safety

_WEEKDAY_RU = ("понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье")
_BREAKFAST = (
    "Утром горячая вода. "
    "Завтрак: 1 яйцо с жидким желтком, 1 банан или 2 финика, 5 черри, 25–30 г листового салата. "
    "По желанию к салату — 30–40 г адыгейского сыра. "
    "После еды кофе с кардамоном, гвоздикой, молотым чёрным перцем (специя), мускатным орехом и корицей — не путать с овощным сладким перцем в обеде."
)


def _clamp(x: int) -> int:
    return max(0, min(100, x))


# ── Scales ──────────────────────────────────────────────

def _compute_scales(
    snap: TransitSnapshot,
    transit_hits: list[TransitHit],
    prev_was_reduction: bool,
    lunar_day: int,
) -> tuple[DailyScales, list[str]]:
    wr = 50
    rel = 50
    nrv = 50
    rhy = 50
    trace: list[str] = ["SCALES: base wr=50 rel=50 nrv=50 rhy=50"]

    if lunar_day in (7, 14, 21, 27):
        wr += 10
        trace.append(f"SCALES: lunar_day={lunar_day} in (7,14,21,27) → wr+10")
    if lunar_day in (8, 17, 25):
        rel += 8
        trace.append(f"SCALES: lunar_day={lunar_day} in (8,17,25) → rel+8")
    if lunar_day in (5, 10, 15, 24):
        nrv += 6
        trace.append(f"SCALES: lunar_day={lunar_day} in (5,10,15,24) → nrv+6")
    if lunar_day in (4, 9, 18, 26):
        rhy += 6
        trace.append(f"SCALES: lunar_day={lunar_day} in (4,9,18,26) → rhy+6")

    if snap.is_ekadashi:
        rel += 14; wr -= 8; rhy += 6
        trace.append("SCALES: is_ekadashi=True → rel+14 wr-8 rhy+6")
    if snap.is_pradosh_day:
        nrv += 6; rhy += 5; rel += 6
        trace.append("SCALES: is_pradosh_day=True → nrv+6 rhy+5 rel+6")
    if prev_was_reduction:
        rel -= 6; wr += 5; nrv += 4
        trace.append("SCALES: prev_was_reduction=True → rel-6 wr+5 nrv+4")

    illum = snap.moon_illumination
    if illum > 0.85:
        wr += 8; nrv += 5
        trace.append(f"SCALES: moon_illumination={illum:.2f} > 0.85 → wr+8 nrv+5")
    elif illum < 0.15:
        rhy += 8; nrv += 4
        trace.append(f"SCALES: moon_illumination={illum:.2f} < 0.15 → rhy+8 nrv+4")

    for h in transit_hits:
        tgt = h.natal_target
        mover = h.transit_planet
        asp = h.aspect
        if tgt == "moon" and mover == "Saturn" and asp == "conjunction":
            wr += 12; nrv += 10; rhy += 8
            trace.append("SCALES: transit Saturn conjunction natal Moon → wr+12 nrv+10 rhy+8")
        if tgt == "moon" and mover in {"Rahu", "Ketu"} and asp in {"conjunction", "opposition"}:
            nrv += 8; wr += 6
            trace.append(f"SCALES: transit {mover} {asp} natal Moon → nrv+8 wr+6")
        if tgt == "mercury" and mover == "Mars" and asp == "square":
            nrv += 7; rhy += 6
            trace.append("SCALES: transit Mars square natal Mercury → nrv+7 rhy+6")
        if tgt == "venus" and mover == "Saturn" and asp == "conjunction":
            wr += 8; rel += 4
            trace.append("SCALES: transit Saturn conjunction natal Venus → wr+8 rel+4")
        if tgt == "mars" and mover == "Saturn" and asp in {"square", "opposition"}:
            wr += 5; nrv += 6
            trace.append(f"SCALES: transit Saturn {asp} natal Mars → wr+5 nrv+6")
        if tgt == "moon" and mover == "Jupiter" and asp == "trine":
            rel += 5; nrv -= 4
            trace.append("SCALES: transit Jupiter trine natal Moon → rel+5 nrv-4")

    final = DailyScales(
        water_retention_risk=_clamp(wr),
        release_drainage_potential=_clamp(rel),
        nervous_system_load=_clamp(nrv),
        need_for_rhythm_precision=_clamp(rhy),
    )
    trace.append(
        f"SCALES: final wr={final.water_retention_risk} rel={final.release_drainage_potential} "
        f"nrv={final.nervous_system_load} rhy={final.need_for_rhythm_precision}"
    )
    return final, trace


# ── Day type ────────────────────────────────────────────

def _resolve_day_type(
    scales: DailyScales,
    snap: TransitSnapshot,
    prev_was_reduction: bool,
) -> tuple[DayType, list[str]]:
    trace: list[str] = []

    if snap.is_ekadashi:
        trace.append("DAY_TYPE: is_ekadashi=True → ekadashi_day")
        return DayType.ekadashi_day, trace
    if snap.is_pradosh_day:
        trace.append("DAY_TYPE: is_pradosh_day=True → pradosh_day")
        return DayType.pradosh_day, trace
    if prev_was_reduction:
        trace.append("DAY_TYPE: prev_was_reduction=True → recovery_day_after_reduction")
        return DayType.recovery_day_after_reduction, trace

    if snap.moon_illumination > 0.85:
        trace.append(f"DAY_TYPE: moon_illumination={snap.moon_illumination:.2f} > 0.85 → pre_full_moon_retention_day")
        return DayType.pre_full_moon_retention_day, trace
    if snap.moon_illumination < 0.15:
        trace.append(f"DAY_TYPE: moon_illumination={snap.moon_illumination:.2f} < 0.15 → pre_new_moon_precision_day")
        return DayType.pre_new_moon_precision_day, trace

    if scales.water_retention_risk >= 72 and scales.nervous_system_load >= 68:
        trace.append(f"DAY_TYPE: wr={scales.water_retention_risk} >= 72 AND nrv={scales.nervous_system_load} >= 68 → caution_day")
        return DayType.caution_day, trace
    if scales.nervous_system_load >= 75 or scales.need_for_rhythm_precision >= 78:
        trace.append(f"DAY_TYPE: nrv={scales.nervous_system_load} >= 75 OR rhy={scales.need_for_rhythm_precision} >= 78 → high_sensitivity_day")
        return DayType.high_sensitivity_day, trace
    if scales.release_drainage_potential >= 72 and scales.water_retention_risk <= 55:
        trace.append(f"DAY_TYPE: rel={scales.release_drainage_potential} >= 72 AND wr={scales.water_retention_risk} <= 55 → drainage_day")
        return DayType.drainage_day, trace

    trace.append("DAY_TYPE: no special conditions → stable_day")
    return DayType.stable_day, trace


# ── Meal matrix selection ───────────────────────────────

_DAY_TO_MATRIX: dict[DayType, MealMatrix] = {
    DayType.stable_day: MealMatrix.A_STABLE,
    DayType.drainage_day: MealMatrix.C_RETENTION,
    DayType.caution_day: MealMatrix.C_RETENTION,
    DayType.high_sensitivity_day: MealMatrix.B_NERVOUS,
    DayType.ekadashi_day: MealMatrix.D_EKADASHI,
    DayType.pradosh_day: MealMatrix.E_PRADOSH,
    DayType.recovery_day_after_reduction: MealMatrix.A_STABLE,
    DayType.pre_full_moon_retention_day: MealMatrix.C_RETENTION,
    DayType.pre_new_moon_precision_day: MealMatrix.B_NERVOUS,
}


def _select_meal_matrix(day_type: DayType) -> MealMatrix:
    return _DAY_TO_MATRIX[day_type]


# ── Lunch time ──────────────────────────────────────────

def _lunch_time(day_type: DayType) -> tuple[str, bool]:
    if day_type in (DayType.ekadashi_day, DayType.pradosh_day):
        return "без приёма пищи — только вода", False
    early_types = {DayType.pre_full_moon_retention_day, DayType.drainage_day}
    if day_type in early_types:
        return "12:15–12:45", True
    if day_type in (DayType.caution_day, DayType.pre_new_moon_precision_day):
        return "12:30–13:00", True
    return "13:00–13:30", False


# ── Load ────────────────────────────────────────────────

_DAY_LOAD: dict[DayType, tuple[LoadProfile, str]] = {
    DayType.stable_day: (LoadProfile.moderate, "25 минут умеренно + 25 минут ходьбы."),
    DayType.drainage_day: (LoadProfile.lymph_stretch, "Сухая щётка 5 мин + ноги вверх 12 мин + растяжка 10 мин."),
    DayType.caution_day: (LoadProfile.no_overload, "Только мягкое движение и прогулка 35 мин, без силовых."),
    DayType.high_sensitivity_day: (LoadProfile.no_overload, "Прогулка 35 мин + мягкая мобилизация грудного отдела."),
    DayType.ekadashi_day: (LoadProfile.lymph_stretch, "Прогулка 30 мин + растяжка 20 мин, мягко."),
    DayType.pradosh_day: (LoadProfile.no_overload, "Ходьба 30 мин + мягкая мобилизация стоп."),
    DayType.recovery_day_after_reduction: (LoadProfile.walk_soft, "45 мин ходьбы ровным темпом, без новых упражнений."),
    DayType.pre_full_moon_retention_day: (LoadProfile.no_overload, "Только прогулка 35 мин, без силовых и прыжков."),
    DayType.pre_new_moon_precision_day: (LoadProfile.walk_soft, "50 мин ходьбы суммарно, без ускорений."),
}


# ── Body effect summary ─────────────────────────────────

_EFFECT: dict[DayType, str] = {
    DayType.stable_day: "Сегодня тело легче держит форму, если не утяжелять обед.",
    DayType.drainage_day: "День мягкого высвобождения: ранний обед, движение, без обезвоживания.",
    DayType.caution_day: "Повышенная осторожность: выше риск задержки + нервная нагрузка одновременно.",
    DayType.high_sensitivity_day: "Высокая чувствительность нервной системы: упрощённый обед, дыхание на снижение.",
    DayType.ekadashi_day: "Экадаши: без пищи, только вода; дыхание и мягкое движение; вечером без компенсации.",
    DayType.pradosh_day: "Прадоша: без пищи, только вода; вечер без споров и без компенсации едой.",
    DayType.recovery_day_after_reduction: "Восстановление: без скачка порций, без новых продуктов.",
    DayType.pre_full_moon_retention_day: "Полнолуние: усилена чувствительность к водному балансу, без соусов и жареного.",
    DayType.pre_new_moon_precision_day: "Новолуние: точность ритма критична, обед ровный и предсказуемый.",
}


# ── Warnings ────────────────────────────────────────────

def _build_warnings(day_type: DayType, scales: DailyScales, signal_ov: SignalOverride) -> list[str]:
    w: list[str] = []
    if scales.water_retention_risk >= 65:
        w.append("Проверить лодыжки вечером. Если отёк заметнее — завтра оценить область глаз утром.")
    if scales.nervous_system_load >= 70:
        w.append("Снизить стимуляцию вечером: только вечерние добавки по слоту, без кофеина сверх завтрака.")
    if day_type == DayType.ekadashi_day:
        w.append(
            "Только вода — не есть после 18:00. Если тяжело, тёплая вода малыми глотками, без соков и сладких напитков."
        )
    if day_type == DayType.pradosh_day:
        w.append("Вечером без споров; пищи по протоколу нет — нервная система чувствительнее.")
    if day_type == DayType.pre_full_moon_retention_day:
        w.append("Полнолуние влияет на сон: без острых специй сверх фиксированного завтрака.")
    w.extend(signal_ov.extra_warnings)
    return w


# ── Tracking ────────────────────────────────────────────

def _build_tracking(day_type: DayType, scales: DailyScales, signal_ov: SignalOverride) -> list[str]:
    t = [
        "Лодыжки к вечеру",
        "Область глаз утром следующего дня",
        "Тяга к плотной и солёной пище",
        "Перегруз головы и раздражительность",
    ]
    if scales.need_for_rhythm_precision >= 70:
        t.append("Точность времени обеда (сдвиг не больше 15 мин)")
    if day_type == DayType.recovery_day_after_reduction:
        t.append("Тяжесть в теле после вчерашнего разгрузочного дня")
    t.extend(signal_ov.extra_tracking)
    return t


# ══════════════════════════════════════════════════════════
#  PUBLIC API
# ══════════════════════════════════════════════════════════

class RecommendationEngine:
    def __init__(self, astro: Any | None = None) -> None:
        if astro is None:
            from app.domain.services.astrology_engine import AstrologyEngine
            astro = AstrologyEngine()
        self.astro = astro

    def build_protocol(
        self,
        d: date,
        timezone: str,
        natal: NatalChartD1 | None = None,
        ayanamsha: AyanamshaMode = AyanamshaMode.LAHIRI,
        body_signals: BodySignalEntry | None = None,
        *,
        include_debug: bool = False,
    ) -> DailyProtocol:
        natal = natal or default_user_natal()

        snap = self.astro.compute_snapshot(d, timezone, ayanamsha)
        prev_snap = self.astro.compute_snapshot(d - timedelta(days=1), timezone, ayanamsha)
        prev_reduction = bool(prev_snap.is_ekadashi or prev_snap.is_pradosh_day)

        analysis = self.astro.analyze_transits_to_natal(snap, natal)
        mx = tithi_to_matrix_index(snap.tithi)

        scales, scales_trace = _compute_scales(snap, analysis.hits, prev_reduction, snap.tithi)
        scales_trace.pop()

        astro_alignment, align_deltas = evaluate_d1_d9_alignment(natal, snap)
        scales = DailyScales(
            water_retention_risk=_clamp(scales.water_retention_risk + int(round(align_deltas.wr))),
            release_drainage_potential=_clamp(scales.release_drainage_potential + int(round(align_deltas.rel))),
            nervous_system_load=_clamp(scales.nervous_system_load + int(round(align_deltas.nrv))),
            need_for_rhythm_precision=_clamp(scales.need_for_rhythm_precision + int(round(align_deltas.rhy))),
        )
        if any((align_deltas.wr, align_deltas.rel, align_deltas.nrv, align_deltas.rhy)):
            scales_trace.append(
                "Сверка D1/D9 (Луна, Солнце, натал vs транзит): Δ задержка "
                f"{align_deltas.wr:.0f}, Δ выведение {align_deltas.rel:.0f}, "
                f"Δ нервы {align_deltas.nrv:.0f}, Δ режим {align_deltas.rhy:.0f}"
            )
        scales_trace.append(
            "Натал vs транзит: Луна D1 "
            f"{astro_alignment.natal_moon.d1_nak} / D9 {astro_alignment.natal_moon.d9_nak} → "
            f"транзит D1 {astro_alignment.transit_moon.d1_nak} / D9 {astro_alignment.transit_moon.d9_nak}; "
            "Солнце D1 "
            f"{astro_alignment.natal_sun.d1_nak} / D9 {astro_alignment.natal_sun.d9_nak} → "
            f"транзит D1 {astro_alignment.transit_sun.d1_nak} / D9 {astro_alignment.transit_sun.d9_nak}"
        )
        scales_trace.append(
            "Итого после сверки D1/D9: задержка "
            f"{scales.water_retention_risk}, выведение {scales.release_drainage_potential}, "
            f"нервная нагрузка {scales.nervous_system_load}, режим {scales.need_for_rhythm_precision}"
        )

        day_type, dt_trace = _resolve_day_type(scales, snap, prev_reduction)

        sig_ov = interpret_signals(body_signals)
        if sig_ov.force_day_type:
            dt_trace.append(f"DAY_TYPE: body signal override → {sig_ov.force_day_type.value}")
            day_type = sig_ov.force_day_type

        # Meal matrix
        mm_trace: list[str] = []
        if sig_ov.force_meal_matrix:
            meal_matrix = sig_ov.force_meal_matrix
            mm_trace.append(f"По самочувствию выбран обед: {meal_matrix_label_ru(meal_matrix)}")
        else:
            meal_matrix = _select_meal_matrix(day_type)
            mm_trace.append(f"По типу дня подобран обед: {meal_matrix_label_ru(meal_matrix)}")

        rice, rice_trace = decide_rice(day_type, scales, sig_ov)

        if rice.allowed and meal_matrix != MealMatrix.F_RICE:
            mm_trace.append("Крупа разрешена по правилам дня — в обед добавлен гарнир")
            meal_matrix = MealMatrix.F_RICE

        meal = pick_meal(meal_matrix, d.timetuple().tm_yday)
        mm_trace.append(
            f"Итого: {meal_matrix_label_ru(meal_matrix)} — {meal.protein} + {meal.vegetables}"
        )

        time_win, early = _lunch_time(day_type)

        mental_high = (body_signals.head_overload or 0) >= 4 if body_signals else False
        breath, breath_trace = select_breathing(day_type, mental_overload=mental_high)
        if day_type in (DayType.ekadashi_day, DayType.pradosh_day):
            breath = breath.model_copy(
                update={
                    "best_time": "Когда удобно днём — без привязки к обеду (пищи по протоколу нет, только вода).",
                },
            )

        mudra, mudra_trace = select_mudra(
            day_type,
            high_retention_risk=scales.water_retention_risk >= 65,
            high_head_pressure=mental_high,
            low_energy_no_swelling=(
                body_signals is not None
                and (body_signals.energy_level or 3) <= 2
                and (body_signals.ankles_evening or 0) < 3
            ),
        )

        aroma, aroma_trace = select_aroma(day_type)

        # Load
        load_trace: list[str] = []
        load_profile, load_detail = _DAY_LOAD[day_type]
        load_trace.append(f"LOAD: day_type={day_type.value} → profile={load_profile.value}")
        if sig_ov.reduce_exercise:
            load_trace.append("LOAD: body signal reduce_exercise=True → override to walk_soft")
            load_profile = LoadProfile.walk_soft
            load_detail = "Нагрузка снижена из-за плохого сна: только мягкая ходьба 30 мин."
        load_trace.append(f"LOAD: final={load_profile.value}")

        # Thyroid
        thyroid = build_thyroid_safety()
        thyroid_trace = [f"THYROID: mode=conservative_thyroid_safe, {len(THYROID_NOTES)} rules active"]
        for note in THYROID_NOTES:
            thyroid_trace.append(f"THYROID: → {note}")

        warnings = _build_warnings(day_type, scales, sig_ov)
        tracking = _build_tracking(day_type, scales, sig_ov)

        alignment_rules = [
            astro_alignment.summary,
            *astro_alignment.checks,
            "Рекомендации по набору продуктов (обед) строятся после этой сверки и применённых к шкалам поправок.",
        ]

        rule_trace = RuleTrace(
            day_type_rules=dt_trace,
            scales_modifiers=scales_trace,
            rice_rules=rice_trace,
            breathing_rules=breath_trace,
            mudra_rules=mudra_trace,
            thyroid_rules=thyroid_trace,
            body_signal_rules=sig_ov.trace,
            meal_matrix_rules=mm_trace,
            load_rules=load_trace,
            aroma_rules=aroma_trace,
            alignment_rules=alignment_rules,
        )

        debug_info: dict[str, Any] | None = None
        if include_debug:
            debug_info = {
                "jd_ut": snap.jd_ut,
                "snapshot": asdict(snap),
                "transits": asdict(analysis),
                "signal_override": asdict(sig_ov) if body_signals else None,
            }

        water_fast = day_type in (DayType.ekadashi_day, DayType.pradosh_day)
        breakfast_txt = WATER_ONLY_FAST_DAY_TEXT if water_fast else _BREAKFAST
        supp_block = build_supplements_water_fast_day(d) if water_fast else build_supplements(d)

        return DailyProtocol(
            date=d,
            weekday=_WEEKDAY_RU[d.weekday()],
            lunar_day_number=snap.tithi,
            moon_phase=snap.moon_phase_ru,
            nakshatra=snap.nakshatra_name,
            ekadashi_flag=snap.is_ekadashi,
            pradosh_flag=snap.is_pradosh_day,
            day_type=day_type,
            body_effect_summary=_EFFECT[day_type],
            nutrition=NutritionBlock(
                breakfast=breakfast_txt,
                lunch=LunchSpec(
                    matrix_used=meal_matrix,
                    protein=meal.protein,
                    vegetables=meal.vegetables,
                    full_description=meal.full_description,
                    time_window=time_win,
                    early_lunch=early,
                ),
                rice=rice,
            ),
            supplements=supp_block,
            breathing_practice=breath,
            mudra_recommendation=mudra,
            aroma_protocol=aroma,
            movement_load=LoadBlock(profile=load_profile, detail=load_detail),
            thyroid_safety_notes=thyroid,
            body_markers_to_track=tracking,
            warnings=warnings,
            scales=scales,
            moon_illumination_pct=round(snap.moon_illumination * 100, 1),
            matrix_index=mx,
            astro_alignment=astro_alignment,
            rule_trace=rule_trace,
            debug=debug_info,
        )

    def build_calendar_month(
        self,
        year: int,
        month: int,
        timezone: str,
        natal: NatalChartD1 | None = None,
        ayanamsha: AyanamshaMode = AyanamshaMode.LAHIRI,
    ) -> list[CalendarDaySummary]:
        from calendar import monthrange

        natal = natal or default_user_natal()
        _, last = monthrange(year, month)
        out: list[CalendarDaySummary] = []
        for day_num in range(1, last + 1):
            d = date(year, month, day_num)
            snap = self.astro.compute_snapshot(d, timezone, ayanamsha)
            prev_snap = self.astro.compute_snapshot(d - timedelta(days=1), timezone, ayanamsha)
            prev_red = bool(prev_snap.is_ekadashi or prev_snap.is_pradosh_day)
            analysis = self.astro.analyze_transits_to_natal(snap, natal)
            scales, _ = _compute_scales(snap, analysis.hits, prev_red, snap.tithi)
            dt, _ = _resolve_day_type(scales, snap, prev_red)
            out.append(CalendarDaySummary(
                date=d,
                lunar_day_number=snap.tithi,
                nakshatra=snap.nakshatra_name,
                ekadashi_flag=snap.is_ekadashi,
                pradosh_flag=snap.is_pradosh_day,
                day_type=dt,
                water_retention_risk=scales.water_retention_risk,
                release_drainage_potential=scales.release_drainage_potential,
                matrix_index=tithi_to_matrix_index(snap.tithi),
            ))
        return out
