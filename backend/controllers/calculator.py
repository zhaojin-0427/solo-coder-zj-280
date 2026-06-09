from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from services.pitch_service import PitchService
from services.chord_service import ChordService
from schemas.calculator import PitchCalculateRequest, ChordAnalyzeRequest

calculator_bp = Blueprint("calculator", __name__)
pitch_service = PitchService()
chord_service = ChordService()


@calculator_bp.route("/api/calculate/pitch", methods=["POST"])
def calculate_pitch():
    try:
        data = PitchCalculateRequest(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    result = pitch_service.calculate(
        data.material_type,
        data.length,
        data.diameter,
        data.wall_thickness
    )
    return jsonify(result)


@calculator_bp.route("/api/analyze/chord", methods=["POST"])
def analyze_chord():
    try:
        data = ChordAnalyzeRequest(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    result = chord_service.analyze(data.frequencies)
    return jsonify(result)
