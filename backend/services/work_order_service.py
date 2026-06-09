from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from repositories.work_order_repository import WorkOrderRepository
from repositories.chime_repository import ChimeRepository
from repositories.material_repository import MaterialRepository
from models.work_order import WorkOrder, WorkOrderStatus, WorkOrderStage
from utils.database import db


class WorkOrderService:
    def __init__(self):
        self.repository = WorkOrderRepository()
        self.chime_repository = ChimeRepository()
        self.material_repository = MaterialRepository()

    def get_all(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        delivery_date_from: Optional[str] = None,
        delivery_date_to: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[List[WorkOrder], int]:
        return self.repository.get_all_filtered(
            status=status,
            priority=priority,
            delivery_date_from=delivery_date_from,
            delivery_date_to=delivery_date_to,
            search=search,
            skip=skip,
            limit=limit,
        )

    def get_by_id(self, work_order_id: str) -> Optional[WorkOrder]:
        return self.repository.get_by_id(work_order_id)

    def get_by_chime_id(self, chime_id: str) -> List[WorkOrder]:
        return self.repository.get_by_chime_id(chime_id)

    def get_latest_by_chime_id(self, chime_id: str) -> Optional[WorkOrder]:
        return self.repository.get_latest_by_chime_id(chime_id)

    def create(self, data: dict) -> WorkOrder:
        chime = self.chime_repository.get_by_id(data["chime_id"])
        if not chime:
            raise ValueError("风铃作品不存在")

        existing_orders = self.repository.get_by_chime_id(data["chime_id"])
        for order in existing_orders:
            if order.status not in [WorkOrderStatus.DELIVERED, WorkOrderStatus.CANCELLED]:
                raise ValueError("该作品已有未完成的工单，请先完成或取消现有工单")

        chime_dict = chime.to_dict()
        materials = chime_dict.get("materials", [])
        cost_snapshot = chime_dict.get("cost_snapshot")
        tuning_corrections = chime_dict.get("tuning_corrections", [])

        material_details = []
        for mat in materials:
            if isinstance(mat, str):
                mat_obj = self.material_repository.get_by_id(mat)
                if mat_obj:
                    material_details.append(mat_obj.to_dict())
            elif isinstance(mat, dict):
                material_details.append(mat)

        delivery_date = datetime.fromisoformat(data["delivery_date"].replace("Z", "+00:00"))

        work_order_data = {
            "chime_id": data["chime_id"],
            "customer_name": data["customer_name"],
            "delivery_date": delivery_date,
            "priority": data.get("priority", WorkOrderPriority.MEDIUM),
            "remarks": data.get("remarks"),
            "materials_snapshot": json.dumps(material_details),
            "cost_snapshot": json.dumps(cost_snapshot) if cost_snapshot else None,
            "tuning_records_snapshot": json.dumps(tuning_corrections) if tuning_corrections else None,
            "stages_completed": json.dumps({}),
            "inventory_deducted": False,
        }

        work_order = self.repository.create(work_order_data)
        db.session.commit()
        return work_order

    def update(self, work_order_id: str, data: dict) -> Optional[WorkOrder]:
        work_order = self.repository.get_by_id(work_order_id)
        if not work_order:
            return None

        update_data = {}
        if "customer_name" in data:
            update_data["customer_name"] = data["customer_name"]
        if "delivery_date" in data:
            update_data["delivery_date"] = datetime.fromisoformat(
                data["delivery_date"].replace("Z", "+00:00")
            )
        if "priority" in data:
            update_data["priority"] = data["priority"]
        if "remarks" in data:
            update_data["remarks"] = data["remarks"]
        if "status" in data:
            new_status = data["status"]
            old_status = work_order.status

            if (
                old_status != WorkOrderStatus.IN_PRODUCTION
                and new_status == WorkOrderStatus.IN_PRODUCTION
            ):
                self.repository.deduct_inventory(work_order)

            if (
                old_status == WorkOrderStatus.IN_PRODUCTION
                and new_status in [WorkOrderStatus.CANCELLED, WorkOrderStatus.PENDING_MATERIAL]
            ):
                self.repository.restore_inventory(work_order)

            if (
                old_status == WorkOrderStatus.CANCELLED
                and new_status not in [WorkOrderStatus.CANCELLED]
            ):
                pass

            update_data["status"] = new_status

        updated = self.repository.update(work_order, update_data)
        db.session.commit()
        return updated

    def update_status(self, work_order_id: str, new_status: str) -> Optional[WorkOrder]:
        work_order = self.repository.get_by_id(work_order_id)
        if not work_order:
            return None

        old_status = work_order.status

        if (
            old_status != WorkOrderStatus.IN_PRODUCTION
            and new_status == WorkOrderStatus.IN_PRODUCTION
        ):
            try:
                self.repository.deduct_inventory(work_order)
            except ValueError as e:
                db.session.rollback()
                raise e

        if (
            old_status == WorkOrderStatus.IN_PRODUCTION
            and new_status in [WorkOrderStatus.CANCELLED, WorkOrderStatus.PENDING_MATERIAL]
        ):
            self.repository.restore_inventory(work_order)

        work_order.status = new_status
        db.session.commit()
        return work_order

    def update_stage(self, work_order_id: str, stage: str, completed: bool) -> Optional[WorkOrder]:
        work_order = self.repository.get_by_id(work_order_id)
        if not work_order:
            return None

        updated = self.repository.update_stage(work_order, stage, completed)

        stages = json.loads(updated.stages_completed) if updated.stages_completed else {}

        all_stages = WorkOrderStage.all_stages()
        if all(stages.get(s, {}).get("completed", False) for s in all_stages):
            if updated.status not in [WorkOrderStatus.DELIVERED, WorkOrderStatus.CANCELLED, WorkOrderStatus.COMPLETED]:
                updated.status = WorkOrderStatus.COMPLETED

        db.session.commit()
        return updated

    def delete(self, work_order_id: str) -> bool:
        work_order = self.repository.get_by_id(work_order_id)
        if not work_order:
            return False

        if work_order.inventory_deducted and work_order.status != WorkOrderStatus.DELIVERED:
            self.repository.restore_inventory(work_order)

        success = self.repository.delete(work_order_id)
        if success:
            db.session.commit()
        return success

    def get_statistics(self) -> Dict[str, Any]:
        total_orders = self.repository.count()
        overdue_orders = self.repository.get_overdue_orders()
        status_distribution = self.repository.get_status_distribution()
        material_occupied = self.repository.get_material_occupied()
        delivery_trend = self.repository.get_delivery_trend(days=30)

        all_statuses = WorkOrderStatus.all_statuses()
        full_distribution = {}
        for status in all_statuses:
            full_distribution[status] = status_distribution.get(status, 0)

        return {
            "total_orders": total_orders,
            "overdue_orders": len(overdue_orders),
            "overdue_orders_list": [o.to_dict() for o in overdue_orders],
            "status_distribution": full_distribution,
            "status_distribution_with_names": {
                WorkOrderStatus.display_names().get(k, k): v
                for k, v in full_distribution.items()
            },
            "material_occupied": material_occupied,
            "delivery_trend": delivery_trend,
        }

    def get_chimes_with_work_order_status(self) -> List[Dict[str, Any]]:
        return self.repository.get_chimes_with_work_order_status()


class WorkOrderPriority:
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
