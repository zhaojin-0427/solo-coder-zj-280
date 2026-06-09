from datetime import datetime
from sqlalchemy import String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
import uuid

from utils.database import db


class Material(db.Model):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    material_type: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    length: Mapped[float] = mapped_column(Float, nullable=False)
    diameter: Mapped[float] = mapped_column(Float, nullable=False)
    wall_thickness: Mapped[float] = mapped_column(Float, nullable=False)
    theoretical_pitch: Mapped[float] = mapped_column(Float, nullable=False)
    theoretical_note: Mapped[str] = mapped_column(String, nullable=False)
    purchase_price: Mapped[float] = mapped_column(Float, default=0.0)
    stock_quantity: Mapped[int] = mapped_column(Float, default=0)
    loss_rate: Mapped[float] = mapped_column(Float, default=0.0)
    supplier: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "material_type": self.material_type,
            "name": self.name,
            "length": self.length,
            "diameter": self.diameter,
            "wall_thickness": self.wall_thickness,
            "theoretical_pitch": self.theoretical_pitch,
            "theoretical_note": self.theoretical_note,
            "purchase_price": self.purchase_price,
            "stock_quantity": self.stock_quantity,
            "loss_rate": self.loss_rate,
            "supplier": self.supplier,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
