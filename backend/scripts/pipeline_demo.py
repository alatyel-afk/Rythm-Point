"""
Pipeline demo: prints every stage from date input to final daily protocol.

Usage:
  PYTHONPATH=. python scripts/pipeline_demo.py                  # today
  PYTHONPATH=. python scripts/pipeline_demo.py 2026-05-15       # specific date
  PYTHONPATH=. python scripts/pipeline_demo.py 2026-05-15 --ankles=4 --head=5

Uses simulated astro data (no pyswisseph required).
"""

import sys
from datetime import date

from app.domain.models.body_signals import BodySignalEntry
from app.domain.models.natal import default_user_natal
from app.domain.models.protocol import DailyScales
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
from app.domain.services.body_signal_interpreter import interpret_signals
from app.domain.services.breath_selector import select_breathing
from app.domain.services.meal_matrices import pick_meal
from app.domain.services.mudra_selector import select_mudra
from app.domain.services.recommendation_engine import (
    _build_tracking,
    _build_warnings,
    _compute_scales,
    _DAY_LOAD,
    _DAY_TO_MATRIX,
    _EFFECT,
    _lunch_time,
    _resolve_day_type,
    _select_meal_matrix,
)
from app.domain.services.rice_policy import decide_rice
from app.domain.services.supplements import build_supplements
from app.domain.services.thyroid_safety import build_thyroid_safety


SEPARATOR = "=" * 72


def _simulate_snapshot(d: date) -> TransitSnapshot:
    """Deterministic pseudo-astro snapshot based on day-of-year.
    Real positions require pyswisseph; this uses a simple rotation model
    so the demo always produces different-looking data per date."""
    doy = d.timetuple().tm_yday
    sun = (doy * 0.9856) % 360.0
    moon = (doy * 13.176) % 360.0

    elong = elongation_deg(sun, moon)
    tithi = tithi_from_elongation(elong)
    nak_idx = nakshatra_index_from_moon_longitude(moon)
    return TransitSnapshot(
        jd_ut=2460400.0 + doy,
        sun_deg=round(sun, 3),
        moon_deg=round(moon, 3),
        mars_deg=(doy * 0.524) % 360.0,
        mercury_deg=(doy * 4.092) % 360.0,
        jupiter_deg=(doy * 0.083) % 360.0,
        venus_deg=(doy * 1.602) % 360.0,
        saturn_deg=(doy * 0.033) % 360.0,
        rahu_deg=(315.0 - doy * 0.053) % 360.0,
        ketu_deg=(135.0 - doy * 0.053) % 360.0,
        elong_deg=elong,
        tithi=tithi,
        nakshatra_index=nak_idx,
        nakshatra_name=nakshatra_name_ru(moon),
        nakshatra_pada=nakshatra_pada(moon),
        moon_illumination=moon_illumination_ratio(elong),
        moon_phase_ru=moon_phase_label_ru(elong),
        is_ekadashi=(tithi == 11),
        is_pradosh_day=(tithi == 13),
    )


def _simulate_analysis(snap: TransitSnapshot) -> tuple[TransitAnalysis, list[TransitHit]]:
    """Simulate a few transit hits for demonstration."""
    natal = default_user_natal()
    from app.domain.services.astro_math import angle_distance, classify_aspect
    orb_c, orb_m = 6.0, 5.0
    hits: list[TransitHit] = []
    movers = {"Saturn": snap.saturn_deg, "Jupiter": snap.jupiter_deg,
              "Rahu": snap.rahu_deg, "Ketu": snap.ketu_deg}
    targets = {"moon": natal.moon_deg, "venus": natal.venus_deg,
               "mercury": natal.mercury_deg}
    for mname, mlon in movers.items():
        for tname, tlon in targets.items():
            asp = classify_aspect(orb_c, orb_m, tlon, mlon)
            if asp:
                hits.append(TransitHit(mname, asp, tname, round(angle_distance(tlon, mlon), 2)))
    analysis = TransitAnalysis(
        saturn_to_lagna=None, saturn_to_moon=None,
        jupiter_to_lagna=None, jupiter_to_moon=None,
        rahu_to_lagna=None, rahu_to_moon=None,
        ketu_to_lagna=None, ketu_to_moon=None,
        hits=hits,
    )
    return analysis, hits


