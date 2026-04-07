"""
Deterministic body signal interpretation.
Overrides day_type and rice/meal decisions based on threshold rules.
"""

from dataclasses import dataclass

from app.domain.models.body_signals import BodySignalEntry
from app.domain.models.enums import DayType, MealMatrix


@dataclass(frozen=True)
class SignalOverride:
    force_day_type: DayType | None
    force_meal_matrix: MealMatrix | None
    force_rice_forbidden: bool
    force_no_comfort_food: bool
    reduce_meal_complexity: bool
    reduce_exercise: bool
    rice_conditionally_allowed: bool
    extra_warnings: list[str]
    extra_tracking: list[str]
    trace: list[str]


_EMPTY = SignalOverride(
    force_day_type=None,
    force_meal_matrix=None,
    force_rice_forbidden=False,
    force_no_comfort_food=False,
    reduce_meal_complexity=False,
    reduce_exercise=False,
    rice_conditionally_allowed=False,
    extra_warnings=[],
    extra_tracking=[],
    trace=["Сигналы тела не переданы — протокол по умолчанию"],
)


def interpret_signals(entry: BodySignalEntry | None) -> SignalOverride:
    if entry is None:
        return _EMPTY

    warnings: list[str] = []
    tracking: list[str] = []
    trace: list[str] = []
    force_dt: DayType | None = None
    force_mm: MealMatrix | None = None
    force_rice_no = False
    force_no_comfort = False
    reduce_complex = False
    reduce_ex = False
    rice_cond = False

    ankles = entry.ankles_evening or 0
    eyes = entry.eye_area_morning or 0
    head = entry.head_overload or 0
    sleep = entry.sleep_quality if entry.sleep_quality is not None else 5
    energy = entry.energy_level if entry.energy_level is not None else 3
    sweet = entry.sweet_craving or 0
    salty = entry.salty_craving or 0

    trace.append(
        f"Лодыжки вечером — {ankles}/5, область глаз утром — {eyes}/5, головная нагрузка — {head}/5, "
        f"сон — {sleep}/5, энергия — {energy}/5, тяга к сладкому — {sweet}/5, к солёному — {salty}/5"
    )

    if ankles >= 3:
        force_mm = MealMatrix.C_RETENTION
        force_rice_no = True
        warnings.append(f"Отёк лодыжек {ankles}/5: обед лёгкий, без гарнира, рис запрещён.")
        tracking.append("Лодыжки вечером — повторная проверка.")
        trace.append(f"Лодыжки отекли ({ankles}/5) — обед лёгкий при отёках, гарнир без крупы")
    else:
        trace.append("Отёк лодыжек ниже порога — без принудительного переключения обеда по отёкам")

    if eyes >= 3:
        force_rice_no = True
        force_no_comfort = True
        warnings.append(f"Отёк глаз {eyes}/5: без риса, без «комфортных» блюд.")
        tracking.append("Глаза и зона под глазами утром следующего дня.")
        trace.append(f"Отёк под глазами ({eyes}/5) — гарнир и тяжёлая еда исключены")

    if head >= 4:
        reduce_complex = True
        warnings.append(f"Ментальный перегруз {head}/5: упрощённый обед, дыхание на снижение.")
        tracking.append("Уровень перегруза головы через 2 часа после обеда.")
        trace.append(f"Голова сильно перегружена ({head}/5) — обед упрощён")

    if sleep <= 2:
        reduce_ex = True
        warnings.append(f"Качество сна {sleep}/5: не усиливать физическую нагрузку сегодня.")
        trace.append(f"Плохой сон ({sleep}/5) — нагрузку не наращивать")

    if energy <= 2 and ankles < 3 and eyes < 3:
        rice_cond = True
        warnings.append(f"Энергия {energy}/5 при низком отёке: рис условно допустим на стабильных днях.")
        trace.append(f"Мало сил ({energy}/5), отёков нет — гарнир допустим в ровный день при прочих условиях")

    if salty >= 4:
        warnings.append(f"Тяга к солёному {salty}/5: убрать дополнительные соусы и маринады.")
        tracking.append("Тяга к солёному после обеда.")
        trace.append(f"Сильная тяга к солёному ({salty}/5) — убрать лишние соусы и маринады")

    if sweet >= 4:
        warnings.append(f"Тяга к сладкому {sweet}/5: проверить качество сна, не компенсировать перекусом.")
        tracking.append("Тяга к сладкому через 3 часа после обеда.")
        trace.append(f"Сильная тяга к сладкому ({sweet}/5) — не компенсировать сном перекусом")

    return SignalOverride(
        force_day_type=force_dt,
        force_meal_matrix=force_mm,
        force_rice_forbidden=force_rice_no,
        force_no_comfort_food=force_no_comfort,
        reduce_meal_complexity=reduce_complex,
        reduce_exercise=reduce_ex,
        rice_conditionally_allowed=rice_cond,
        extra_warnings=warnings,
        extra_tracking=tracking,
        trace=trace,
    )
