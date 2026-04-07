"""
Typed data structures returned by the astrology computation layer.

These are pure dataclasses — no Swiss Ephemeris dependency.
They can be imported and constructed in any environment,
including tests without pyswisseph installed.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class TransitHit:
    """A single transit-to-natal aspect."""
    transit_planet: str
    aspect: str          # "conjunction" | "opposition" | "square" | "trine"
    natal_target: str    # "moon" | "venus" | "mars" | "saturn" | "mercury"
    delta_deg: float


@dataclass(frozen=True)
class TransitSnapshot:
    """
    Astronomical state for a given date/time.
    Pure computation output — no recommendation or protocol concepts.

    Fields:
      - Planetary longitudes (sidereal, degrees 0-360)
      - Sun-Moon elongation and derived tithi (1-30)
      - Nakshatra index (0-26), name, pada (1-4)
      - Moon illumination (0.0-1.0) and phase label
      - Ekadashi / Pradosh flags
    """
    jd_ut: float

    sun_deg: float
    moon_deg: float
    mars_deg: float
    mercury_deg: float
    jupiter_deg: float
    venus_deg: float
    saturn_deg: float
    rahu_deg: float
    ketu_deg: float

    elong_deg: float
    tithi: int
    nakshatra_index: int
    nakshatra_name: str
    nakshatra_pada: int
    moon_illumination: float
    moon_phase_ru: str

    is_ekadashi: bool
    is_pradosh_day: bool


@dataclass(frozen=True)
class TransitAnalysis:
    """Transit aspects to natal chart positions."""
    saturn_to_lagna: str | None
    saturn_to_moon: str | None
    jupiter_to_lagna: str | None
    jupiter_to_moon: str | None
    rahu_to_lagna: str | None
    rahu_to_moon: str | None
    ketu_to_lagna: str | None
    ketu_to_moon: str | None
    hits: list[TransitHit]
