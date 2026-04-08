"""
Pure astronomical math — no Swiss Ephemeris, no external dependencies.
Testable in any environment.

Functions here compute derived values from raw longitudes:
  - Tithi from Sun-Moon elongation
  - Moon illumination
  - Moon phase label
  - Nakshatra pada
  - Angular distance and aspect classification
"""

from math import cos, pi

from app.domain.services.astrology_constants import NAKSHATRA_SPAN_DEG


# ── Sun-Moon elongation ────────────────────────────────────

def elongation_deg(sun_lon: float, moon_lon: float) -> float:
    """Sun-Moon elongation in degrees (0..360)."""
    return (moon_lon - sun_lon) % 360.0


# ── Tithi ──────────────────────────────────────────────────

def tithi_from_elongation(elong_deg: float) -> int:
    """Indian tithi 1..30 from Sun-Moon elongation."""
    t = int(elong_deg // 12.0) + 1
    return max(1, min(30, t))


# ── Moon illumination ─────────────────────────────────────

def moon_illumination_ratio(elong_deg: float) -> float:
    """Approximate disk illumination 0..1."""
    phase_angle = pi * elong_deg / 180.0
    return 0.5 * (1.0 - cos(phase_angle))


# ── Moon phase label ──────────────────────────────────────

def moon_phase_label_ru(elong_deg: float) -> str:
    """Coarse phase label for UI."""
    e = elong_deg % 360.0
    if e < 45 or e >= 315:
        return "новолуние — растущая"
    if e < 90:
        return "растущая Луна"
    if e < 135:
        return "первая четверть"
    if e < 180:
        return "растущая — к полнолунию"
    if e < 225:
        return "убывающая после полнолуния"
    if e < 270:
        return "последняя четверть"
    return "убывающая Луна"


# ── Nakshatra pada ────────────────────────────────────────

def nakshatra_pada(moon_lon: float) -> int:
    """Pada 1..4 within the current nakshatra."""
    offset_in_nakshatra = (moon_lon % 360.0) % NAKSHATRA_SPAN_DEG
    pada_span = NAKSHATRA_SPAN_DEG / 4.0
    p = int(offset_in_nakshatra // pada_span) + 1
    return max(1, min(4, p))


# ── Angular distance and aspects ─────────────────────────

def angle_distance(a: float, b: float) -> float:
    """Shortest angular distance on the circle."""
    d = abs((a - b) % 360.0)
    return min(d, 360.0 - d)


def tithi_to_matrix_index(tithi: int) -> int:
    """Map tithi 1-30 to protocol matrix row 1-29 (tithi 30 merges with 29)."""
    if tithi >= 30:
        return 29
    return max(1, tithi)


def classify_aspect(
    orb_conjunction: float,
    orb_major: float,
    natal_lon: float,
    transit_lon: float,
) -> str | None:
    """Return aspect name or None if no aspect within orbs."""
    d = angle_distance(natal_lon, transit_lon)
    if d <= orb_conjunction:
        return "conjunction"
    if abs(d - 180.0) <= orb_major:
        return "opposition"
    if abs(d - 90.0) <= orb_major:
        return "square"
    if abs(d - 120.0) <= orb_major:
        return "trine"
    return None


def navamsa_longitude(sidereal_lon: float) -> float:
    """Долгота в навамше (D9), 0..360° — как в фронтенд-модуле navamsa.ts."""
    lon = ((sidereal_lon % 360.0) + 360.0) % 360.0
    rashi = int(lon // 30.0) % 12
    pos = lon % 30.0
    nav_piece = 30.0 / 9.0
    nav_idx = min(int(pos // nav_piece), 8)
    movable = {0, 3, 6, 9}
    fixed = {1, 4, 7, 10}
    if rashi in movable:
        start = rashi
    elif rashi in fixed:
        start = (rashi + 8) % 12
    else:
        start = (rashi + 4) % 12
    nav_sign = (start + nav_idx) % 12
    pos_in_nav = pos % nav_piece
    deg_in_nav = (pos_in_nav / nav_piece) * 30.0
    return nav_sign * 30.0 + deg_in_nav
