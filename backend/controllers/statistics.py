from flask import Blueprint, jsonify

from services.statistics_service import StatisticsService

statistics_bp = Blueprint("statistics", __name__, url_prefix="/api/statistics")
statistics_service = StatisticsService()


@statistics_bp.route("/overview", methods=["GET"])
def get_overview():
    return jsonify(statistics_service.get_overview())


@statistics_bp.route("/pitch-range", methods=["GET"])
def get_pitch_range():
    return jsonify(statistics_service.get_pitch_ranges())


@statistics_bp.route("/chords", methods=["GET"])
def get_popular_chords():
    return jsonify(statistics_service.get_popular_chords())


@statistics_bp.route("/material-usage", methods=["GET"])
def get_material_usage():
    return jsonify(statistics_service.get_material_usage())


@statistics_bp.route("/tuning-corrections", methods=["GET"])
def get_tuning_corrections():
    return jsonify(statistics_service.get_tuning_corrections())


@statistics_bp.route("/cost", methods=["GET"])
def get_cost_statistics():
    return jsonify(statistics_service.get_cost_statistics())
