from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from utils.database import db


class WindChime(db.Model):
    __tablename__ = "wind_chimes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    materials: Mapped[str] = mapped_column(Text, nullable=False)
    hang_order: Mapped[str] = mapped_column(Text, nullable=False)
    chord_info: Mapped[str] = mapped_column(Text, nullable=False)
    cost_snapshot: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tuning_corrections = relationship("TuningCorrection", back_populates="chime", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        import json
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "materials": json.loads(self.materials) if self.materials else [],
            "hang_order": json.loads(self.hang_order) if self.hang_order else [],
            "chord_info": json.loads(self.chord_info) if self.chord_info else {},
            "cost_snapshot": json.loads(self.cost_snapshot) if self.cost_snapshot else None,
            "tuning_corrections": [tc.to_dict() for tc in self.tuning_corrections] if self.tuning_corrections else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
