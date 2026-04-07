"""Deterministic aroma protocol selection by day_type with rule trace."""

from app.domain.models.enums import AromaSlot, DayType
from app.domain.models.protocol import AromaProtocol

_NAMES: dict[AromaSlot, str] = {
    AromaSlot.frankincense: "ладан",
    AromaSlot.rose: "роза",
    AromaSlot.geranium: "герань",
    AromaSlot.rosemary: "розмарин",
    AromaSlot.leuzea: "левзея",
    AromaSlot.anti_stress_blend: "смесь «Антистресс О. Ирисовой»",
    AromaSlot.none: "—",
}


def _detail(slot: AromaSlot, context: str) -> str:
    if slot == AromaSlot.none:
        return "Без аромата в этот слот."
    return f"{_NAMES[slot]} — {context}"


def _proto_for(day_type: DayType) -> AromaProtocol:
    if day_type == DayType.stable_day:
        return AromaProtocol(
            morning=AromaSlot.frankincense,
            morning_detail=_detail(AromaSlot.frankincense, "1 капля на аромакамень, 3 минуты проветривание, структура утра."),
            daytime=AromaSlot.geranium,
            daytime_detail=_detail(AromaSlot.geranium, "1 капля, рабочее место, баланс дня."),
            evening=AromaSlot.rose,
            evening_detail=_detail(AromaSlot.rose, "1 капля, 20 минут до сна, мягкое завершение."),
        )
    if day_type == DayType.drainage_day:
        return AromaProtocol(
            morning=AromaSlot.rosemary,
            morning_detail=_detail(AromaSlot.rosemary, "1 капля утром, ясность без стимуляции."),
            daytime=AromaSlot.geranium,
            daytime_detail=_detail(AromaSlot.geranium, "баланс при раздражении."),
            evening=AromaSlot.frankincense,
            evening_detail=_detail(AromaSlot.frankincense, "разбавленно, если голова спокойна."),
        )
    if day_type in (DayType.caution_day, DayType.pre_full_moon_retention_day):
        return AromaProtocol(
            morning=AromaSlot.geranium,
            morning_detail=_detail(AromaSlot.geranium, "при пасмурной голове утром."),
            daytime=AromaSlot.anti_stress_blend,
            daytime_detail=_detail(AromaSlot.anti_stress_blend, "20 минут в середине дня."),
            evening=AromaSlot.rose,
            evening_detail=_detail(AromaSlot.rose, "без стимулирующих ароматов вечером."),
        )
    if day_type == DayType.high_sensitivity_day:
        return AromaProtocol(
            morning=AromaSlot.rose,
            morning_detail=_detail(AromaSlot.rose, "очень мягко, 1 капля."),
            daytime=AromaSlot.anti_stress_blend,
            daytime_detail=_detail(AromaSlot.anti_stress_blend, "15 минут при нервном фоне."),
            evening=AromaSlot.rose,
            evening_detail=_detail(AromaSlot.rose, "завершение без стимуляции."),
        )
    if day_type == DayType.ekadashi_day:
        return AromaProtocol(
            morning=AromaSlot.rose,
            morning_detail=_detail(AromaSlot.rose, "мягко, без перегрева."),
            daytime=AromaSlot.anti_stress_blend,
            daytime_detail=_detail(AromaSlot.anti_stress_blend, "поддержка в середине дня."),
            evening=AromaSlot.rose,
            evening_detail=_detail(AromaSlot.rose, "спокойствие."),
        )
    if day_type == DayType.pradosh_day:
        return AromaProtocol(
            morning=AromaSlot.frankincense,
            morning_detail=_detail(AromaSlot.frankincense, "структура утра."),
            daytime=AromaSlot.rose,
            daytime_detail=_detail(AromaSlot.rose, "при нервном фоне."),
            evening=AromaSlot.geranium,
            evening_detail=_detail(AromaSlot.geranium, "коротко перед сном."),
        )
    if day_type == DayType.recovery_day_after_reduction:
        return AromaProtocol(
            morning=AromaSlot.rosemary,
            morning_detail=_detail(AromaSlot.rosemary, "мягко, если нет жжения в глазах."),
            daytime=AromaSlot.geranium,
            daytime_detail=_detail(AromaSlot.geranium, "баланс."),
            evening=AromaSlot.frankincense,
            evening_detail=_detail(AromaSlot.frankincense, "не при головной жаре."),
        )
    if day_type == DayType.pre_new_moon_precision_day:
        return AromaProtocol(
            morning=AromaSlot.frankincense,
            morning_detail=_detail(AromaSlot.frankincense, "точность и фокус утром."),
            daytime=AromaSlot.leuzea,
            daytime_detail=_detail(AromaSlot.leuzea, "1 капля только при сонливости, не при тревоге."),
            evening=AromaSlot.rose,
            evening_detail=_detail(AromaSlot.rose, "без стимулирующей логики вечером."),
        )
    return AromaProtocol(
        morning=AromaSlot.frankincense,
        morning_detail=_detail(AromaSlot.frankincense, "структура."),
        daytime=AromaSlot.geranium,
        daytime_detail=_detail(AromaSlot.geranium, "баланс."),
        evening=AromaSlot.rose,
        evening_detail=_detail(AromaSlot.rose, "мягкое завершение."),
    )


def select_aroma(day_type: DayType) -> tuple[AromaProtocol, list[str]]:
    proto = _proto_for(day_type)
    trace = [
        f"AROMA: day_type={day_type.value}",
        f"AROMA: morning={proto.morning.value} ({_NAMES.get(proto.morning, '?')})",
        f"AROMA: daytime={proto.daytime.value} ({_NAMES.get(proto.daytime, '?')})",
        f"AROMA: evening={proto.evening.value} ({_NAMES.get(proto.evening, '?')})",
    ]
    return proto, trace
