from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.booking import AudioScene, BookingStatus


class BookingBase(BaseModel):
    chime_id: str = Field(..., min_length=1)
    customer_name: str = Field(..., min_length=1, max_length=200)
    contact_info: str = Field(..., min_length=1, max_length=200)
    booking_date: datetime
    scene: str = Field(..., pattern=f'^({"|".join(AudioScene.all_scenes())})$')
    focus_points: Optional[List[str]] = None
    remarks: Optional[str] = None


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    customer_name: Optional[str] = Field(None, min_length=1, max_length=200)
    contact_info: Optional[str] = Field(None, min_length=1, max_length=200)
    booking_date: Optional[datetime] = None
    scene: Optional[str] = Field(None, pattern=f'^({"|".join(AudioScene.all_scenes())})$')
    focus_points: Optional[List[str]] = None
    remarks: Optional[str] = None
    status: Optional[str] = Field(None, pattern=f'^({"|".join(BookingStatus.all_statuses())})$')


class BookingStatusUpdate(BaseModel):
    status: str = Field(..., pattern=f'^({"|".join(BookingStatus.all_statuses())})$')
