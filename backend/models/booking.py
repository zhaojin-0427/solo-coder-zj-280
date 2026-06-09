from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
import json

from utils.database import db


class BookingStatus:
    PENDING_AUDIO = "pending_audio"
    COMPLETED = "completed"
    PENDING_FOLLOWUP = "pending_followup"
    ARCHIVED = "archived"
    CANCELLED = "cancelled"

    @classmethod
    def all_statuses(cls):
        return [
            cls.PENDING_AUDIO,
            cls.COMPLETED,
            cls.PENDING_FOLLOWUP,
            cls.ARCHIVED,
            cls.CANCELLED,
        ]

    @classmethod
    def display_names(cls):
        return {
            cls.PENDING_AUDIO: "待试音",
            cls.COMPLETED: "已完成",
            cls.PENDING_FOLLOWUP: "待回访",
            cls.ARCHIVED: "已归档",
            cls.CANCELLED: "已取消",
        }


class AudioScene:
    INDOOR = "indoor"
    COURTYARD = "courtyard"
    GIFT_CUSTOM = "gift_custom"
    OTHER = "other"

    @classmethod
    def all_scenes(cls):
        return [cls.INDOOR, cls.COURTYARD, cls.GIFT_CUSTOM, cls.OTHER]

    @classmethod
    def display_names(cls):
        return {
            cls.INDOOR: "室内",
            cls.COURTYARD: "庭院",
            cls.GIFT_CUSTOM: "礼品定制",
            cls.OTHER: "其他",
        }


class Booking(db.Model):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chime_id: Mapped[str] = mapped_column(String, ForeignKey("wind_chimes.id", ondelete="CASCADE"), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_info: Mapped[str] = mapped_column(String(200), nullable=False)
    booking_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    scene: Mapped[str] = mapped_column(String(30), nullable=False)
    focus_points: Mapped[str] = mapped_column(Text, nullable=True)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default=BookingStatus.PENDING_AUDIO)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chime = relationship("WindChime", backref="bookings")
    feedback = relationship("Feedback", uselist=False, back_populates="booking", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        try:
            focus_points = json.loads(self.focus_points) if self.focus_points else []
        except (json.JSONDecodeError, TypeError):
            focus_points = []

        data = {
            "id": self.id,
            "chime_id": self.chime_id,
            "customer_name": self.customer_name,
            "contact_info": self.contact_info,
            "booking_date": self.booking_date.isoformat() if self.booking_date else None,
            "scene": self.scene,
            "scene_display": AudioScene.display_names().get(self.scene, self.scene),
            "focus_points": focus_points,
            "remarks": self.remarks,
            "status": self.status,
            "status_display": BookingStatus.display_names().get(self.status, self.status),
            "has_feedback": self.feedback is not None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        if self.chime:
            data["chime_name"] = self.chime.name

        if self.feedback:
            data["feedback"] = self.feedback.to_dict()
            data["satisfaction_score"] = self.feedback.calculate_satisfaction()

        return data
