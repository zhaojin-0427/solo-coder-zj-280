from typing import List, Optional, Dict, Any
from datetime import datetime
from repositories.material_repository import MaterialRepository
from schemas.cost import (
    MaterialCostItem,
    CostCalculationResult,
    CostSnapshot,
)


class CostService:
    def __init__(self):
        self.material_repo = MaterialRepository()

    def calculate_cost(
        self,
        material_ids: List[str],
        labor_hours: Optional[float] = None,
        labor_rate: Optional[float] = None,
        overhead_rate: Optional[float] = None,
        profit_rate: Optional[float] = None,
    ) -> CostCalculationResult:
        default_labor_rate = 50.0
        default_overhead_rate = 0.3
        default_profit_rate = 0.5

        actual_labor_rate = labor_rate if labor_rate is not None else default_labor_rate
        actual_overhead_rate = overhead_rate if overhead_rate is not None else default_overhead_rate
        actual_profit_rate = profit_rate if profit_rate is not None else default_profit_rate

        materials = []
        for mid in material_ids:
            mat = self.material_repo.get_by_id(mid)
            if mat:
                materials.append(mat)

        material_costs: List[MaterialCostItem] = []
        total_material_cost = 0.0
        total_loss_cost = 0.0

        for mat in materials:
            purchase_price = mat.purchase_price or 0.0
            loss_rate = mat.loss_rate or 0.0

            material_cost = purchase_price
            loss_cost = purchase_price * (loss_rate / 100.0)
            subtotal = material_cost + loss_cost

            total_material_cost += material_cost
            total_loss_cost += loss_cost

            material_costs.append(
                MaterialCostItem(
                    material_id=mat.id,
                    material_name=mat.name,
                    material_type=mat.material_type,
                    purchase_price=purchase_price,
                    length=mat.length,
                    loss_rate=loss_rate,
                    supplier=mat.supplier,
                    material_cost=round(material_cost, 2),
                    loss_cost=round(loss_cost, 2),
                    subtotal=round(subtotal, 2),
                )
            )

        actual_labor_hours = labor_hours if labor_hours is not None else max(0.5, len(materials) * 0.5)

        labor_cost = actual_labor_hours * actual_labor_rate
        total_direct_cost = total_material_cost + total_loss_cost + labor_cost
        overhead_cost = total_direct_cost * actual_overhead_rate
        total_cost = total_direct_cost + overhead_cost

        suggested_price = total_cost * (1 + actual_profit_rate)
        profit_margin = suggested_price - total_cost

        return CostCalculationResult(
            material_ids=material_ids,
            material_costs=material_costs,
            total_material_cost=round(total_material_cost, 2),
            total_loss_cost=round(total_loss_cost, 2),
            labor_hours=round(actual_labor_hours, 2),
            labor_cost=round(labor_cost, 2),
            labor_rate=actual_labor_rate,
            overhead_rate=actual_overhead_rate,
            overhead_cost=round(overhead_cost, 2),
            total_cost=round(total_cost, 2),
            suggested_price=round(suggested_price, 2),
            profit_margin=round(profit_margin, 2),
            profit_rate=round(actual_profit_rate, 4),
        )

    def create_snapshot(self, cost_result: CostCalculationResult) -> CostSnapshot:
        return CostSnapshot(
            material_costs=cost_result.material_costs,
            total_material_cost=cost_result.total_material_cost,
            total_loss_cost=cost_result.total_loss_cost,
            labor_hours=cost_result.labor_hours,
            labor_cost=cost_result.labor_cost,
            labor_rate=cost_result.labor_rate,
            overhead_rate=cost_result.overhead_rate,
            overhead_cost=cost_result.overhead_cost,
            total_cost=cost_result.total_cost,
            suggested_price=cost_result.suggested_price,
            profit_margin=cost_result.profit_margin,
            profit_rate=cost_result.profit_rate,
            calculated_at=datetime.utcnow().isoformat(),
        )

    def snapshot_to_dict(self, snapshot: CostSnapshot) -> Dict[str, Any]:
        return {
            "material_costs": [mc.model_dump() for mc in snapshot.material_costs],
            "total_material_cost": snapshot.total_material_cost,
            "total_loss_cost": snapshot.total_loss_cost,
            "labor_hours": snapshot.labor_hours,
            "labor_cost": snapshot.labor_cost,
            "labor_rate": snapshot.labor_rate,
            "overhead_rate": snapshot.overhead_rate,
            "overhead_cost": snapshot.overhead_cost,
            "total_cost": snapshot.total_cost,
            "suggested_price": snapshot.suggested_price,
            "profit_margin": snapshot.profit_margin,
            "profit_rate": snapshot.profit_rate,
            "calculated_at": snapshot.calculated_at,
        }
