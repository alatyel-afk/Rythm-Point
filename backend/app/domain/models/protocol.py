from datetime import date
from typing import Any

from pydantic import BaseModel, Field

from app.domain.models.enums import (
    AromaSlot,
    BreathingPractice,
    DayType,
    LoadProfile,
    MealMatrix,
    MudraType,
    RiskLevel,
)


class DailyScales(BaseModel):
    water_retention_risk: int = Field(ge=0, le=100)
    release_drainage_potential: int = Field(ge=0, le=100)
    nervous_system_load: int = Field(ge=0, le=100)
    need_for_rhythm_precision: int = Field(ge=0, le=100)


class RiceDecision(BaseModel):
    allowed: bool
    reason: str


class LunchSpec(BaseModel):
    matrix_used: MealMatrix
    protein: str
    vegetables: str
    full_description: str
    time_window: str
    early_lunch: bool


class NutritionBlock(BaseModel):
    breakfast: str
    lunch: LunchSpec
    rice: RiceDecision
    no_food_after_18: bool = True


class SupplementSlot(BaseModel):
    time: str
    items: str


class SupplementsBlock(BaseModel):
    slots: list[SupplementSlot]
    endoluten_today: bool
    endoluten_note: str


class BreathBlock(BaseModel):
    practice: BreathingPractice
    title_ru: str
    minutes: int
    best_time: str
    posture: str
    technique: str
    tongue_position: str
    contraindication: str


class MudraBlock(BaseModel):
    mudra: MudraType
    suggested: bool
    name_ru: str
    duration_minutes: int
    reason: str
    finger_technique: str
    posture: str
    breathing_during: str
    tongue_position: str
    when_to_do: str
    caution: str


class AromaProtocol(BaseModel):
    morning: AromaSlot
    morning_detail: str
    daytime: AromaSlot
    daytime_detail: str
    evening: AromaSlot
    evening_detail: str


class LoadBlock(BaseModel):
    profile: LoadProfile
    detail: str


class ThyroidSafetyNotes(BaseModel):
    mode: str = "conservative_thyroid_safe"
    notes: list[str]


class AlignmentScaleDeltas(BaseModel):
    wr: float
    rel: float
    nrv: float
    rhy: float


class LunarSolarNakPair(BaseModel):
    d1_nak: str
    d9_nak: str


class AstroAlignment(BaseModel):
    summary: str
    checks: list[str]
    scale_deltas: AlignmentScaleDeltas
    natal_moon: LunarSolarNakPair
    transit_moon: LunarSolarNakPair
    natal_sun: LunarSolarNakPair
    transit_sun: LunarSolarNakPair


class RuleTrace(BaseModel):
    day_type_rules: list[str]
    scales_modifiers: list[str]
    rice_rules: list[str]
    breathing_rules: list[str]
    mudra_rules: list[str]
    thyroid_rules: list[str]
    body_signal_rules: list[str]
    meal_matrix_rules: list[str]
    load_rules: list[str]
    aroma_rules: list[str]
    alignment_rules: list[str]


class DailyProtocol(BaseModel):
    date: date
    weekday: str
    lunar_day_number: int = Field(ge=1, le=30)
    moon_phase: str
    nakshatra: str
    ekadashi_flag: bool
    pradosh_flag: bool
    day_type: DayType
    body_effect_summary: str
    nutrition: NutritionBlock
    supplements: SupplementsBlock
    breathing_practice: BreathBlock
    mudra_recommendation: MudraBlock
    aroma_protocol: AromaProtocol
    movement_load: LoadBlock
    thyroid_safety_notes: ThyroidSafetyNotes
    body_markers_to_track: list[str]
    warnings: list[str]
    scales: DailyScales
    moon_illumination_pct: float
    matrix_index: int
    astro_alignment: AstroAlignment
    rule_trace: RuleTrace
    debug: dict[str, Any] | None = None


class CalendarDaySummary(BaseModel):
    date: date
    lunar_day_number: int
    nakshatra: str
    ekadashi_flag: bool
    pradosh_flag: bool
    day_type: DayType
    water_retention_risk: int
    release_drainage_potential: int
    matrix_index: int
