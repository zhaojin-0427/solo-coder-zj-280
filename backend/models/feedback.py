from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
import json

from utils.database import db


class MaterialPreference:
    ALUMINUM = "aluminum"
    COPPER = "copper"
    BAMBOO = "bamboo"
    GLASS = "glass"
    MIXED = "mixed"

    @classmethod
    def all_preferences(cls):
        return [cls.ALUMINUM, cls.COPPER, cls.BAMBOO, cls.GLASS, cls.MIXED]

    @classmethod
    def display_names(cls):
        return {
            cls.ALUMINUM: "铝",
            cls.COPPER: "铜",
            cls.BAMBOO: "竹",
            cls.GLASS: "玻璃",
            cls.MIXED: "混合材质",
        }


class Feedback(db.Model):
    __tablename__ = "feedbacks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id: Mapped[str] = mapped_column(String, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    chime_id: Mapped[str] = mapped_column(String, ForeignKey("wind_chimes.id", ondelete="CASCADE"), nullable=False)
    tone_score: Mapped[int] = mapped_column(Integer, nullable=False)
    appearance_score: Mapped[int] = mapped_column(Integer, nullable=False)
    price_score: Mapped[int] = mapped_column(Integer, nullable=False)
    material_preference: Mapped[str] = mapped_column(String(30), nullable=True)
    tone_opinion: Mapped[str] = mapped_column(Text, nullable=True)
    appearance_opinion: Mapped[str] = mapped_column(Text, nullable=True)
    price_opinion: Mapped[str] = mapped_column(Text, nullable=True)
    improvement_suggestions: Mapped[str] = mapped_column(Text, nullable=True)
    tags: Mapped[str] = mapped_column(Text, nullable=True)
    overall_conclusion: Mapped[str] = mapped_column(Text, nullable=True)
    follow_up_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    booking = relationship("Booking", back_populates="feedback")
    chime = relationship("WindChime", backref="feedbacks")

    def calculate_satisfaction(self) -> float:
        scores = [self.tone_score, self.appearance_score, self.price_score]
        return round(sum(scores) / len(scores), 1)

    def to_dict(self) -> dict:
        try:
            tags = json.loads(self.tags) if self.tags else []
        except (json.JSONDecodeError, TypeError):
            tags = []

        try:
            improvement_suggestions = json.loads(self.improvement_suggestions) if self.improvement_suggestions else []
        except (json.JSONDecodeError, TypeError):
            improvement_suggestions = []

        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "chime_id": self.chime_id,
            "tone_score": self.tone_score,
            "appearance_score": self.appearance_score,
            "price_score": self.price_score,
            "satisfaction_score": self.calculate_satisfaction(),
            "material_preference": self.material_preference,
            "material_preference_display": MaterialPreference.display_names().get(
                self.material_preference, self.material_preference
            ) if self.material_preference else None,
            "tone_opinion": self.tone_opinion,
            "appearance_opinion": self.appearance_opinion,
            "price_opinion": self.price_opinion,
            "improvement_suggestions": improvement_suggestions,
            "tags": tags,
            "overall_conclusion": self.overall_conclusion,
            "follow_up_date": self.follow_up_date.isoformat() if self.follow_up_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
