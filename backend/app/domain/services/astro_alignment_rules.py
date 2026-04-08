"""Сверка D1/D9 натала с транзитом (Луна, Солнце) — зеркало логики frontend/src/core/astrology/astro-alignment.ts."""

from __future__ import annotations

from dataclasses import dataclass

from app.domain.models.natal import NatalChartD1
from app.domain.models.protocol import AlignmentScaleDeltas, AstroAlignment, LunarSolarNakPair
from app.domain.services.astro_math import navamsa_longitude
from app.domain.services.astro_models import TransitSnapshot
from app.domain.services.astrology_constants import (
    nakshatra_index_from_moon_longitude,
    nakshatra_name_ru,
)


def _nak_d1(lon: float) -> str:
    return nakshatra_name_ru(lon)


def _nak_d9(lon: float) -> str:
    return nakshatra_name_ru(navamsa_longitude(lon))


def _nak_separation(lon_a: float, lon_b: float) -> int:
    ia = nakshatra_index_from_moon_longitude(lon_a)
    ib = nakshatra_index_from_moon_longitude(lon_b)
    d = abs(ia - ib)
    return min(d, 27 - d)


@dataclass
class _LuminaryEval:
    checks: list[str]
    deltas: AlignmentScaleDeltas


def _eval_luminary(
    label: str,
    n_lon: float,
    t_lon: float,
    n_d1: str,
    n_d9: str,
    t_d1: str,
    t_d9: str,
) -> _LuminaryEval:
    checks: list[str] = []
    wr = 0.0
    rel = 0.0
    nrv = 0.0
    rhy = 0.0
    if t_d1 == n_d1:
        checks.append(f"{label} (D1): транзит в той же накшатре, что и натал — синхронность.")
        wr -= 1; nrv -= 3; rhy -= 2
    if t_d9 == n_d9:
        checks.append(f"{label} (D9): накшатра транзита совпадает с натальной в D9.")
        wr -= 1; nrv -= 2; rhy -= 2
    if t_d1 == n_d9:
        checks.append(f"{label}: транзит D1 в накшатре натальной позиции в D9.")
        nrv -= 2; rhy -= 1
    if t_d9 == n_d1:
        checks.append(f"{label}: транзит D9 в накшатре натальной позиции в D1.")
        nrv -= 2; rhy -= 2
    sep = _nak_separation(t_lon, n_lon)
    if sep in (13, 14):
        checks.append(
            f"{label}: транзитная и натальная позиции в «оппозиции» по кругу накшатр (≈180°) — выше чувствительность и удержание."
        )
        wr += 4; nrv += 5; rhy += 2
    return _LuminaryEval(checks=checks, deltas=AlignmentScaleDeltas(wr=wr, rel=rel, nrv=nrv, rhy=rhy))


def evaluate_d1_d9_alignment(natal: NatalChartD1, snap: TransitSnapshot) -> tuple[AstroAlignment, AlignmentScaleDeltas]:
    nm = LunarSolarNakPair(d1_nak=_nak_d1(natal.moon_deg), d9_nak=_nak_d9(natal.moon_deg))
    tm = LunarSolarNakPair(d1_nak=_nak_d1(snap.moon_deg), d9_nak=_nak_d9(snap.moon_deg))
    ns = LunarSolarNakPair(d1_nak=_nak_d1(natal.sun_deg), d9_nak=_nak_d9(natal.sun_deg))
    ts = LunarSolarNakPair(d1_nak=_nak_d1(snap.sun_deg), d9_nak=_nak_d9(snap.sun_deg))

    ev_m = _eval_luminary("Луна", natal.moon_deg, snap.moon_deg, nm.d1_nak, nm.d9_nak, tm.d1_nak, tm.d9_nak)
    ev_s = _eval_luminary("Солнце", natal.sun_deg, snap.sun_deg, ns.d1_nak, ns.d9_nak, ts.d1_nak, ts.d9_nak)

    checks = ev_m.checks + ev_s.checks
    if not checks:
        checks.append(
            "Явных совпадений Луны/Солнца по D1↔D9 (как выше) сегодня нет; шкалы по транзитам считаются по базовым правилам дня."
        )

    d = AlignmentScaleDeltas(
        wr=ev_m.deltas.wr + ev_s.deltas.wr,
        rel=ev_m.deltas.rel + ev_s.deltas.rel,
        nrv=ev_m.deltas.nrv + ev_s.deltas.nrv,
        rhy=ev_m.deltas.rhy + ev_s.deltas.rhy,
    )

    summary = (
        "Сверка D1 и D9 для Луны и Солнца (натал vs транзит): учтено перед выбором типа дня и обеда."
        if len(checks) > 1
        else checks[0]
    )

    astro = AstroAlignment(
        summary=summary,
        checks=checks,
        scale_deltas=d,
        natal_moon=nm,
        transit_moon=tm,
        natal_sun=ns,
        transit_sun=ts,
    )
    return astro, d
