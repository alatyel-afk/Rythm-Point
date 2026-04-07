from dataclasses import asdict
from datetime import date, datetime

from fastapi import APIRouter, Query
from fastapi.encoders import jsonable_encoder
from zoneinfo import ZoneInfo

from app.domain.models.body_signals import BodySignalEntry, BodySignalWithContext, NutritionLogEntry
from app.domain.models.enums import AyanamshaMode
from app.domain.services.body_signal_store import (
    get_body_signal,
    get_nutrition_log,
    list_body_signals,
    list_nutrition_logs,
    upsert_body_signal,
    upsert_nutrition_log,
)
from app.domain.services.meal_matrices import all_meals_for_matrix
from app.domain.services.recommendation_engine import RecommendationEngine

router = APIRouter()
_engine = RecommendationEngine()


def _today_in_tz(tz: str) -> date:
    return datetime.now(ZoneInfo(tz)).date()


# ── Protocol ──

@router.get("/today", response_model_exclude_none=True)
def get_today(
    on: date | None = Query(None),
    timezone: str = Query("Europe/Moscow"),
    ayanamsha: AyanamshaMode = Query(AyanamshaMode.LAHIRI),
    debug: bool = Query(False),
):
    d = on or _today_in_tz(timezone)
    signals = get_body_signal(d)
    return _engine.build_protocol(d, timezone, ayanamsha=ayanamsha, body_signals=signals, include_debug=debug)


@router.get("/calendar")
def get_calendar(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    timezone: str = Query("Europe/Moscow"),
    ayanamsha: AyanamshaMode = Query(AyanamshaMode.LAHIRI),
):
    return _engine.build_calendar_month(year, month, timezone, ayanamsha=ayanamsha)


@router.get("/lunar-matrix")
def get_lunar_matrix():
    from app.domain.models.enums import MealMatrix
    result = {}
    for mx in MealMatrix:
        meals = all_meals_for_matrix(mx)
        result[mx.value] = [asdict(m) for m in meals]
    return result


# ── Body Signals ──

@router.post("/body-signals")
def post_body_signal(entry: BodySignalEntry):
    return upsert_body_signal(entry)


@router.get("/body-signals/{day_date}")
def get_body_signal_by_date(day_date: date):
    s = get_body_signal(day_date)
    if not s:
        return {"detail": "no entry", "day_date": str(day_date)}
    return s


@router.get("/body-signals")
def get_body_signals_range(
    from_date: date = Query(...),
    to_date: date = Query(...),
):
    return list_body_signals(from_date, to_date)


# ── Nutrition Log ──

@router.post("/nutrition-log")
def post_nutrition_log(entry: NutritionLogEntry):
    return upsert_nutrition_log(entry)


@router.get("/nutrition-log/{day_date}")
def get_nutrition_log_by_date(day_date: date):
    n = get_nutrition_log(day_date)
    if not n:
        return {"detail": "no entry", "day_date": str(day_date)}
    return n


@router.get("/nutrition-log")
def get_nutrition_logs_range(
    from_date: date = Query(...),
    to_date: date = Query(...),
):
    return list_nutrition_logs(from_date, to_date)


# ── History with Astro Context ──

@router.get("/history", response_model=list[BodySignalWithContext])
def get_history_with_context(
    from_date: date = Query(...),
    to_date: date = Query(...),
    timezone: str = Query("Europe/Moscow"),
):
    signals = list_body_signals(from_date, to_date)
    result: list[BodySignalWithContext] = []
    for sig in signals:
        nutr = get_nutrition_log(sig.day_date)
        try:
            proto = _engine.build_protocol(sig.day_date, timezone)
            result.append(BodySignalWithContext(
                signal=sig,
                nutrition=nutr,
                tithi_number=proto.lunar_day_number,
                nakshatra_ru=proto.nakshatra,
                day_kind=proto.day_type.value,
                water_retention_risk=proto.scales.water_retention_risk,
                release_drainage_potential=proto.scales.release_drainage_potential,
                nervous_system_load=proto.scales.nervous_system_load,
            ))
        except Exception:
            result.append(BodySignalWithContext(signal=sig, nutrition=nutr))
    return result
