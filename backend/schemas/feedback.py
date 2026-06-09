from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.feedback import MaterialPreference


class FeedbackBase(BaseModel):
    tone_score: int = Field(..., ge=1, le=5)
    appearance_score: int = Field(..., ge=1, le=5)
    price_score: int = Field(..., ge=1, le=5)
    material_preference: Optional[str] = Field(None, pattern=f'^({"|".join(MaterialPreference.all_preferences())})$')
    tone_opinion: Optional[str] = None
    appearance_opinion: Optional[str] = None
    price_opinion: Optional[str] = None
    improvement_suggestions: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    overall_conclusion: Optional[str] = None
    follow_up_date: Optional[datetime] = None


class FeedbackCreate(FeedbackBase):
    booking_id: str = Field(..., min_length=1)
    chime_id: str = Field(..., min_length=1)
    write_back_to_chime: Optional[bool] = False


class FeedbackUpdate(BaseModel):
    tone_score: Optional[int] = Field(None, ge=1, le=5)
    appearance_score: Optional[int] = Field(None, ge=1, le=5)
    price_score: Optional[int] = Field(None, ge=1, le=5)
    material_preference: Optional[str] = Field(None, pattern=f'^({"|".join(MaterialPreference.all_preferences())})$')
    tone_opinion: Optional[str] = None
    appearance_opinion: Optional[str] = None
    price_opinion: Optional[str] = None
    improvement_suggestions: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    overall_conclusion: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    write_back_to_chime: Optional[bool] = False


class BookingFeedbackFilter(BaseModel):
    status: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    customer_name: Optional[str] = None
    chime_id: Optional[str] = None
    chime_name: Optional[str] = None
    satisfaction_min: Optional[float] = Field(None, ge=1, le=5)
    satisfaction_max: Optional[float] = Field(None, ge=1, le=5)
