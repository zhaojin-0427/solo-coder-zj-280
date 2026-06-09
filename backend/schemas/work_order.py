from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from models.work_order import WorkOrderStatus, WorkOrderPriority, WorkOrderStage


class WorkOrderBase(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=200)
    delivery_date: str = Field(...)
    priority: str = Field(default=WorkOrderPriority.MEDIUM)
    remarks: Optional[str] = None

    @field_validator("delivery_date")
    def validate_delivery_date(cls, v):
        try:
            datetime.fromisoformat(v.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            raise ValueError("Invalid date format, use ISO format (YYYY-MM-DDTHH:MM:SS)")
        return v

    @field_validator("priority")
    def validate_priority(cls, v):
        if v not in WorkOrderPriority.all_priorities():
            raise ValueError(f"Priority must be one of {WorkOrderPriority.all_priorities()}")
        return v


class WorkOrderCreate(WorkOrderBase):
    chime_id: str = Field(..., min_length=1)


class WorkOrderUpdate(BaseModel):
    customer_name: Optional[str] = Field(None, min_length=1, max_length=200)
    delivery_date: Optional[str] = None
    priority: Optional[str] = None
    remarks: Optional[str] = None
    status: Optional[str] = None

    @field_validator("delivery_date")
    def validate_delivery_date(cls, v):
        if v is None:
            return v
        try:
            datetime.fromisoformat(v.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            raise ValueError("Invalid date format, use ISO format (YYYY-MM-DDTHH:MM:SS)")
        return v

    @field_validator("priority")
    def validate_priority(cls, v):
        if v is None:
            return v
        if v not in WorkOrderPriority.all_priorities():
            raise ValueError(f"Priority must be one of {WorkOrderPriority.all_priorities()}")
        return v

    @field_validator("status")
    def validate_status(cls, v):
        if v is None:
            return v
        if v not in WorkOrderStatus.all_statuses():
            raise ValueError(f"Status must be one of {WorkOrderStatus.all_statuses()}")
        return v


class WorkOrderStatusUpdate(BaseModel):
    status: str = Field(...)

    @field_validator("status")
    def validate_status(cls, v):
        if v not in WorkOrderStatus.all_statuses():
            raise ValueError(f"Status must be one of {WorkOrderStatus.all_statuses()}")
        return v


class WorkOrderStageUpdate(BaseModel):
    stage: str = Field(...)
    completed: bool = Field(default=True)

    @field_validator("stage")
    def validate_stage(cls, v):
        if v not in WorkOrderStage.all_stages():
            raise ValueError(f"Stage must be one of {WorkOrderStage.all_stages()}")
        return v


class WorkOrderFilter(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    delivery_date_from: Optional[str] = None
    delivery_date_to: Optional[str] = None
    search: Optional[str] = None

    @field_validator("status")
    def validate_status(cls, v):
        if v is None:
            return v
        if v not in WorkOrderStatus.all_statuses():
            raise ValueError(f"Status must be one of {WorkOrderStatus.all_statuses()}")
        return v

    @field_validator("priority")
    def validate_priority(cls, v):
        if v is None:
            return v
        if v not in WorkOrderPriority.all_priorities():
            raise ValueError(f"Priority must be one of {WorkOrderPriority.all_priorities()}")
        return v


class WorkOrderStatistics(BaseModel):
    total_orders: int
    overdue_orders: int
    status_distribution: Dict[str, int]
    material_occupied: Dict[str, Any]
    delivery_trend: List[Dict[str, Any]]
