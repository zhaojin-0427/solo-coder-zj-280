from pydantic import BaseModel, Field, field_validator
from typing import Optional
from utils.constants import MaterialType


class MaterialCreate(BaseModel):
    material_type: str
    name: str = Field(..., min_length=1, max_length=100)
    length: float = Field(..., gt=0, lt=1000)
    diameter: float = Field(..., gt=0, lt=100)
    wall_thickness: float = Field(..., gt=0, lt=20)

    @field_validator("material_type")
    def validate_material_type(cls, v):
        valid_types = [t.value for t in MaterialType]
        if v not in valid_types:
            raise ValueError(f"Material type must be one of {valid_types}")
        return v


class MaterialUpdate(BaseModel):
    material_type: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    length: Optional[float] = Field(None, gt=0, lt=1000)
    diameter: Optional[float] = Field(None, gt=0, lt=100)
    wall_thickness: Optional[float] = Field(None, gt=0, lt=20)
    theoretical_pitch: Optional[float] = None
    theoretical_note: Optional[str] = None

    @field_validator("material_type")
    def validate_material_type(cls, v):
        if v is None:
            return v
        valid_types = [t.value for t in MaterialType]
        if v not in valid_types:
            raise ValueError(f"Material type must be one of {valid_types}")
        return v
