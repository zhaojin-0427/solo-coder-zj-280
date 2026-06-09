from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class MaterialCostItem(BaseModel):
    material_id: str
    material_name: str
    material_type: str
    purchase_price: float
    length: float
    loss_rate: float
    supplier: Optional[str] = None
    material_cost: float
    loss_cost: float
    subtotal: float


class CostCalculationResult(BaseModel):
    material_ids: List[str]
    material_costs: List[MaterialCostItem]
    total_material_cost: float
    total_loss_cost: float
    labor_hours: float
    labor_cost: float
    labor_rate: float = Field(50.0, description="工时费率，元/小时")
    overhead_rate: float = Field(0.3, description="管理费率")
    overhead_cost: float
    total_cost: float
    suggested_price: float
    profit_margin: float
    profit_rate: float


class CostSnapshot(BaseModel):
    material_costs: List[MaterialCostItem]
    total_material_cost: float
    total_loss_cost: float
    labor_hours: float
    labor_cost: float
    labor_rate: float
    overhead_rate: float
    overhead_cost: float
    total_cost: float
    suggested_price: float
    profit_margin: float
    profit_rate: float
    calculated_at: str


class CostCalculateRequest(BaseModel):
    material_ids: List[str] = Field(..., min_items=1)
    labor_hours: Optional[float] = Field(None, description="手工工时，小时")
    labor_rate: Optional[float] = Field(None, description="工时费率，元/小时")
    overhead_rate: Optional[float] = Field(None, description="管理费率")
    profit_rate: Optional[float] = Field(None, description="期望利润率")


class WindChimeCreateWithCost(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    materials: List[str] = Field(..., min_items=1)
    hang_order: List[str]
    chord_info: Dict[str, Any]
    tuning_corrections: Optional[List[Any]] = None
    cost_snapshot: Optional[CostSnapshot] = None


class WindChimeUpdateWithCost(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    materials: Optional[List[str]] = None
    hang_order: Optional[List[str]] = None
    chord_info: Optional[Dict[str, Any]] = None
    tuning_corrections: Optional[List[Any]] = None
    cost_snapshot: Optional[CostSnapshot] = None


class MaterialCostByType(BaseModel):
    material_type: str
    total_cost: float
    count: int
    percentage: float


class ChimeProfitRankItem(BaseModel):
    chime_id: str
    chime_name: str
    total_cost: float
    suggested_price: float
    profit_margin: float
    profit_rate: float
    material_count: int
    created_at: str


class SupplierUsageItem(BaseModel):
    supplier: str
    material_count: int
    total_cost: float
    used_count: int
    material_types: List[str]


class HighLossMaterialItem(BaseModel):
    material_id: str
    material_name: str
    material_type: str
    loss_rate: float
    purchase_price: float
    supplier: Optional[str]
    stock_quantity: int
    risk_level: str


class CostStatistics(BaseModel):
    cost_by_material_type: List[MaterialCostByType]
    profit_ranking: List[ChimeProfitRankItem]
    supplier_usage: List[SupplierUsageItem]
    high_loss_materials: List[HighLossMaterialItem]
    total_inventory_value: float
    avg_profit_rate: float
