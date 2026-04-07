"""27 накшатр — имена для UI (рус.)."""

NAKSHATRA_NAMES_RU: list[str] = [
    "Ашвини",
    "Бхарани",
    "Криттика",
    "Рохини",
    "Мригашира",
    "Ардра",
    "Пунарвасу",
    "Пушья",
    "Ашлеша",
    "Магха",
    "Пурва Пхалгуни",
    "Уттара Пхалгуни",
    "Хаста",
    "Читра",
    "Свати",
    "Вишакха",
    "Анурадха",
    "Джйештха",
    "Мула",
    "Пурва Ашадха",
    "Уттара Ашадха",
    "Шравана",
    "Дхаништха",
    "Шатабхиша",
    "Пурва Бхадрапада",
    "Уттара Бхадрапада",
    "Ревати",
]

NAKSHATRA_SPAN_DEG = 360.0 / 27.0


def nakshatra_index_from_moon_longitude(moon_lon: float) -> int:
    """0..26"""

    x = moon_lon % 360.0
    idx = int(x // NAKSHATRA_SPAN_DEG)
    if idx >= 27:
        idx = 26
    return idx


def nakshatra_name_ru(moon_lon: float) -> str:
    return NAKSHATRA_NAMES_RU[nakshatra_index_from_moon_longitude(moon_lon)]
