"""Натальные данные: фиксированные сидерические долготы (D1), без пересчёта карты из времени рождения."""

from pydantic import BaseModel, Field


class PlanetSidereal(BaseModel):
    """Долгота в сидерическом зодиаке, 0° = начало Овна."""

    name: str
    longitude_deg: float = Field(ge=0.0, lt=360.0)
    retrograde: bool = False
    combust: bool = False
    atmakaraka: bool = False


class NatalChartD1(BaseModel):
    """
    Подтверждённые пользователем позиции D1.
    Лагна и планеты — сидерические долготы в градусах.
    """

    lagna_deg: float
    sun_deg: float
    moon_deg: float
    mars_deg: float
    mercury_deg: float
    jupiter_deg: float
    venus_deg: float
    saturn_deg: float
    rahu_deg: float
    ketu_deg: float

    mercury_retrograde: bool = True
    jupiter_retrograde: bool = True
    mercury_combust: bool = True
    saturn_combust: bool = True
    mercury_atmakaraka: bool = True

    birth_tithi_pattern_note: str = (
        "Рождение на 4-й титхе: в протоколе учитывается как модификатор ритма и чувствительности к сдвигам режима."
    )


def default_user_natal() -> NatalChartD1:
    """
    Долготы из ТЗ (сидерические, Lahiri-совместимые значения как заданы).
    Овен 0°, Телец 30°, Близнецы 60°, Рак 90°, Лев 120°, Дева 150°, Весы 180°,
    Скорпион 210°, Стрелец 240°, Козерог 270°, Водолей 300°, Рыбы 330°.
    """

    def d(sign_start: float, deg: int, minute: float) -> float:
        return sign_start + deg + minute / 60.0

    return NatalChartD1(
        lagna_deg=d(240.0, 25, 5.0),
        sun_deg=d(0.0, 24, 20.0),
        moon_deg=d(60.0, 2, 55.0),
        mars_deg=d(30.0, 20, 12.0),
        mercury_deg=d(0.0, 25, 10.0),
        jupiter_deg=d(180.0, 5, 31.0),
        venus_deg=d(30.0, 19, 53.0),
        saturn_deg=d(0.0, 19, 26.0),
        rahu_deg=d(300.0, 15, 41.0),
        ketu_deg=d(120.0, 15, 41.0),
    )