def run_pipeline(d: date, body_signals: BodySignalEntry | None = None) -> None:
    w = sys.stdout.write

    w(f"\n{SEPARATOR}\n")
    w(f"  PIPELINE DEMO: {d.isoformat()}\n")
    w(f"{SEPARATOR}\n\n")

    # ── STAGE 1: Astro computation ──
    w("STAGE 1  Astronomical Computation\n")
    w("-" * 40 + "\n")
    snap = _simulate_snapshot(d)
    w(f"  Sun:  {snap.sun_deg:.1f} deg\n")
    w(f"  Moon: {snap.moon_deg:.1f} deg\n")
    w(f"  Elongation: {snap.elong_deg:.1f} deg\n")
    w(f"  Tithi: {snap.tithi}\n")
    w(f"  Nakshatra: {snap.nakshatra_name} (pada {snap.nakshatra_pada})\n")
    w(f"  Moon illumination: {snap.moon_illumination:.2%}\n")
    w(f"  Moon phase: {snap.moon_phase_ru}\n")
    w(f"  Ekadashi: {snap.is_ekadashi}\n")
    w(f"  Pradosh:  {snap.is_pradosh_day}\n")
    w(f"  Matrix index: {tithi_to_matrix_index(snap.tithi)}\n\n")

    # ── STAGE 1b: Transit analysis ──
    analysis, hits = _simulate_analysis(snap)
    w(f"  Transit hits: {len(hits)}\n")
    for h in hits:
        w(f"    {h.transit_planet} {h.aspect} natal {h.natal_target} (delta {h.delta_deg} deg)\n")
    w("\n")

    # ── STAGE 2: Scales ──
    w("STAGE 2  Compute 4 Scales\n")
    w("-" * 40 + "\n")
    scales, scales_trace = _compute_scales(snap, hits, False, snap.tithi)
    for t in scales_trace:
        w(f"  {t}\n")
    w(f"\n  Water retention risk:     {scales.water_retention_risk}/100\n")
    w(f"  Release/drainage:         {scales.release_drainage_potential}/100\n")
    w(f"  Nervous system load:      {scales.nervous_system_load}/100\n")
    w(f"  Rhythm precision need:    {scales.need_for_rhythm_precision}/100\n\n")

    # ── STAGE 3: Day type ──
    w("STAGE 3  Resolve Day Type\n")
    w("-" * 40 + "\n")
    day_type, dt_trace = _resolve_day_type(scales, snap, False)
    for t in dt_trace:
        w(f"  {t}\n")
    w(f"\n  >>> DAY TYPE: {day_type.value}\n\n")

    # ── STAGE 3b: Body signal override ──
    w("STAGE 3b  Body Signal Interpretation\n")
    w("-" * 40 + "\n")
    sig_ov = interpret_signals(body_signals)
    for t in sig_ov.trace:
        w(f"  {t}\n")
    if sig_ov.force_day_type:
        w(f"  >>> OVERRIDE day_type → {sig_ov.force_day_type.value}\n")
        day_type = sig_ov.force_day_type
    w("\n")

    # ── STAGE 4a: Meal matrix + rice ──
    w("STAGE 4a  Meal Selection\n")
    w("-" * 40 + "\n")
    if sig_ov.force_meal_matrix:
        meal_matrix = sig_ov.force_meal_matrix
        w(f"  Meal matrix: {meal_matrix.value} (body signal override)\n")
    else:
        meal_matrix = _select_meal_matrix(day_type)
        w(f"  Meal matrix: {meal_matrix.value} (from day_type={day_type.value})\n")

    rice, rice_trace = decide_rice(day_type, scales, sig_ov)
    for t in rice_trace:
        w(f"  {t}\n")
    w(f"  Rice allowed: {rice.allowed} — {rice.reason}\n")

    from app.domain.models.enums import MealMatrix as MM
    if rice.allowed and meal_matrix != MM.F_RICE:
        meal_matrix = MM.F_RICE
        w(f"  >>> Switching to F_RICE matrix\n")

    doy = d.timetuple().tm_yday
    meal = pick_meal(meal_matrix, doy)
    w(f"  Final meal: {meal.full_description}\n\n")

    # ── STAGE 4b: Lunch time ──
    time_win, early = _lunch_time(day_type)
    w(f"  Lunch window: {time_win} (early={early})\n\n")

    # ── STAGE 4c: Breathing ──
    w("STAGE 4b  Breathing Practice\n")
    w("-" * 40 + "\n")
    mental_high = (body_signals.head_overload or 0) >= 4 if body_signals else False
    breath, breath_trace = select_breathing(day_type, mental_overload=mental_high)
    for t in breath_trace:
        w(f"  {t}\n")
    w(f"  >>> {breath.title_ru}, {breath.minutes} min\n\n")

    # ── STAGE 4d: Mudra ──
    w("STAGE 4c  Mudra Selection\n")
    w("-" * 40 + "\n")
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
    for t in mudra_trace:
        w(f"  {t}\n")
    w(f"  >>> {mudra.name_ru}{f', {mudra.duration_minutes} min' if mudra.suggested else ''}\n\n")

    # ── STAGE 4e: Aroma ──
    w("STAGE 4d  Aroma Protocol\n")
    w("-" * 40 + "\n")
    aroma, aroma_trace = select_aroma(day_type)
    for t in aroma_trace:
        w(f"  {t}\n")
    w("\n")

    # ── STAGE 4f: Load ──
    w("STAGE 4e  Movement Load\n")
    w("-" * 40 + "\n")
    load_profile, load_detail = _DAY_LOAD[day_type]
    if sig_ov.reduce_exercise:
        w(f"  Override: reduce_exercise=True → walk_soft\n")
        from app.domain.models.enums import LoadProfile as LP
        load_profile = LP.walk_soft
        load_detail = "Reduced by body signal."
    w(f"  {load_profile.value}: {load_detail}\n\n")

    # ── STAGE 5: Supplements ──
    w("STAGE 5  Supplements\n")
    w("-" * 40 + "\n")
    supps = build_supplements(d)
    for slot in supps.slots:
        w(f"  {slot.time}: {slot.items}\n")
    w(f"  Endoluten today: {supps.endoluten_today}\n\n")

    # ── STAGE 6: Thyroid safety ──
    w("STAGE 6  Thyroid Safety\n")
    w("-" * 40 + "\n")
    thyroid = build_thyroid_safety()
    for n in thyroid.notes:
        w(f"  - {n}\n")
    w("\n")

    # ── STAGE 7: Warnings + tracking ──
    w("STAGE 7  Warnings & Tracking\n")
    w("-" * 40 + "\n")
    warnings = _build_warnings(day_type, scales, sig_ov)
    tracking = _build_tracking(day_type, scales, sig_ov)
    w("  Warnings:\n")
    for wn in warnings:
        w(f"    - {wn}\n")
    w("  Body markers to track:\n")
    for tr in tracking:
        w(f"    - {tr}\n")

    # ── SUMMARY ──
    w(f"\n{SEPARATOR}\n")
    w(f"  FINAL PROTOCOL SUMMARY\n")
    w(f"{SEPARATOR}\n")
    w(f"  Date:       {d.isoformat()}\n")
    w(f"  Tithi:      {snap.tithi}\n")
    w(f"  Nakshatra:  {snap.nakshatra_name} pada {snap.nakshatra_pada}\n")
    w(f"  Day type:   {day_type.value}\n")
    w(f"  Effect:     {_EFFECT[day_type]}\n")
    w(f"  Meal:       {meal.full_description}\n")
    w(f"  Rice:       {'yes' if rice.allowed else 'no'} — {rice.reason}\n")
    w(f"  Breathing:  {breath.title_ru} ({breath.minutes} min)\n")
    w(f"  Mudra:      {mudra.name_ru}\n")
    w(f"  Load:       {load_profile.value}\n")
    w(f"  Endoluten:  {'yes' if supps.endoluten_today else 'no'}\n")
    w(f"{SEPARATOR}\n\n")


def main() -> None:
    args = sys.argv[1:]
    d = date.today()
    ankles = head = sleep = energy = 0

    for arg in args:
        if arg.startswith("--ankles="):
            ankles = int(arg.split("=")[1])
        elif arg.startswith("--head="):
            head = int(arg.split("=")[1])
        elif arg.startswith("--sleep="):
            sleep = int(arg.split("=")[1])
        elif arg.startswith("--energy="):
            energy = int(arg.split("=")[1])
        elif not arg.startswith("-"):
            d = date.fromisoformat(arg)

    signals = None
    if ankles or head or sleep or energy:
        signals = BodySignalEntry(
            day_date=d,
            ankles_evening=ankles or None,
            head_overload=head or None,
            sleep_quality=sleep or None,
            energy_level=energy or None,
        )

    run_pipeline(d, signals)


if __name__ == "__main__":
    main()
