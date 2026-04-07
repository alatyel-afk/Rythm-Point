from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class BodySignalEntry(BaseModel):
    day_date: date
    ankles_evening: Optional[int] = Field(None, ge=0, le=5)
    eye_area_morning: Optional[int] = Field(None, ge=0, le=5)
    weight_kg: Optional[float] = Field(None, ge=30.0, le=300.0)
    tissue_density: Optional[int] = Field(None, ge=0, le=5)
    head_overload: Optional[int] = Field(None, ge=0, le=5)
    sleep_quality: Optional[int] = Field(None, ge=0, le=5)
    sweet_craving: Optional[int] = Field(None, ge=0, le=5)
    salty_craving: Optional[int] = Field(None, ge=0, le=5)
    energy_level: Optional[int] = Field(None, ge=0, le=5)
    notes: Optional[str] = None


class NutritionLogEntry(BaseModel):
    day_date: date
    lunch_type: Optional[str] = None
    had_rice: Optional[bool] = None
    heaviness: Optional[int] = Field(None, ge=0, le=5)
    rebound_after_ekadashi_pradosh: Optional[bool] = None
    notes: Optional[str] = None


class BodySignalWithContext(BaseModel):
    signal: BodySignalEntry
    nutrition: Optional[NutritionLogEntry] = None
    tithi_number: Optional[int] = None
    nakshatra_ru: Optional[str] = None
    day_kind: Optional[str] = None
    water_retention_risk: Optional[int] = None
    release_drainage_potential: Optional[int] = None
    nervous_system_load: Optional[int] = None
