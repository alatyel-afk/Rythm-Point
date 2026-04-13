"""
End-to-end pipeline integration tests.

Verifies the full rule pipeline:
  date → TransitSnapshot → scales → day_type → selectors → DailyProtocol

Uses manually constructed astro data (no pyswisseph required)
to test every connection between layers.

Run: PYTHONPATH=. python -m pytest tests/test_pipeline_integration.py -v
"""

from datetime import date

from app.domain.models.body_signals import BodySignalEntry
from app.domain.models.enums import (
    AromaSlot,
    BreathingPractice,
    DayType,
    LoadProfile,
    MealMatrix,
    MudraType,
)
from app.domain.models.natal import NatalChartD1, default_user_natal
from app.domain.models.protocol import DailyProtocol, DailyScales, RuleTrace
from app.domain.services.astro_math import (
    elongation_deg,
    moon_illumination_ratio,
    moon_phase_label_ru,
    nakshatra_pada,
    tithi_from_elongation,
    tithi_to_matrix_index,
)
from app.domain.services.astro_models import TransitAnalysis, TransitHit, TransitSnapshot
from app.domain.services.astrology_constants import (
    nakshatra_index_from_moon_longitude,
    nakshatra_name_ru,
)
from app.domain.services.aroma_selector import select_aroma
from app.domain.services.body_signal_interpreter import SignalOverride, interpret_signals
from app.domain.services.breath_selector import select_breathing
from app.domain.services.meal_matrices import pick_meal
from app.domain.services.mudra_selector import select_mudra
from app.domain.services.rice_policy import decide_rice
from app.domain.services.supplements import (
    WATER_ONLY_FAST_DAY_TEXT,
    build_supplements,
    build_supplements_water_fast_day,
)
from app.domain.services.thyroid_safety import build_thyroid_safety


# ── Helpers to simulate astro output ─────────────────────

def _make_snapshot(
    sun: float,
    moon: float,
    *,
    mars: float = 50.0,
    mercury: float = 25.0,
    jupiter: float = 185.0,
    venus: float = 50.0,
    saturn: float = 19.0,
    rahu: float = 315.0,
    ketu: float = 135.0,
) -> TransitSnapshot:
    """Build a TransitSnapshot from Sun/Moon longitudes (sidereal degrees).
    Other planets use defaults matching the natal chart neighborhood."""
    elong = elongation_deg(sun, moon)
    tithi = tithi_from_elongation(elong)
    nak_idx = nakshatra_index_from_moon_longitude(moon)
    return TransitSnapshot(
        jd_ut=2460400.0,
        sun_deg=sun,
        moon_deg=moon,
        mars_deg=mars,
        mercury_deg=mercury,
        jupiter_deg=jupiter,
        venus_deg=venus,
        saturn_deg=saturn,
        rahu_deg=rahu,
        ketu_deg=ketu,
        elong_deg=elong,
        tithi=tithi,
        nakshatra_index=nak_idx,
        nakshatra_name=nakshatra_name_ru(moon),
        nakshatra_pada=nakshatra_pada(moon),
        moon_illumination=moon_illumination_ratio(elong),
        moon_phase_ru=moon_phase_label_ru(elong),
        is_ekadashi=(tithi in (11, 26)),
        is_pradosh_day=(tithi in (13, 28)),
    )


def _make_analysis(
    snap: TransitSnapshot,
    natal: NatalChartD1,
    extra_hits: list[TransitHit] | None = None,
) -> TransitAnalysis:
    """Minimal transit analysis — no real aspect scanning, just the explicit hits."""
    return TransitAnalysis(
        saturn_to_lagna=None,
        saturn_to_moon=None,
        jupiter_to_lagna=None,
        jupiter_to_moon=None,
        rahu_to_lagna=None,
        rahu_to_moon=None,
        ketu_to_lagna=None,
        ketu_to_moon=None,
        hits=extra_hits or [],
    )


# ── Internal pipeline functions (imported from recommendation_engine) ─

from app.domain.services.recommendation_engine import (
    _build_tracking,
    _build_warnings,
    _clamp,
    _compute_scales,
    _DAY_LOAD,
    _DAY_TO_MATRIX,
    _EFFECT,
    _lunch_time,
    _resolve_day_type,
    _select_meal_matrix,
)


# ════════════════════════════════════════════════════════════
#  STAGE 1: Astro computation → TransitSnapshot
# ════════════════════════════════════════════════════════════

