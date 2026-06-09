from pydantic import BaseModel, Field, field_validator
from typing import List
from utils.constants import MaterialType


class PitchCalculateRequest(BaseModel):
    material_type: str
    length: float = Field(..., gt=0, lt=1000)
    diameter: float = Field(..., gt=0, lt=100)
    wall_thickness: float = Field(..., gt=0, lt=20)

    @field_validator("material_type")
    def validate_material_type(cls, v):
        valid_types = [t.value for t in MaterialType]
        if v not in valid_types:
            raise ValueError(f"Material type must be one of {valid_types}")
        return v


class ChordAnalyzeRequest(BaseModel):
    frequencies: List[float] = Field(..., min_items=1, max_items=12)

    @field_validator("frequencies")
    def validate_frequencies(cls, v):
        for f in v:
            if f <= 0 or f > 20000:
                raise ValueError("Frequency must be between 0 and 20000 Hz")
        return v
