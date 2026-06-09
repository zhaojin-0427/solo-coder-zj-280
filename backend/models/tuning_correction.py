from datetime import datetime
from sqlalchemy import String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from utils.database import db


class TuningCorrection(db.Model):
    __tablename__ = "tuning_corrections"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chime_id: Mapped[str] = mapped_column(String, ForeignKey("wind_chimes.id", ondelete="CASCADE"))
    material_id: Mapped[str] = mapped_column(String, ForeignKey("materials.id", ondelete="CASCADE"))
    theoretical_freq: Mapped[float] = mapped_column(Float, nullable=False)
    actual_freq: Mapped[float] = mapped_column(Float, nullable=False)
    correction_cents: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    chime = relationship("WindChime", back_populates="tuning_corrections")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "chime_id": self.chime_id,
            "material_id": self.material_id,
            "theoretical_freq": self.theoretical_freq,
            "actual_freq": self.actual_freq,
            "correction_cents": self.correction_cents,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
        }
