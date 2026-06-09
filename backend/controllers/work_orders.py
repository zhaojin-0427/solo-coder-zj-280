from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from services.work_order_service import WorkOrderService
from schemas.work_order import (
    WorkOrderCreate,
    WorkOrderUpdate,
    WorkOrderStatusUpdate,
    WorkOrderStageUpdate,
)

work_orders_bp = Blueprint("work_orders", __name__, url_prefix="/api/work-orders")
work_order_service = WorkOrderService()


@work_orders_bp.route("", methods=["GET"])
def get_work_orders():
    status = request.args.get("status")
    priority = request.args.get("priority")
    delivery_date_from = request.args.get("delivery_date_from")
    delivery_date_to = request.args.get("delivery_date_to")
    search = request.args.get("search")
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)

    orders, total = work_order_service.get_all(
        status=status,
        priority=priority,
        delivery_date_from=delivery_date_from,
        delivery_date_to=delivery_date_to,
        search=search,
        skip=skip,
        limit=limit,
    )

    return jsonify({
        "data": [o.to_dict() for o in orders],
        "total": total,
    })


@work_orders_bp.route("/<work_order_id>", methods=["GET"])
def get_work_order(work_order_id):
    order = work_order_service.get_by_id(work_order_id)
    if not order:
        return jsonify({"error": "Work order not found"}), 404
    return jsonify(order.to_dict())


@work_orders_bp.route("/by-chime/<chime_id>", methods=["GET"])
def get_work_orders_by_chime(chime_id):
    orders = work_order_service.get_by_chime_id(chime_id)
    return jsonify({
        "data": [o.to_dict() for o in orders],
        "total": len(orders),
    })


@work_orders_bp.route("", methods=["POST"])
def create_work_order():
    try:
        data = WorkOrderCreate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    try:
        order = work_order_service.create(data.model_dump())
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(order.to_dict()), 201


@work_orders_bp.route("/<work_order_id>", methods=["PUT"])
def update_work_order(work_order_id):
    try:
        data = WorkOrderUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    try:
        order = work_order_service.update(
            work_order_id,
            data.model_dump(exclude_unset=True),
        )
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if not order:
        return jsonify({"error": "Work order not found"}), 404
    return jsonify(order.to_dict())


@work_orders_bp.route("/<work_order_id>/status", methods=["PUT"])
def update_work_order_status(work_order_id):
    try:
        data = WorkOrderStatusUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    try:
        order = work_order_service.update_status(work_order_id, data.status)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if not order:
        return jsonify({"error": "Work order not found"}), 404
    return jsonify(order.to_dict())


@work_orders_bp.route("/<work_order_id>/stage", methods=["PUT"])
def update_work_order_stage(work_order_id):
    try:
        data = WorkOrderStageUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    order = work_order_service.update_stage(
        work_order_id,
        data.stage,
        data.completed,
    )

    if not order:
        return jsonify({"error": "Work order not found"}), 404
    return jsonify(order.to_dict())


@work_orders_bp.route("/<work_order_id>", methods=["DELETE"])
def delete_work_order(work_order_id):
    success = work_order_service.delete(work_order_id)
    if not success:
        return jsonify({"error": "Work order not found"}), 404
    return jsonify({"success": True})


@work_orders_bp.route("/statistics", methods=["GET"])
def get_work_order_statistics():
    stats = work_order_service.get_statistics()
    return jsonify(stats)


@work_orders_bp.route("/chimes-with-status", methods=["GET"])
def get_chimes_with_work_order_status():
    chimes = work_order_service.get_chimes_with_work_order_status()
    return jsonify({
        "data": chimes,
        "total": len(chimes),
    })
