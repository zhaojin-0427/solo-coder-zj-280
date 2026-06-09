from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from services.chime_service import ChimeService
from schemas.chime import WindChimeCreate, WindChimeUpdate

chimes_bp = Blueprint("chimes", __name__, url_prefix="/api/chimes")
chime_service = ChimeService()


@chimes_bp.route("", methods=["GET"])
def get_chimes():
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)

    chimes = chime_service.get_all(skip=skip, limit=limit)
    return jsonify({
        "data": [c.to_dict() for c in chimes],
        "total": len(chimes)
    })


@chimes_bp.route("/<chime_id>", methods=["GET"])
def get_chime(chime_id):
    include_bookings = request.args.get("include_bookings", "true", type=str).lower() == "true"
    chime = chime_service.get_by_id(chime_id, include_bookings=include_bookings)
    if not chime:
        return jsonify({"error": "Chime not found"}), 404
    return jsonify(chime.to_dict(include_bookings=include_bookings))


@chimes_bp.route("", methods=["POST"])
def create_chime():
    try:
        data = WindChimeCreate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    chime = chime_service.create(data.model_dump())
    return jsonify(chime.to_dict()), 201


@chimes_bp.route("/<chime_id>", methods=["PUT"])
def update_chime(chime_id):
    try:
        data = WindChimeUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    chime = chime_service.update(chime_id, data.model_dump(exclude_unset=True))
    if not chime:
        return jsonify({"error": "Chime not found"}), 404
    return jsonify(chime.to_dict())


@chimes_bp.route("/<chime_id>", methods=["DELETE"])
def delete_chime(chime_id):
    success = chime_service.delete(chime_id)
    if not success:
        return jsonify({"error": "Chime not found"}), 404
    return jsonify({"success": True})
