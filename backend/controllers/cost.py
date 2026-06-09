from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from services.cost_service import CostService
from schemas.cost import CostCalculateRequest

cost_bp = Blueprint("cost", __name__, url_prefix="/api/cost")
cost_service = CostService()


@cost_bp.route("/calculate", methods=["POST"])
def calculate_cost():
    try:
        data = CostCalculateRequest(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    result = cost_service.calculate_cost(
        material_ids=data.material_ids,
        labor_hours=data.labor_hours,
        labor_rate=data.labor_rate,
        overhead_rate=data.overhead_rate,
        profit_rate=data.profit_rate,
    )

    return jsonify(result.model_dump())


@cost_bp.route("/snapshot", methods=["POST"])
def create_snapshot():
    try:
        data = CostCalculateRequest(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    cost_result = cost_service.calculate_cost(
        material_ids=data.material_ids,
        labor_hours=data.labor_hours,
        labor_rate=data.labor_rate,
        overhead_rate=data.overhead_rate,
        profit_rate=data.profit_rate,
    )

    snapshot = cost_service.create_snapshot(cost_result)
    return jsonify(cost_service.snapshot_to_dict(snapshot))
