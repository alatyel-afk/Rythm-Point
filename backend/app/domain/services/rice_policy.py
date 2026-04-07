"""Deterministic rice decision logic with rule trace."""

from app.domain.models.enums import DayType
from app.domain.models.protocol import DailyScales, RiceDecision
from app.domain.services.body_signal_interpreter import SignalOverride

_RICE_FORBIDDEN_REASON: dict[DayType, str] = {
    DayType.ekadashi_day: "В день экадаши крупа не входит в протокол.",
    DayType.pradosh_day: "В день прадоша крупа не входит в протокол.",
    DayType.pre_full_moon_retention_day: "В канун полнолуния крупа не входит в протокол.",
    DayType.pre_new_moon_precision_day: "В канун новолуния крупа не входит в протокол.",
    DayType.caution_day: "В этот день риск отёков и перегруз нервной системы — крупу не добавляем.",
}

RICE_FORBIDDEN_DAY_TYPES = frozenset({
    DayType.ekadashi_day,
    DayType.pradosh_day,
    DayType.pre_full_moon_retention_day,
    DayType.pre_new_moon_precision_day,
    DayType.caution_day,
})


def decide_rice(
    day_type: DayType,
    scales: DailyScales,
    signal_override: SignalOverride,
) -> tuple[RiceDecision, list[str]]:
    trace: list[str] = []

    if signal_override.force_rice_forbidden:
        trace.append("По самочувствию крупа в обед не добавляется")
        return RiceDecision(allowed=False, reason="Телесные маркеры указывают на задержку — рис запрещён."), trace

    trace.append("Проверка: можно ли гарнир с крупой по типу дня и шкалам")

    if day_type in RICE_FORBIDDEN_DAY_TYPES:
        trace.append("Тип дня не допускает крупу в обеде")
        return RiceDecision(
            allowed=False,
            reason=_RICE_FORBIDDEN_REASON.get(day_type, "В этот день крупа не входит в протокол."),
        ), trace

    trace.append("Тип дня допускает крупу при низком риске задержки воды")

    if scales.water_retention_risk >= 65:
        trace.append(f"Риск задержки воды {scales.water_retention_risk}/100 — гарнир без крупы")
        return RiceDecision(allowed=False, reason=f"Шкала задержки воды {scales.water_retention_risk}/100 — рис не рекомендуется."), trace

    if signal_override.rice_conditionally_allowed:
        trace.append("Мало сил при низком отёке — малая порция крупы допустима")
        return RiceDecision(allowed=True, reason="Низкая энергия при низком отёке — рис условно допустим, малая порция с перцем и мятой."), trace

    if day_type == DayType.stable_day and scales.water_retention_risk < 55:
        trace.append("Ровный день и низкий риск задержки — крупа в малой порции разрешена")
        return RiceDecision(allowed=True, reason="Стабильный день, низкий риск — рис малой порцией с перцем и мятой."), trace

    trace.append("Условия для крупы не выполнены — обед без гарнира с крупой")
    return RiceDecision(allowed=False, reason="По умолчанию рис не включён."), trace
