from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ChordInfo(BaseModel):
    chord_name: str
    frequencies: List[float]
    notes: List[str]


class TuningCorrection(BaseModel):
    material_id: str
    theoretical_freq: float
    actual_freq: float
    correction_cents: float
    recorded_at: Optional[str] = None


class WindChimeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    materials: List[str] = Field(..., min_items=1)
    hang_order: List[str]
    chord_info: Dict[str, Any]
    tuning_corrections: Optional[List[TuningCorrection]] = None


class WindChimeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    materials: Optional[List[str]] = None
    hang_order: Optional[List[str]] = None
    chord_info: Optional[Dict[str, Any]] = None
