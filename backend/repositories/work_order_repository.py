from typing import List, Optional, Dict, Any
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import joinedload
from datetime import datetime, timedelta
import json

from .base_repository import BaseRepository
from models.work_order import WorkOrder, WorkOrderStatus
from models.material import Material
from models.chime import WindChime
from utils.database import db


class WorkOrderRepository(BaseRepository[WorkOrder]):
    def __init__(self):
        super().__init__(WorkOrder, db.session)

    def get_all_filtered(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        delivery_date_from: Optional[str] = None,
        delivery_date_to: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[List[WorkOrder], int]:
        stmt = select(WorkOrder).options(joinedload(WorkOrder.chime))

        conditions = []
        if status:
            conditions.append(WorkOrder.status == status)
        if priority:
            conditions.append(WorkOrder.priority == priority)
        if delivery_date_from:
            try:
                date_from = datetime.fromisoformat(delivery_date_from.replace("Z", "+00:00"))
                conditions.append(WorkOrder.delivery_date >= date_from)
            except (ValueError, TypeError):
                pass
        if delivery_date_to:
            try:
                date_to = datetime.fromisoformat(delivery_date_to.replace("Z", "+00:00"))
                conditions.append(WorkOrder.delivery_date <= date_to)
            except (ValueError, TypeError):
                pass
        if search:
            search_pattern = f"%{search}%"
            conditions.append(
                or_(
                    WorkOrder.customer_name.like(search_pattern),
                    WorkOrder.remarks.like(search_pattern),
                )
            )

        if conditions:
            stmt = stmt.where(and_(*conditions))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db_session.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(WorkOrder.priority.desc(), WorkOrder.delivery_date.asc()).offset(skip).limit(limit)
        result = self.db_session.execute(stmt)
        orders = list(result.scalars().unique().all())

        return orders, total

    def get_by_chime_id(self, chime_id: str) -> List[WorkOrder]:
        stmt = (
            select(WorkOrder)
            .options(joinedload(WorkOrder.chime))
            .where(WorkOrder.chime_id == chime_id)
            .order_by(WorkOrder.created_at.desc())
        )
        result = self.db_session.execute(stmt)
        return list(result.scalars().all())

    def get_latest_by_chime_id(self, chime_id: str) -> Optional[WorkOrder]:
        stmt = (
            select(WorkOrder)
            .options(joinedload(WorkOrder.chime))
            .where(WorkOrder.chime_id == chime_id)
            .order_by(WorkOrder.created_at.desc())
            .limit(1)
        )
        result = self.db_session.execute(stmt)
        return result.scalar_one_or_none()

    def get_overdue_orders(self) -> List[WorkOrder]:
        now = datetime.utcnow()
        active_statuses = [
            WorkOrderStatus.PENDING_MATERIAL,
            WorkOrderStatus.IN_PRODUCTION,
            WorkOrderStatus.PENDING_TUNING,
            WorkOrderStatus.COMPLETED,
        ]
        stmt = (
            select(WorkOrder)
            .options(joinedload(WorkOrder.chime))
            .where(
                and_(
                    WorkOrder.delivery_date < now,
                    WorkOrder.status.in_(active_statuses),
                )
            )
            .order_by(WorkOrder.delivery_date.asc())
        )
        result = self.db_session.execute(stmt)
        return list(result.scalars().all())

    def get_status_distribution(self) -> Dict[str, int]:
        stmt = select(WorkOrder.status, func.count(WorkOrder.id)).group_by(WorkOrder.status)
        result = self.db_session.execute(stmt)
        distribution = {}
        for status, count in result.all():
            distribution[status] = count
        return distribution

    def get_material_occupied(self) -> Dict[str, Any]:
        active_statuses = [
            WorkOrderStatus.PENDING_MATERIAL,
            WorkOrderStatus.IN_PRODUCTION,
            WorkOrderStatus.PENDING_TUNING,
            WorkOrderStatus.COMPLETED,
        ]
        stmt = (
            select(WorkOrder)
            .where(
                and_(
                    WorkOrder.inventory_deducted == True,
                    WorkOrder.status.in_(active_statuses),
                )
            )
        )
        result = self.db_session.execute(stmt)
        orders = list(result.scalars().all())

        material_usage: Dict[str, Dict[str, Any]] = {}
        total_occupied_value = 0.0

        for order in orders:
            try:
                materials = json.loads(order.materials_snapshot) if order.materials_snapshot else []
            except (json.JSONDecodeError, TypeError):
                materials = []

            for mat in materials:
                mat_id = mat.get("id") or mat.get("material_id")
                if not mat_id:
                    continue

                if mat_id not in material_usage:
                    material_usage[mat_id] = {
                        "material_id": mat_id,
                        "material_name": mat.get("name", ""),
                        "material_type": mat.get("material_type", ""),
                        "quantity": 0,
                        "total_value": 0.0,
                    }

                material_usage[mat_id]["quantity"] += 1
                price = mat.get("purchase_price", 0)
                material_usage[mat_id]["total_value"] += price
                total_occupied_value += price

        return {
            "by_material": list(material_usage.values()),
            "total_orders_with_deducted_inventory": len(orders),
            "total_occupied_value": round(total_occupied_value, 2),
        }

    def get_delivery_trend(self, days: int = 30) -> List[Dict[str, Any]]:
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days - 1)

        delivered_status = WorkOrderStatus.DELIVERED

        stmt = (
            select(
                func.date(WorkOrder.updated_at).label("delivery_date"),
                func.count(WorkOrder.id).label("count"),
            )
            .where(
                and_(
                    WorkOrder.status == delivered_status,
                    func.date(WorkOrder.updated_at) >= start_date,
                    func.date(WorkOrder.updated_at) <= end_date,
                )
            )
            .group_by(func.date(WorkOrder.updated_at))
            .order_by(func.date(WorkOrder.updated_at).asc())
        )
        result = self.db_session.execute(stmt)
        daily_data = {str(row[0]): row[1] for row in result.all()}

        trend = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            date_str = str(current_date)
            trend.append(
                {
                    "date": date_str,
                    "delivered_count": daily_data.get(date_str, 0),
                }
            )

        return trend

    def deduct_inventory(self, work_order: WorkOrder) -> bool:
        if work_order.inventory_deducted:
            return False

        try:
            materials = json.loads(work_order.materials_snapshot) if work_order.materials_snapshot else []
        except (json.JSONDecodeError, TypeError):
            materials = []

        material_counts: Dict[str, int] = {}
        for mat in materials:
            mat_id = mat.get("id") or mat.get("material_id")
            if mat_id:
                material_counts[mat_id] = material_counts.get(mat_id, 0) + 1

        for mat_id, count in material_counts.items():
            material = self.db_session.get(Material, mat_id)
            if material:
                if material.stock_quantity < count:
                    raise ValueError(f"材料 {material.name} 库存不足，当前库存: {material.stock_quantity}, 需要: {count}")
                material.stock_quantity -= count

        work_order.inventory_deducted = True
        self.db_session.flush()
        return True

    def restore_inventory(self, work_order: WorkOrder) -> bool:
        if not work_order.inventory_deducted:
            return False

        try:
            materials = json.loads(work_order.materials_snapshot) if work_order.materials_snapshot else []
        except (json.JSONDecodeError, TypeError):
            materials = []

        material_counts: Dict[str, int] = {}
        for mat in materials:
            mat_id = mat.get("id") or mat.get("material_id")
            if mat_id:
                material_counts[mat_id] = material_counts.get(mat_id, 0) + 1

        for mat_id, count in material_counts.items():
            material = self.db_session.get(Material, mat_id)
            if material:
                material.stock_quantity += count

        work_order.inventory_deducted = False
        self.db_session.flush()
        return True

    def update_stage(self, work_order: WorkOrder, stage: str, completed: bool) -> WorkOrder:
        try:
            stages = json.loads(work_order.stages_completed) if work_order.stages_completed else {}
        except (json.JSONDecodeError, TypeError):
            stages = {}

        stages[stage] = {
            "completed": completed,
            "completed_at": datetime.utcnow().isoformat() if completed else None,
        }

        work_order.stages_completed = json.dumps(stages)
        self.db_session.flush()
        return work_order

    def get_chimes_with_work_order_status(self) -> List[Dict[str, Any]]:
        stmt = select(WindChime).options(joinedload(WindChime.tuning_corrections))
        result = self.db_session.execute(stmt)
        chimes = list(result.scalars().unique().all())

        chime_ids = [c.id for c in chimes]
        work_order_stmt = (
            select(WorkOrder)
            .where(WorkOrder.chime_id.in_(chime_ids))
            .order_by(WorkOrder.created_at.desc())
        )
        wo_result = self.db_session.execute(work_order_stmt)
        all_work_orders = list(wo_result.scalars().all())

        wo_by_chime: Dict[str, List[WorkOrder]] = {}
        for wo in all_work_orders:
            if wo.chime_id not in wo_by_chime:
                wo_by_chime[wo.chime_id] = []
            wo_by_chime[wo.chime_id].append(wo)

        result_list = []
        for chime in chimes:
            chime_dict = chime.to_dict()
            work_orders = wo_by_chime.get(chime.id, [])
            latest_wo = work_orders[0] if work_orders else None

            chime_dict["has_work_order"] = len(work_orders) > 0
            chime_dict["work_order_count"] = len(work_orders)
            if latest_wo:
                chime_dict["latest_work_order"] = {
                    "id": latest_wo.id,
                    "status": latest_wo.status,
                    "status_display": WorkOrderStatus.display_names().get(latest_wo.status, latest_wo.status),
                    "priority": latest_wo.priority,
                    "customer_name": latest_wo.customer_name,
                    "delivery_date": latest_wo.delivery_date.isoformat() if latest_wo.delivery_date else None,
                }
            else:
                chime_dict["latest_work_order"] = None

            result_list.append(chime_dict)

        return result_list