class TestStage1_AstroToSnapshot:

    def test_new_moon_snapshot(self):
        snap = _make_snapshot(sun=10.0, moon=10.0)
        assert snap.tithi == 1
        assert snap.moon_illumination < 0.01
        assert "новолуние" in snap.moon_phase_ru
        assert snap.is_ekadashi is False
        assert snap.is_pradosh_day is False

    def test_full_moon_snapshot(self):
        snap = _make_snapshot(sun=10.0, moon=190.0)
        assert snap.tithi == 16
        assert snap.moon_illumination > 0.99
        assert snap.is_ekadashi is False

    def test_ekadashi_snapshot(self):
        elong_for_11 = 10 * 12.0 + 6.0
        moon = (20.0 + elong_for_11) % 360.0
        snap = _make_snapshot(sun=20.0, moon=moon)
        assert snap.tithi == 11
        assert snap.is_ekadashi is True

    def test_krishna_ekadashi_snapshot_tithi_26(self):
        """Кришна-экадаши — 11-й титхи убывающей половины → номер 26 при нумерации 1–30."""
        moon = (20.0 + 300.0) % 360.0
        snap = _make_snapshot(sun=20.0, moon=moon)
        assert snap.tithi == 26
        assert snap.is_ekadashi is True

    def test_pradosh_snapshot(self):
        elong_for_13 = 12 * 12.0 + 6.0
        moon = (30.0 + elong_for_13) % 360.0
        snap = _make_snapshot(sun=30.0, moon=moon)
        assert snap.tithi == 13
        assert snap.is_pradosh_day is True

    def test_krishna_pradosh_snapshot_tithi_28(self):
        moon = (30.0 + 330.0) % 360.0
        snap = _make_snapshot(sun=30.0, moon=moon)
        assert snap.tithi == 28
        assert snap.is_pradosh_day is True

    def test_nakshatra_and_pada(self):
        snap = _make_snapshot(sun=10.0, moon=62.0)
        assert snap.nakshatra_name == "Мригашира"
        assert snap.nakshatra_pada in (1, 2, 3, 4)


# ════════════════════════════════════════════════════════════
#  STAGE 2: TransitSnapshot + TransitHits → DailyScales
# ════════════════════════════════════════════════════════════

