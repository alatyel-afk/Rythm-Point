"""
In-memory хранилище для MVP. Заменяется на PostgreSQL-репозиторий без изменения интерфейса.
"""

from datetime import date

from app.domain.models.body_signals import BodySignalEntry, NutritionLogEntry

_signals: dict[date, BodySignalEntry] = {}
_nutrition: dict[date, NutritionLogEntry] = {}


def upsert_body_signal(entry: BodySignalEntry) -> BodySignalEntry:
    _signals[entry.day_date] = entry
    return entry


def get_body_signal(d: date) -> BodySignalEntry | None:
    return _signals.get(d)


def list_body_signals(from_date: date, to_date: date) -> list[BodySignalEntry]:
    return sorted(
        [e for e in _signals.values() if from_date <= e.day_date <= to_date],
        key=lambda e: e.day_date,
    )


def upsert_nutrition_log(entry: NutritionLogEntry) -> NutritionLogEntry:
    _nutrition[entry.day_date] = entry
    return entry


def get_nutrition_log(d: date) -> NutritionLogEntry | None:
    return _nutrition.get(d)


def list_nutrition_logs(from_date: date, to_date: date) -> list[NutritionLogEntry]:
    return sorted(
        [e for e in _nutrition.values() if from_date <= e.day_date <= to_date],
        key=lambda e: e.day_date,
    )
