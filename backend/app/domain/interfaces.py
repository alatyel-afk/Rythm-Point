"""
Formal contracts for every rule engine component.
Concrete implementations live in app.domain.services.
These protocols define what each selector MUST return
and under what signature, so the system stays deterministic,
testable, and replaceable without touching the engine.
"""

from __future__ import annotations

from datetime import date
from typing import Any, Protocol, runtime_checkable

from app.domain.models.body_signals import BodySignalEntry
from app.domain.models.enums import (
    AyanamshaMode,
    DayType,
    MealMatrix,
)
from app.domain.models.natal import NatalChartD1
from app.domain.models.protocol import (
    AromaProtocol,
    BreathBlock,
    CalendarDaySummary,
    DailyProtocol,
    DailyScales,
    MudraBlock,
    RiceDecision,
    SupplementsBlock,
    ThyroidSafetyNotes,
)
from app.domain.services.body_signal_interpreter import SignalOverride
from app.domain.services.meal_matrices import MealOption


# ── Selectors: each returns (result, trace) ────────────────


@runtime_checkable
class RiceDecider(Protocol):
    """Decide whether rice is allowed for the given context."""

    def __call__(
        self,
        day_type: DayType,
        scales: DailyScales,
        signal_override: SignalOverride,
    ) -> tuple[RiceDecision, list[str]]: ...


@runtime_checkable
class BreathSelector(Protocol):
    """Select a breathing practice for the day."""

    def __call__(
        self,
        day_type: DayType,
        mental_overload: bool = False,
    ) -> tuple[BreathBlock, list[str]]: ...


@runtime_checkable
class MudraSelector(Protocol):
    """Select or omit a mudra for the day."""

    def __call__(
        self,
        day_type: DayType,
        high_retention_risk: bool,
        high_head_pressure: bool,
        low_energy_no_swelling: bool,
    ) -> tuple[MudraBlock, list[str]]: ...


@runtime_checkable
class AromaSelector(Protocol):
    """Select morning/daytime/evening aroma protocol."""

    def __call__(
        self,
        day_type: DayType,
    ) -> tuple[AromaProtocol, list[str]]: ...


@runtime_checkable
class BodySignalInterpreter(Protocol):
    """Interpret raw body signals into override flags."""

    def __call__(
        self,
        entry: BodySignalEntry | None,
    ) -> SignalOverride: ...


@runtime_checkable
class MealPicker(Protocol):
    """Pick a concrete meal from a matrix by day-of-year rotation."""

    def __call__(
        self,
        matrix: MealMatrix,
        day_of_year: int,
    ) -> MealOption: ...


@runtime_checkable
class SupplementBuilder(Protocol):
    """Build the supplement schedule for a given date."""

    def __call__(self, d: date) -> SupplementsBlock: ...


@runtime_checkable
class ThyroidSafetyBuilder(Protocol):
    """Return the mandatory thyroid safety notes block."""

    def __call__(self) -> ThyroidSafetyNotes: ...


# ── Astrology computation interface ─────────────────────────


@runtime_checkable
class AstroComputer(Protocol):
    """
    Pure astronomical computation.
    Returns planetary positions, tithi, nakshatra, moon phase,
    Ekadashi/Pradosh flags, and transit aspects.
    Does NOT classify day types or build recommendations.
    """

    def compute_snapshot(
        self,
        d: date,
        timezone: str,
        ayanamsha: AyanamshaMode = AyanamshaMode.LAHIRI,
    ) -> Any: ...

    def analyze_transits_to_natal(
        self,
        snap: Any,
        natal: NatalChartD1,
    ) -> Any: ...


# ── Top-level engine interface ──────────────────────────────


@runtime_checkable
class ProtocolEngine(Protocol):
    """
    The top-level orchestrator.
    Consumes an astro snapshot + natal chart + body signals,
    runs every deterministic selector, collects rule traces,
    and produces a fully populated DailyProtocol.
    """

    def build_protocol(
        self,
        d: date,
        timezone: str,
        natal: NatalChartD1 | None = None,
        ayanamsha: AyanamshaMode = AyanamshaMode.LAHIRI,
        body_signals: BodySignalEntry | None = None,
        *,
        include_debug: bool = False,
    ) -> DailyProtocol: ...

    def build_calendar_month(
        self,
        year: int,
        month: int,
        timezone: str,
        natal: NatalChartD1 | None = None,
        ayanamsha: AyanamshaMode = AyanamshaMode.LAHIRI,
    ) -> list[CalendarDaySummary]: ...