class TestStage2_SnapshotToScales:

    def test_baseline_scales(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales, trace = _compute_scales(snap, [], False, snap.tithi)
        assert 0 <= scales.water_retention_risk <= 100
        assert 0 <= scales.release_drainage_potential <= 100
        assert 0 <= scales.nervous_system_load <= 100
        assert 0 <= scales.need_for_rhythm_precision <= 100
        assert any("SCALES: base" in t for t in trace)
        assert any("SCALES: final" in t for t in trace)

    def test_ekadashi_boosts_release(self):
        snap = _make_snapshot(sun=20.0, moon=(20.0 + 126.0) % 360.0)  # tithi=11
        assert snap.is_ekadashi
        scales, trace = _compute_scales(snap, [], False, snap.tithi)
        assert any("is_ekadashi=True" in t for t in trace)
        assert scales.release_drainage_potential >= 64  # 50 + 14

    def test_high_illumination_raises_retention(self):
        snap = _make_snapshot(sun=10.0, moon=192.0)  # near full moon
        assert snap.moon_illumination > 0.85
        scales, trace = _compute_scales(snap, [], False, snap.tithi)
        assert scales.water_retention_risk >= 58  # 50 + 8
        assert any("moon_illumination" in t for t in trace)

    def test_transit_saturn_conjunction_moon(self):
        natal = default_user_natal()
        hit = TransitHit(
            transit_planet="Saturn",
            aspect="conjunction",
            natal_target="moon",
            delta_deg=2.0,
        )
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales, trace = _compute_scales(snap, [hit], False, snap.tithi)
        assert scales.water_retention_risk >= 62  # 50 + 12
        assert scales.nervous_system_load >= 60  # 50 + 10
        assert any("Saturn conjunction natal Moon" in t for t in trace)

    def test_transit_jupiter_trine_moon_eases_stress(self):
        hit = TransitHit(
            transit_planet="Jupiter",
            aspect="trine",
            natal_target="moon",
            delta_deg=3.0,
        )
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales, trace = _compute_scales(snap, [hit], False, snap.tithi)
        assert scales.nervous_system_load <= 50  # 50 - 4
        assert any("Jupiter trine natal Moon" in t for t in trace)

    def test_prev_reduction_modifies_scales(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales, trace = _compute_scales(snap, [], True, snap.tithi)
        assert any("prev_was_reduction=True" in t for t in trace)
        assert scales.water_retention_risk >= 55  # 50 + 5

    def test_lunar_day_7_raises_retention(self):
        elong_for_7 = 6 * 12.0 + 6.0
        moon = (10.0 + elong_for_7) % 360.0
        snap = _make_snapshot(sun=10.0, moon=moon)
        assert snap.tithi == 7
        scales, trace = _compute_scales(snap, [], False, snap.tithi)
        assert scales.water_retention_risk >= 60  # 50 + 10
        assert any("lunar_day=7" in t for t in trace)


# ════════════════════════════════════════════════════════════
#  STAGE 3: DailyScales + TransitSnapshot → DayType
# ════════════════════════════════════════════════════════════

class TestStage3_ScalesToDayType:

    def test_ekadashi_always_wins(self):
        snap = _make_snapshot(sun=20.0, moon=(20.0 + 126.0) % 360.0)
        assert snap.is_ekadashi
        scales = DailyScales(water_retention_risk=90, release_drainage_potential=10,
                             nervous_system_load=90, need_for_rhythm_precision=90)
        dt, trace = _resolve_day_type(scales, snap, False)
        assert dt == DayType.ekadashi_day
        assert any("ekadashi" in t for t in trace)

    def test_pradosh_beats_scales(self):
        snap = _make_snapshot(sun=30.0, moon=(30.0 + 150.0) % 360.0)
        assert snap.is_pradosh_day
        scales = DailyScales(water_retention_risk=80, release_drainage_potential=10,
                             nervous_system_load=80, need_for_rhythm_precision=80)
        dt, trace = _resolve_day_type(scales, snap, False)
        assert dt == DayType.pradosh_day

    def test_prev_reduction_triggers_recovery(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales = DailyScales(water_retention_risk=30, release_drainage_potential=70,
                             nervous_system_load=30, need_for_rhythm_precision=30)
        dt, trace = _resolve_day_type(scales, snap, True)
        assert dt == DayType.recovery_day_after_reduction

    def test_high_illumination_triggers_pre_full_moon(self):
        snap = _make_snapshot(sun=10.0, moon=192.0)
        assert snap.moon_illumination > 0.85
        scales = DailyScales(water_retention_risk=50, release_drainage_potential=50,
                             nervous_system_load=50, need_for_rhythm_precision=50)
        dt, trace = _resolve_day_type(scales, snap, False)
        assert dt == DayType.pre_full_moon_retention_day

    def test_low_illumination_triggers_pre_new_moon(self):
        snap = _make_snapshot(sun=10.0, moon=14.0)  # very close to sun
        assert snap.moon_illumination < 0.15
        scales = DailyScales(water_retention_risk=50, release_drainage_potential=50,
                             nervous_system_load=50, need_for_rhythm_precision=50)
        dt, trace = _resolve_day_type(scales, snap, False)
        assert dt == DayType.pre_new_moon_precision_day

    def test_high_wr_and_nrv_triggers_caution(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales = DailyScales(water_retention_risk=75, release_drainage_potential=30,
                             nervous_system_load=70, need_for_rhythm_precision=50)
        dt, trace = _resolve_day_type(scales, snap, False)
        assert dt == DayType.caution_day

    def test_high_nrv_alone_triggers_sensitivity(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales = DailyScales(water_retention_risk=40, release_drainage_potential=50,
                             nervous_system_load=78, need_for_rhythm_precision=50)
        dt, trace = _resolve_day_type(scales, snap, False)
        assert dt == DayType.high_sensitivity_day

    def test_high_release_low_wr_triggers_drainage(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales = DailyScales(water_retention_risk=40, release_drainage_potential=75,
                             nervous_system_load=40, need_for_rhythm_precision=40)
        dt, trace = _resolve_day_type(scales, snap, False)
        assert dt == DayType.drainage_day

    def test_default_is_stable(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        scales = DailyScales(water_retention_risk=50, release_drainage_potential=50,
                             nervous_system_load=50, need_for_rhythm_precision=50)
        dt, trace = _resolve_day_type(scales, snap, False)
        assert dt == DayType.stable_day


# ════════════════════════════════════════════════════════════
#  STAGE 4: DayType → all 7 selectors
# ════════════════════════════════════════════════════════════

class TestStage4_DayTypeToSelectors:

    def test_every_day_type_has_meal_matrix(self):
        for dt in DayType:
            assert dt in _DAY_TO_MATRIX, f"Missing matrix for {dt.value}"

    def test_every_day_type_has_load(self):
        for dt in DayType:
            assert dt in _DAY_LOAD, f"Missing load for {dt.value}"

    def test_every_day_type_has_effect(self):
        for dt in DayType:
            assert dt in _EFFECT, f"Missing effect for {dt.value}"

    def test_selectors_return_trace_for_every_day_type(self):
        for dt in DayType:
            breath, bt = select_breathing(dt)
            assert len(bt) >= 2, f"Breath trace too short for {dt.value}"
            assert breath.minutes > 0

            mudra, mt = select_mudra(dt, False, False, False)
            assert len(mt) >= 1, f"Mudra trace too short for {dt.value}"

            aroma, at = select_aroma(dt)
            assert len(at) >= 3, f"Aroma trace too short for {dt.value}"

    def test_rice_policy_connected_to_day_type_and_scales(self):
        from app.domain.services.body_signal_interpreter import _EMPTY
        for dt in DayType:
            scales = DailyScales(water_retention_risk=40, release_drainage_potential=50,
                                 nervous_system_load=40, need_for_rhythm_precision=40)
            rice, trace = decide_rice(dt, scales, _EMPTY)
            assert isinstance(rice.allowed, bool)
            assert len(trace) >= 1


# ════════════════════════════════════════════════════════════
#  STAGE 5: Body signals override the pipeline
# ════════════════════════════════════════════════════════════

class TestStage5_BodySignalOverrides:

    def test_ankle_swelling_overrides_meal_matrix(self):
        sig = BodySignalEntry(day_date=date(2026, 6, 1), ankles_evening=4)
        ov = interpret_signals(sig)
        assert ov.force_meal_matrix == MealMatrix.C_RETENTION
        assert ov.force_rice_forbidden is True

    def test_mental_overload_forces_bhramari(self):
        sig = BodySignalEntry(day_date=date(2026, 6, 1), head_overload=5)
        ov = interpret_signals(sig)
        assert ov.reduce_meal_complexity is True
        breath, trace = select_breathing(DayType.stable_day, mental_overload=True)
        assert breath.practice == BreathingPractice.bhramari

    def test_low_sleep_reduces_load(self):
        sig = BodySignalEntry(day_date=date(2026, 6, 1), sleep_quality=1)
        ov = interpret_signals(sig)
        assert ov.reduce_exercise is True


# ════════════════════════════════════════════════════════════
#  STAGE 6: Full pipeline — snapshot → DailyProtocol
# ════════════════════════════════════════════════════════════

def _build_protocol_from_snapshot(
    d: date,
    snap: TransitSnapshot,
    analysis: TransitAnalysis,
    body_signals: BodySignalEntry | None = None,
) -> DailyProtocol:
    """
    Replicate the exact logic of RecommendationEngine.build_protocol(),
    but accept pre-built astro data instead of calling Swiss Ephemeris.
    This proves the pipeline connections are correct.
    """
    from app.domain.services.recommendation_engine import (
        _BREAKFAST,
        _WEEKDAY_RU,
    )
    from app.domain.models.protocol import (
        AlignmentScaleDeltas,
        AstroAlignment,
        LoadBlock,
        LunchSpec,
        LunarSolarNakPair,
        NutritionBlock,
        RuleTrace,
    )
    from app.domain.services.thyroid_safety import THYROID_NOTES
    from app.domain.services.meal_matrix_labels_ru import meal_matrix_label_ru

    mx = tithi_to_matrix_index(snap.tithi)

    scales, scales_trace = _compute_scales(snap, analysis.hits, False, snap.tithi)
    day_type, dt_trace = _resolve_day_type(scales, snap, False)

    sig_ov = interpret_signals(body_signals)
    if sig_ov.force_day_type:
        dt_trace.append(f"DAY_TYPE: body signal override → {sig_ov.force_day_type.value}")
        day_type = sig_ov.force_day_type

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

    doy = d.timetuple().tm_yday
    meal = pick_meal(meal_matrix, doy)
    mm_trace.append(f"Итого: {meal_matrix_label_ru(meal_matrix)} — {meal.protein} + {meal.vegetables}")

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
    load_profile, load_detail = _DAY_LOAD[day_type]
    load_trace = [f"LOAD: day_type={day_type.value} → {load_profile.value}"]
    if sig_ov.reduce_exercise:
        load_profile = LoadProfile.walk_soft
        load_detail = "Reduced due to poor sleep."
        load_trace.append("LOAD: body signal override → walk_soft")

    thyroid = build_thyroid_safety()
    thyroid_trace = [f"THYROID: conservative, {len(THYROID_NOTES)} rules"]

    alignment_rules = ["ALIGN: тестовый конвейер — сверка D1/D9 в этом хелпере не выполняется"]

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

    water_fast = day_type in (DayType.ekadashi_day, DayType.pradosh_day)
    breakfast_final = WATER_ONLY_FAST_DAY_TEXT if water_fast else _BREAKFAST
    supp_final = build_supplements_water_fast_day(d) if water_fast else build_supplements(d)

    astro_alignment_stub = AstroAlignment(
        summary="Тест: сверка D1/D9 в этом хелпере не выполняется.",
        checks=[],
        scale_deltas=AlignmentScaleDeltas(wr=0.0, rel=0.0, nrv=0.0, rhy=0.0),
        natal_moon=LunarSolarNakPair(d1_nak="—", d9_nak="—"),
        transit_moon=LunarSolarNakPair(d1_nak="—", d9_nak="—"),
        natal_sun=LunarSolarNakPair(d1_nak="—", d9_nak="—"),
        transit_sun=LunarSolarNakPair(d1_nak="—", d9_nak="—"),
    )

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
            breakfast=breakfast_final,
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
        supplements=supp_final,
        breathing_practice=breath,
        mudra_recommendation=mudra,
        aroma_protocol=aroma,
        movement_load=LoadBlock(profile=load_profile, detail=load_detail),
        thyroid_safety_notes=thyroid,
        body_markers_to_track=_build_tracking(day_type, scales, sig_ov),
        warnings=_build_warnings(day_type, scales, sig_ov),
        scales=scales,
        moon_illumination_pct=round(snap.moon_illumination * 100, 1),
        matrix_index=mx,
        astro_alignment=astro_alignment_stub,
        rule_trace=rule_trace,
    )


class TestStage6_FullPipeline:

    def test_stable_day_full_pipeline(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        analysis = _make_analysis(snap, default_user_natal())
        proto = _build_protocol_from_snapshot(date(2026, 5, 15), snap, analysis)

        assert proto.day_type == DayType.stable_day
        assert proto.lunar_day_number == snap.tithi
        assert proto.nakshatra == snap.nakshatra_name
        assert proto.ekadashi_flag is False
        assert proto.pradosh_flag is False
        assert proto.nutrition.breakfast != ""
        assert proto.nutrition.lunch.protein != ""
        assert proto.nutrition.lunch.vegetables != ""
        assert proto.nutrition.rice.allowed in (True, False)
        assert proto.breathing_practice.minutes > 0
        assert proto.aroma_protocol.morning != AromaSlot.none
        assert proto.supplements.slots != []
        assert proto.thyroid_safety_notes.notes != []
        assert proto.movement_load.detail != ""
        assert proto.body_markers_to_track != []
        assert len(proto.rule_trace.day_type_rules) >= 1
        assert len(proto.rule_trace.scales_modifiers) >= 2
        assert len(proto.rule_trace.rice_rules) >= 1
        assert len(proto.rule_trace.breathing_rules) >= 2
        assert len(proto.rule_trace.aroma_rules) >= 3
        assert len(proto.rule_trace.thyroid_rules) >= 1

    def test_ekadashi_full_pipeline(self):
        moon = (20.0 + 126.0) % 360.0  # tithi=11
        snap = _make_snapshot(sun=20.0, moon=moon)
        assert snap.is_ekadashi
        analysis = _make_analysis(snap, default_user_natal())
        proto = _build_protocol_from_snapshot(date(2026, 5, 22), snap, analysis)

        assert proto.day_type == DayType.ekadashi_day
        assert proto.ekadashi_flag is True
        assert proto.nutrition.lunch.matrix_used == MealMatrix.D_EKADASHI
        assert proto.nutrition.lunch.protein == "—"
        assert "вода" in proto.nutrition.breakfast.lower()
        assert "пищи нет" in proto.nutrition.lunch.full_description.lower()
        assert proto.nutrition.rice.allowed is False
        assert any("ekadashi" in r.lower() for r in proto.rule_trace.day_type_rules)
        assert any("круп" in r.lower() for r in proto.rule_trace.rice_rules)

    def test_pradosh_full_pipeline(self):
        moon = (30.0 + 150.0) % 360.0  # tithi=13
        snap = _make_snapshot(sun=30.0, moon=moon)
        assert snap.is_pradosh_day
        analysis = _make_analysis(snap, default_user_natal())
        proto = _build_protocol_from_snapshot(date(2026, 5, 24), snap, analysis)

        assert proto.day_type == DayType.pradosh_day
        assert proto.pradosh_flag is True
        assert proto.nutrition.lunch.matrix_used == MealMatrix.E_PRADOSH
        assert proto.nutrition.lunch.protein == "—"
        assert "вода" in proto.nutrition.breakfast.lower()
        assert "пищи нет" in proto.nutrition.lunch.full_description.lower()
        assert proto.nutrition.rice.allowed is False

    def test_pre_full_moon_full_pipeline(self):
        snap = _make_snapshot(sun=10.0, moon=192.0)
        assert snap.moon_illumination > 0.85
        analysis = _make_analysis(snap, default_user_natal())
        proto = _build_protocol_from_snapshot(date(2026, 6, 10), snap, analysis)

        assert proto.day_type == DayType.pre_full_moon_retention_day
        assert proto.nutrition.rice.allowed is False
        assert proto.movement_load.profile == LoadProfile.no_overload
        assert proto.mudra_recommendation.suggested is False

    def test_transit_hit_modifies_protocol(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        saturn_hit = TransitHit("Saturn", "conjunction", "moon", 2.0)
        mars_hit = TransitHit("Mars", "square", "mercury", 3.0)
        analysis = _make_analysis(snap, default_user_natal(), [saturn_hit, mars_hit])
        proto = _build_protocol_from_snapshot(date(2026, 7, 1), snap, analysis)

        assert proto.scales.water_retention_risk > 60
        assert proto.scales.nervous_system_load > 60
        assert any("Saturn conjunction natal Moon" in t for t in proto.rule_trace.scales_modifiers)
        assert any("Mars square natal Mercury" in t for t in proto.rule_trace.scales_modifiers)

    def test_body_signals_override_protocol(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        analysis = _make_analysis(snap, default_user_natal())
        signals = BodySignalEntry(
            day_date=date(2026, 7, 5),
            ankles_evening=4,
            head_overload=5,
            sleep_quality=1,
        )
        proto = _build_protocol_from_snapshot(date(2026, 7, 5), snap, analysis, signals)

        assert proto.nutrition.lunch.matrix_used == MealMatrix.C_RETENTION
        assert proto.nutrition.rice.allowed is False
        assert proto.breathing_practice.practice == BreathingPractice.bhramari
        assert proto.movement_load.profile == LoadProfile.walk_soft
        assert any("самочувствию" in r.lower() for r in proto.rule_trace.rice_rules)
        assert any("4/5" in r for r in proto.rule_trace.body_signal_rules)

    def test_all_20_protocol_fields_populated(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        analysis = _make_analysis(snap, default_user_natal())
        proto = _build_protocol_from_snapshot(date(2026, 8, 1), snap, analysis)
        d = proto.model_dump()

        required_keys = [
            "date", "weekday", "lunar_day_number", "moon_phase", "nakshatra",
            "ekadashi_flag", "pradosh_flag", "day_type", "body_effect_summary",
            "nutrition", "supplements", "breathing_practice",
            "mudra_recommendation", "aroma_protocol", "movement_load",
            "thyroid_safety_notes", "body_markers_to_track", "warnings",
            "scales", "rule_trace",
        ]
        for key in required_keys:
            assert key in d, f"Missing field: {key}"
            assert d[key] is not None, f"Field is None: {key}"

    def test_rule_trace_has_all_10_sections(self):
        snap = _make_snapshot(sun=10.0, moon=80.0)
        analysis = _make_analysis(snap, default_user_natal())
        proto = _build_protocol_from_snapshot(date(2026, 8, 15), snap, analysis)
        rt = proto.rule_trace

        assert len(rt.day_type_rules) >= 1
        assert len(rt.scales_modifiers) >= 2
        assert len(rt.rice_rules) >= 1
        assert len(rt.breathing_rules) >= 2
        assert len(rt.mudra_rules) >= 1
        assert len(rt.thyroid_rules) >= 1
        assert len(rt.body_signal_rules) >= 1
        assert len(rt.meal_matrix_rules) >= 1
        assert len(rt.load_rules) >= 1
        assert len(rt.aroma_rules) >= 3
        assert len(rt.alignment_rules) >= 1
