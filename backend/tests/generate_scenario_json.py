"""
Generate sample JSON outputs for 12 scenarios.
Uses deterministic component functions only (no Swiss Ephemeris).
Run: PYTHONPATH=. python tests/generate_scenario_json.py
Output: backend/schemas/sample_protocols.json
"""

import json
import os
from datetime import date

from app.domain.models.body_signals import BodySignalEntry
from app.domain.models.enums import (
    DayType,
    MealMatrix,
)
from app.domain.models.protocol import DailyScales
from app.domain.services.aroma_selector import select_aroma
from app.domain.services.body_signal_interpreter import SignalOverride, interpret_signals, _EMPTY
from app.domain.services.breath_selector import select_breathing
from app.domain.services.meal_matrices import pick_meal
from app.domain.services.mudra_selector import select_mudra
from app.domain.services.rice_policy import decide_rice
from app.domain.services.supplements import build_supplements
from app.domain.services.thyroid_safety import THYROID_NOTES


def scenario(
    name: str,
    day_type: DayType,
    scales: DailyScales,
    d: date,
    doy: int,
    signals: BodySignalEntry | None = None,
) -> dict:
    sig_ov = interpret_signals(signals)
    matrix = sig_ov.force_meal_matrix
    if matrix is None:
        matrix = {
            DayType.stable_day: MealMatrix.A_STABLE,
            DayType.drainage_day: MealMatrix.C_RETENTION,
            DayType.caution_day: MealMatrix.C_RETENTION,
            DayType.high_sensitivity_day: MealMatrix.B_NERVOUS,
            DayType.ekadashi_day: MealMatrix.D_EKADASHI,
            DayType.pradosh_day: MealMatrix.E_PRADOSH,
            DayType.recovery_day_after_reduction: MealMatrix.A_STABLE,
            DayType.pre_full_moon_retention_day: MealMatrix.C_RETENTION,
            DayType.pre_new_moon_precision_day: MealMatrix.B_NERVOUS,
        }[day_type]

    rice, rice_trace = decide_rice(day_type, scales, sig_ov)
    if rice.allowed and matrix != MealMatrix.F_RICE:
        matrix = MealMatrix.F_RICE

    meal = pick_meal(matrix, doy)
    mental_high = signals is not None and (signals.head_overload or 0) >= 4
    breath, breath_trace = select_breathing(day_type, mental_overload=mental_high)
    mudra, mudra_trace = select_mudra(
        day_type,
        high_retention_risk=scales.water_retention_risk >= 65,
        high_head_pressure=mental_high,
        low_energy_no_swelling=(
            signals is not None
            and (signals.energy_level or 3) <= 2
            and (signals.ankles_evening or 0) < 3
        ),
    )
    aroma, aroma_trace = select_aroma(day_type)
    supps = build_supplements(d)

    return {
        "scenario": name,
        "day_type": day_type.value,
        "scales": scales.model_dump(),
        "meal_matrix": matrix.value,
        "meal": {"protein": meal.protein, "vegetables": meal.vegetables, "full_description": meal.full_description},
        "rice": rice.model_dump(),
        "breathing": breath.model_dump(),
        "mudra": mudra.model_dump(),
        "aroma": aroma.model_dump(),
        "supplements_endoluten_today": supps.endoluten_today,
        "signal_override_warnings": sig_ov.extra_warnings,
        "thyroid_safety_notes": THYROID_NOTES,
        "rule_trace": {
            "rice": rice_trace,
            "breathing": breath_trace,
            "mudra": mudra_trace,
            "aroma": aroma_trace,
            "body_signals": sig_ov.trace,
        },
    }


scenarios = [
    scenario(
        "1. Stable day, no signals",
        DayType.stable_day,
        DailyScales(water_retention_risk=45, release_drainage_potential=50, nervous_system_load=40, need_for_rhythm_precision=45),
        date(2026, 4, 7), 97,
    ),
    scenario(
        "2. Ekadashi day",
        DayType.ekadashi_day,
        DailyScales(water_retention_risk=35, release_drainage_potential=70, nervous_system_load=45, need_for_rhythm_precision=55),
        date(2026, 4, 22), 112,
    ),
    scenario(
        "3. Pradosh day",
        DayType.pradosh_day,
        DailyScales(water_retention_risk=50, release_drainage_potential=60, nervous_system_load=55, need_for_rhythm_precision=60),
        date(2026, 4, 24), 114,
    ),
    scenario(
        "4. Pre-full-moon retention",
        DayType.pre_full_moon_retention_day,
        DailyScales(water_retention_risk=68, release_drainage_potential=40, nervous_system_load=55, need_for_rhythm_precision=50),
        date(2026, 5, 12), 132,
    ),
    scenario(
        "5. Pre-new-moon precision",
        DayType.pre_new_moon_precision_day,
        DailyScales(water_retention_risk=42, release_drainage_potential=48, nervous_system_load=52, need_for_rhythm_precision=65),
        date(2026, 5, 25), 145,
    ),
    scenario(
        "6. Drainage day",
        DayType.drainage_day,
        DailyScales(water_retention_risk=50, release_drainage_potential=75, nervous_system_load=40, need_for_rhythm_precision=50),
        date(2026, 4, 10), 100,
    ),
    scenario(
        "7. High sensitivity day",
        DayType.high_sensitivity_day,
        DailyScales(water_retention_risk=55, release_drainage_potential=45, nervous_system_load=78, need_for_rhythm_precision=70),
        date(2026, 4, 15), 105,
    ),
    scenario(
        "8. Caution day",
        DayType.caution_day,
        DailyScales(water_retention_risk=74, release_drainage_potential=35, nervous_system_load=72, need_for_rhythm_precision=65),
        date(2026, 4, 18), 108,
    ),
    scenario(
        "9. Recovery after reduction",
        DayType.recovery_day_after_reduction,
        DailyScales(water_retention_risk=55, release_drainage_potential=50, nervous_system_load=52, need_for_rhythm_precision=48),
        date(2026, 4, 23), 113,
    ),
    scenario(
        "10. Swelling input overrides to retention",
        DayType.stable_day,
        DailyScales(water_retention_risk=45, release_drainage_potential=50, nervous_system_load=40, need_for_rhythm_precision=45),
        date(2026, 4, 9), 99,
        signals=BodySignalEntry(day_date=date(2026, 4, 9), ankles_evening=4, eye_area_morning=0),
    ),
    scenario(
        "11. Mental overload input",
        DayType.stable_day,
        DailyScales(water_retention_risk=48, release_drainage_potential=50, nervous_system_load=45, need_for_rhythm_precision=50),
        date(2026, 4, 11), 101,
        signals=BodySignalEntry(day_date=date(2026, 4, 11), head_overload=5, sleep_quality=2),
    ),
    scenario(
        "12. Low energy no swelling -> rice allowed on stable day",
        DayType.stable_day,
        DailyScales(water_retention_risk=40, release_drainage_potential=50, nervous_system_load=35, need_for_rhythm_precision=40),
        date(2026, 4, 13), 103,
        signals=BodySignalEntry(day_date=date(2026, 4, 13), energy_level=1, ankles_evening=0, eye_area_morning=0),
    ),
]


def main() -> None:
    out_dir = os.path.join(os.path.dirname(__file__), "..", "schemas")
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, "sample_protocols.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(scenarios, f, ensure_ascii=False, indent=2)
    print(f"12 sample protocols written to {os.path.abspath(path)}")

    print(f"Done. {len(scenarios)} scenarios.")


if __name__ == "__main__":
    main()
