from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from services.material_service import MaterialService
from schemas.material import MaterialCreate, MaterialUpdate

materials_bp = Blueprint("materials", __name__, url_prefix="/api/materials")
material_service = MaterialService()


@materials_bp.route("", methods=["GET"])
def get_materials():
    material_type = request.args.get("type")
    min_pitch = request.args.get("min_pitch", type=float)
    max_pitch = request.args.get("max_pitch", type=float)
    search = request.args.get("search")
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)

    materials, total = material_service.get_filtered(
        material_type=material_type,
        min_pitch=min_pitch,
        max_pitch=max_pitch,
        search=search,
        skip=skip,
        limit=limit
    )

    return jsonify({
        "data": [m.to_dict() for m in materials],
        "total": total
    })


@materials_bp.route("/<material_id>", methods=["GET"])
def get_material(material_id):
    material = material_service.get_by_id(material_id)
    if not material:
        return jsonify({"error": "Material not found"}), 404
    return jsonify(material.to_dict())


@materials_bp.route("", methods=["POST"])
def create_material():
    try:
        data = MaterialCreate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    material = material_service.create(data.model_dump())
    return jsonify(material.to_dict()), 201


@materials_bp.route("/<material_id>", methods=["PUT"])
def update_material(material_id):
    try:
        data = MaterialUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    material = material_service.update(material_id, data.model_dump(exclude_unset=True))
    if not material:
        return jsonify({"error": "Material not found"}), 404
    return jsonify(material.to_dict())


@materials_bp.route("/<material_id>", methods=["DELETE"])
def delete_material(material_id):
    success = material_service.delete(material_id)
    if not success:
        return jsonify({"error": "Material not found"}), 404
    return jsonify({"success": True})
