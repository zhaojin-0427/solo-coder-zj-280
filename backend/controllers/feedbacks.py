from flask import Blueprint, request, jsonify
from pydantic import ValidationError

from services.feedback_service import FeedbackService
from schemas.feedback import FeedbackCreate, FeedbackUpdate

feedbacks_bp = Blueprint("feedbacks", __name__, url_prefix="/api/feedbacks")
feedback_service = FeedbackService()


@feedbacks_bp.route("", methods=["GET"])
def get_feedbacks():
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)

    feedbacks = feedback_service.get_all(skip=skip, limit=limit)
    return jsonify({
        "data": [f.to_dict() for f in feedbacks],
        "total": len(feedbacks)
    })


@feedbacks_bp.route("/<feedback_id>", methods=["GET"])
def get_feedback(feedback_id):
    feedback = feedback_service.get_by_id(feedback_id)
    if not feedback:
        return jsonify({"error": "Feedback not found"}), 404
    return jsonify(feedback.to_dict())


@feedbacks_bp.route("/booking/<booking_id>", methods=["GET"])
def get_feedback_by_booking(booking_id):
    feedback = feedback_service.get_by_booking_id(booking_id)
    if not feedback:
        return jsonify({"error": "Feedback not found"}), 404
    return jsonify(feedback.to_dict())


@feedbacks_bp.route("/chime/<chime_id>", methods=["GET"])
def get_feedbacks_by_chime(chime_id):
    feedbacks = feedback_service.get_by_chime_id(chime_id)
    return jsonify({
        "data": [f.to_dict() for f in feedbacks],
        "total": len(feedbacks)
    })


@feedbacks_bp.route("", methods=["POST"])
def create_feedback():
    try:
        data = FeedbackCreate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    try:
        feedback = feedback_service.create(data.model_dump())
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(feedback.to_dict()), 201


@feedbacks_bp.route("/<feedback_id>", methods=["PUT"])
def update_feedback(feedback_id):
    try:
        data = FeedbackUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    feedback = feedback_service.update(feedback_id, data.model_dump(exclude_unset=True))
    if not feedback:
        return jsonify({"error": "Feedback not found"}), 404
    return jsonify(feedback.to_dict())


@feedbacks_bp.route("/<feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    success = feedback_service.delete(feedback_id)
    if not success:
        return jsonify({"error": "Feedback not found"}), 404
    return jsonify({"success": True})
