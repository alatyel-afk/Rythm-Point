"""
Export JSON Schema for every Pydantic model in the domain layer.
Run: PYTHONPATH=. python scripts/export_schemas.py
Output: backend/schemas/*.schema.json
"""

import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.domain.models.body_signals import (
    BodySignalEntry,
    BodySignalWithContext,
    NutritionLogEntry,
)
from app.domain.models.natal import NatalChartD1, PlanetSidereal
from app.domain.models.protocol import (
    AromaProtocol,
    BreathBlock,
    CalendarDaySummary,
    DailyProtocol,
    DailyScales,
    LoadBlock,
    LunchSpec,
    MudraBlock,
    NutritionBlock,
    RiceDecision,
    RuleTrace,
    SupplementSlot,
    SupplementsBlock,
    ThyroidSafetyNotes,
)

MODELS = [
    DailyProtocol,
    DailyScales,
    RuleTrace,
    NutritionBlock,
    LunchSpec,
    RiceDecision,
    SupplementsBlock,
    SupplementSlot,
    BreathBlock,
    MudraBlock,
    AromaProtocol,
    LoadBlock,
    ThyroidSafetyNotes,
    CalendarDaySummary,
    BodySignalEntry,
    NutritionLogEntry,
    BodySignalWithContext,
    NatalChartD1,
    PlanetSidereal,
]


def main() -> None:
    out_dir = os.path.join(os.path.dirname(__file__), "..", "schemas")
    os.makedirs(out_dir, exist_ok=True)
    for model in MODELS:
        schema = model.model_json_schema()
        filename = f"{model.__name__}.schema.json"
        path = os.path.join(out_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(schema, f, ensure_ascii=False, indent=2)
        print(f"  {filename}")
    print(f"\n{len(MODELS)} schemas exported to {os.path.abspath(out_dir)}")


if __name__ == "__main__":
    main()
