"""
Astronomical computation layer: Swiss Ephemeris + pure math.

This module computes celestial positions and derives:
  - Lunar day (tithi 1-30)
  - Moon phase + illumination
  - Nakshatra + pada
  - Ekadashi / Pradosh flags
  - Transit aspects to natal chart

It does NOT contain recommendation logic, day type classification,
meal selection, or any protocol concepts.

Pure math lives in astro_math.py (no pyswisseph, independently testable).
This module adds the Swiss Ephemeris layer on top.

Assumptions (explicit):
1) Snapshot moment for a calendar date = local time from settings (default 12:00),
   NOT sunrise/sunset.  Tithi/nakshatra may differ from sunrise-based calc.
2) Ekadashi: snapshot tithi 11 (шукла) or 26 (кришна-экадаши).
3) Pradosh (MVP): snapshot tithi 13 (шукла) or 28 (кришна-трайодаши).
   Sunset-window calculation requires geolocation — deferred.
"""

from datetime import date, datetime

import swisseph as swe

from app.config import Settings, get_settings
from app.domain.models.enums import AyanamshaMode
from app.domain.models.natal import NatalChartD1
from app.domain.services.astro_math import (
    angle_distance,
    classify_aspect,
    elongation_deg,
    moon_illumination_ratio,
    moon_phase_label_ru,
    nakshatra_pada,
    tithi_from_elongation,
)
from app.domain.services.astro_models import TransitAnalysis, TransitHit, TransitSnapshot
from app.domain.services.astrology_constants import (
    nakshatra_index_from_moon_longitude,
    nakshatra_name_ru,
)


# ── Ayanamsha ──────────────────────────────────────────────

_AYANAMSHA_MAP = {
    AyanamshaMode.LAHIRI: swe.SIDM_LAHIRI,
    AyanamshaMode.RAMAN: swe.SIDM_RAMAN,
    AyanamshaMode.KRISHNAMURTI: swe.SIDM_KRISHNAMURTI,
}


def _apply_ayanamsha(mode: AyanamshaMode) -> None:
    swe.set_sid_mode(_AYANAMSHA_MAP[mode])


# ── Julian day conversion ──────────────────────────────────

def _local_snapshot_to_julian_ut(
    d: date,
    tz_name: str,
    hour: int,
    minute: int,
) -> float:
    from zoneinfo import ZoneInfo

    z = ZoneInfo(tz_name)
    dt = datetime(d.year, d.month, d.day, hour, minute, 0, tzinfo=z)
    utc = dt.astimezone(ZoneInfo("UTC"))
    ut = utc.hour + utc.minute / 60.0 + utc.second / 3600.0
    return swe.julday(utc.year, utc.month, utc.day, ut, swe.GREG_CAL)


# ── Body position ─────────────────────────────────────────

def _calc_body(jd_ut: float, body: int, flags: int) -> tuple[float, float]:
    """Return (longitude, speed)."""
    res, ret = swe.calc_ut(jd_ut, body, flags)
    if ret < 0:
        raise RuntimeError(f"swisseph calc_ut failed for body={body}, ret={ret}")
    return float(res[0]), float(res[3])


def _true_node_longitude(jd_ut: float, flags: int) -> float:
    res, ret = swe.calc_ut(jd_ut, swe.TRUE_NODE, flags)
    if ret < 0:
        raise RuntimeError(f"true node failed ret={ret}")
    return float(res[0])


# ── Engine ─────────────────────────────────────────────────


class AstrologyEngine:
    """
    Computes planetary positions, lunar data, and transit aspects.
    Does not classify day types, select meals, or build protocols.
    """

    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        path = (self.settings.swe_ephe_path or "").strip()
        if path:
            swe.set_ephe_path(path)

    def compute_snapshot(
        self,
        d: date,
        timezone: str,
        ayanamsha: AyanamshaMode = AyanamshaMode.LAHIRI,
    ) -> TransitSnapshot:
        _apply_ayanamsha(ayanamsha)
        jd = _local_snapshot_to_julian_ut(
            d,
            timezone,
            self.settings.daily_snapshot_local_hour,
            self.settings.daily_snapshot_local_minute,
        )
        flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED

        sun, _ = _calc_body(jd, swe.SUN, flags)
        moon, _ = _calc_body(jd, swe.MOON, flags)
        mars, _ = _calc_body(jd, swe.MARS, flags)
        mercury, _ = _calc_body(jd, swe.MERCURY, flags)
        jupiter, _ = _calc_body(jd, swe.JUPITER, flags)
        venus, _ = _calc_body(jd, swe.VENUS, flags)
        saturn, _ = _calc_body(jd, swe.SATURN, flags)
        rahu = _true_node_longitude(jd, flags)
        ketu = (rahu + 180.0) % 360.0

        elong = elongation_deg(sun, moon)
        t = tithi_from_elongation(elong)
        nak_idx = nakshatra_index_from_moon_longitude(moon)
        nak_name = nakshatra_name_ru(moon)
        nak_pada = nakshatra_pada(moon)
        illum = moon_illumination_ratio(elong)
        phase_ru = moon_phase_label_ru(elong)

        return TransitSnapshot(
            jd_ut=jd,
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
            tithi=t,
            nakshatra_index=nak_idx,
            nakshatra_name=nak_name,
            nakshatra_pada=nak_pada,
            moon_illumination=illum,
            moon_phase_ru=phase_ru,
            is_ekadashi=(t in (11, 26)),
            is_pradosh_day=(t in (13, 28)),
        )

    def analyze_transits_to_natal(
        self,
        snap: TransitSnapshot,
        natal: NatalChartD1,
    ) -> TransitAnalysis:
        orb_c = self.settings.transit_orb_conjunction
        orb_m = self.settings.transit_orb_major

        def pair(t: float, n: float) -> str | None:
            return classify_aspect(orb_c, orb_m, n, t)

        sat = snap.saturn_deg
        jup = snap.jupiter_deg
        rah = snap.rahu_deg
        ket = snap.ketu_deg

        targets = {
            "moon": natal.moon_deg,
            "venus": natal.venus_deg,
            "mars": natal.mars_deg,
            "saturn": natal.saturn_deg,
            "mercury": natal.mercury_deg,
        }
        movers = {
            "Saturn": sat,
            "Jupiter": jup,
            "Mars": snap.mars_deg,
            "Mercury": snap.mercury_deg,
            "Venus": snap.venus_deg,
            "Sun": snap.sun_deg,
            "Rahu": rah,
            "Ketu": ket,
        }

        hits: list[TransitHit] = []
        for mover_name, lon in movers.items():
            for tgt_name, tgt_lon in targets.items():
                asp = classify_aspect(orb_c, orb_m, tgt_lon, lon)
                if asp:
                    hits.append(TransitHit(
                        transit_planet=mover_name,
                        aspect=asp,
                        natal_target=tgt_name,
                        delta_deg=round(angle_distance(tgt_lon, lon), 3),
                    ))

        return TransitAnalysis(
            saturn_to_lagna=pair(sat, natal.lagna_deg),
            saturn_to_moon=pair(sat, natal.moon_deg),
            jupiter_to_lagna=pair(jup, natal.lagna_deg),
            jupiter_to_moon=pair(jup, natal.moon_deg),
            rahu_to_lagna=pair(rah, natal.lagna_deg),
            rahu_to_moon=pair(rah, natal.moon_deg),
            ketu_to_lagna=pair(ket, natal.lagna_deg),
            ketu_to_moon=pair(ket, natal.moon_deg),
            hits=hits,
        )
