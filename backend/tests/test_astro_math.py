"""
Pure-math unit tests for the astrology module.
NO pyswisseph dependency — only tests functions that use plain math.
Run: PYTHONPATH=. python -m pytest tests/test_astro_math.py -v
"""

from app.domain.services.astro_math import (
    angle_distance,
    classify_aspect,
    elongation_deg,
    moon_illumination_ratio,
    moon_phase_label_ru,
    nakshatra_pada,
    tithi_from_elongation,
)
from app.domain.services.astrology_constants import (
    NAKSHATRA_NAMES_RU,
    NAKSHATRA_SPAN_DEG,
    nakshatra_index_from_moon_longitude,
    nakshatra_name_ru,
)
from app.domain.services.astro_math import tithi_to_matrix_index


# ── Elongation ──

def test_elongation_new_moon():
    assert elongation_deg(10.0, 10.0) == 0.0


def test_elongation_full_moon():
    assert abs(elongation_deg(10.0, 190.0) - 180.0) < 0.001


def test_elongation_wrap():
    e = elongation_deg(350.0, 10.0)
    assert abs(e - 20.0) < 0.001


# ── Tithi ──

def test_tithi_new_moon():
    assert tithi_from_elongation(0.0) == 1


def test_tithi_full_moon():
    assert tithi_from_elongation(180.0) == 16


def test_tithi_end_of_cycle():
    assert tithi_from_elongation(359.9) == 30


def test_tithi_ekadashi():
    assert tithi_from_elongation(11 * 12.0 - 6.0) == 11


def test_tithi_pradosh():
    assert tithi_from_elongation(12 * 12.0 + 1.0) == 13


def test_tithi_clamped_low():
    assert tithi_from_elongation(0.001) == 1


def test_tithi_clamped_high():
    assert tithi_from_elongation(360.0) == 30


# ── Matrix index ──

def test_matrix_index_normal():
    assert tithi_to_matrix_index(15) == 15


def test_matrix_index_tithi_30():
    assert tithi_to_matrix_index(30) == 29


def test_matrix_index_tithi_1():
    assert tithi_to_matrix_index(1) == 1


# ── Moon illumination ──

def test_illumination_new_moon():
    illum = moon_illumination_ratio(0.0)
    assert illum < 0.01


def test_illumination_full_moon():
    illum = moon_illumination_ratio(180.0)
    assert illum > 0.99


def test_illumination_first_quarter():
    illum = moon_illumination_ratio(90.0)
    assert abs(illum - 0.5) < 0.01


# ── Moon phase label ──

def test_phase_new_moon():
    label = moon_phase_label_ru(5.0)
    assert "новолуние" in label


def test_phase_full_moon():
    label = moon_phase_label_ru(190.0)
    assert "убывающая после полнолуния" in label


def test_phase_waxing():
    label = moon_phase_label_ru(60.0)
    assert "растущая" in label


# ── Nakshatra ──

def test_nakshatra_count():
    assert len(NAKSHATRA_NAMES_RU) == 27


def test_nakshatra_span():
    assert abs(NAKSHATRA_SPAN_DEG - 13.333333333) < 0.001


def test_nakshatra_ashwini():
    assert nakshatra_name_ru(0.0) == "Ашвини"


def test_nakshatra_bharani():
    assert nakshatra_name_ru(14.0) == "Бхарани"


def test_nakshatra_revati():
    assert nakshatra_name_ru(359.0) == "Ревати"


def test_nakshatra_mrigashira():
    assert nakshatra_name_ru(62.0) == "Мригашира"


def test_nakshatra_index_range():
    for deg in range(0, 360):
        idx = nakshatra_index_from_moon_longitude(float(deg))
        assert 0 <= idx <= 26


# ── Nakshatra pada ──

def test_pada_start_of_nakshatra():
    assert nakshatra_pada(0.0) == 1


def test_pada_second():
    span = NAKSHATRA_SPAN_DEG / 4.0
    assert nakshatra_pada(span + 0.1) == 2


def test_pada_fourth():
    span = NAKSHATRA_SPAN_DEG
    assert nakshatra_pada(span - 0.1) == 4


def test_pada_always_1_to_4():
    for deg_x10 in range(0, 3600):
        p = nakshatra_pada(deg_x10 / 10.0)
        assert 1 <= p <= 4


# ── Angle distance ──

def test_angle_distance_same():
    assert angle_distance(100.0, 100.0) == 0.0


def test_angle_distance_opposite():
    assert abs(angle_distance(0.0, 180.0) - 180.0) < 0.001


def test_angle_distance_wrap():
    assert abs(angle_distance(350.0, 10.0) - 20.0) < 0.001


def test_angle_distance_symmetry():
    d1 = angle_distance(30.0, 120.0)
    d2 = angle_distance(120.0, 30.0)
    assert abs(d1 - d2) < 0.001


# ── Aspect classification ──

def test_classify_conjunction():
    asp = classify_aspect(6.0, 5.0, 100.0, 103.0)
    assert asp == "conjunction"


def test_classify_opposition():
    asp = classify_aspect(6.0, 5.0, 100.0, 283.0)
    assert asp == "opposition"


def test_classify_square():
    asp = classify_aspect(6.0, 5.0, 100.0, 192.0)
    assert asp == "square"


def test_classify_trine():
    asp = classify_aspect(6.0, 5.0, 100.0, 222.0)
    assert asp == "trine"


def test_classify_none():
    asp = classify_aspect(6.0, 5.0, 100.0, 155.0)
    assert asp is None


def test_classify_edge_of_orb():
    asp = classify_aspect(6.0, 5.0, 100.0, 106.1)
    assert asp is None


def test_classify_just_inside_orb():
    asp = classify_aspect(6.0, 5.0, 100.0, 105.9)
    assert asp == "conjunction"
