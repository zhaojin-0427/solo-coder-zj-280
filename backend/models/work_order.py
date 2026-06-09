from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
import json

from utils.database import db


class WorkOrderStatus:
    PENDING_MATERIAL = "pending_material"
    IN_PRODUCTION = "in_production"
    PENDING_TUNING = "pending_tuning"
    COMPLETED = "completed"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

    @classmethod
    def all_statuses(cls):
        return [
            cls.PENDING_MATERIAL,
            cls.IN_PRODUCTION,
            cls.PENDING_TUNING,
            cls.COMPLETED,
            cls.DELIVERED,
            cls.CANCELLED,
        ]

    @classmethod
    def display_names(cls):
        return {
            cls.PENDING_MATERIAL: "待备料",
            cls.IN_PRODUCTION: "制作中",
            cls.PENDING_TUNING: "待调音",
            cls.COMPLETED: "已完成",
            cls.DELIVERED: "已交付",
            cls.CANCELLED: "已取消",
        }


class WorkOrderPriority:
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

    @classmethod
    def all_priorities(cls):
        return [cls.LOW, cls.MEDIUM, cls.HIGH, cls.URGENT]

    @classmethod
    def display_names(cls):
        return {
            cls.LOW: "低",
            cls.MEDIUM: "中",
            cls.HIGH: "高",
            cls.URGENT: "紧急",
        }


class WorkOrderStage:
    MATERIAL_PREP = "material_prep"
    PRODUCTION = "production"
    TUNING = "tuning"
    PACKAGING = "packaging"

    @classmethod
    def all_stages(cls):
        return [cls.MATERIAL_PREP, cls.PRODUCTION, cls.TUNING, cls.PACKAGING]

    @classmethod
    def display_names(cls):
        return {
            cls.MATERIAL_PREP: "备料完成",
            cls.PRODUCTION: "制作完成",
            cls.TUNING: "调音完成",
            cls.PACKAGING: "包装完成",
        }


class WorkOrder(db.Model):
    __tablename__ = "work_orders"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    chime_id: Mapped[str] = mapped_column(String, ForeignKey("wind_chimes.id", ondelete="CASCADE"), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    delivery_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default=WorkOrderPriority.MEDIUM)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default=WorkOrderStatus.PENDING_MATERIAL)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    materials_snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    cost_snapshot: Mapped[str] = mapped_column(Text, nullable=True)
    tuning_records_snapshot: Mapped[str] = mapped_column(Text, nullable=True)
    stages_completed: Mapped[str] = mapped_column(Text, nullable=False, default=lambda: json.dumps({}))
    inventory_deducted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    chime = relationship("WindChime", backref="work_orders")

    def to_dict(self) -> dict:
        try:
            stages_completed = json.loads(self.stages_completed) if self.stages_completed else {}
        except (json.JSONDecodeError, TypeError):
            stages_completed = {}

        try:
            materials_snapshot = json.loads(self.materials_snapshot) if self.materials_snapshot else []
        except (json.JSONDecodeError, TypeError):
            materials_snapshot = []

        try:
            cost_snapshot = json.loads(self.cost_snapshot) if self.cost_snapshot else None
        except (json.JSONDecodeError, TypeError):
            cost_snapshot = None

        try:
            tuning_records_snapshot = json.loads(self.tuning_records_snapshot) if self.tuning_records_snapshot else []
        except (json.JSONDecodeError, TypeError):
            tuning_records_snapshot = []

        return {
            "id": self.id,
            "chime_id": self.chime_id,
            "customer_name": self.customer_name,
            "delivery_date": self.delivery_date.isoformat() if self.delivery_date else None,
            "priority": self.priority,
            "priority_display": WorkOrderPriority.display_names().get(self.priority, self.priority),
            "status": self.status,
            "status_display": WorkOrderStatus.display_names().get(self.status, self.status),
            "remarks": self.remarks,
            "materials_snapshot": materials_snapshot,
            "cost_snapshot": cost_snapshot,
            "tuning_records_snapshot": tuning_records_snapshot,
            "stages_completed": stages_completed,
            "inventory_deducted": self.inventory_deducted,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
