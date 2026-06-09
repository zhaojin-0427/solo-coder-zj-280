from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from datetime import datetime

from services.booking_service import BookingService
from services.feedback_service import FeedbackService
from schemas.booking import BookingCreate, BookingUpdate, BookingStatusUpdate
from schemas.feedback import BookingFeedbackFilter

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")
booking_service = BookingService()
feedback_service = FeedbackService()


@bookings_bp.route("", methods=["GET"])
def get_bookings():
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)
    status = request.args.get("status", None, type=str)
    date_from_str = request.args.get("date_from", None, type=str)
    date_to_str = request.args.get("date_to", None, type=str)
    customer_name = request.args.get("customer_name", None, type=str)
    chime_id = request.args.get("chime_id", None, type=str)
    chime_name = request.args.get("chime_name", None, type=str)
    satisfaction_min = request.args.get("satisfaction_min", None, type=float)
    satisfaction_max = request.args.get("satisfaction_max", None, type=float)

    date_from = None
    date_to = None
    if date_from_str:
        try:
            date_from = datetime.fromisoformat(date_from_str.replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Invalid date_from format"}), 400
    if date_to_str:
        try:
            date_to = datetime.fromisoformat(date_to_str.replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Invalid date_to format"}), 400

    try:
        BookingFeedbackFilter(
            status=status,
            date_from=date_from,
            date_to=date_to,
            customer_name=customer_name,
            chime_id=chime_id,
            chime_name=chime_name,
            satisfaction_min=satisfaction_min,
            satisfaction_max=satisfaction_max,
        )
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    bookings = booking_service.get_by_filters(
        status=status,
        date_from=date_from,
        date_to=date_to,
        customer_name=customer_name,
        chime_id=chime_id,
        chime_name=chime_name,
        satisfaction_min=satisfaction_min,
        satisfaction_max=satisfaction_max,
        skip=skip,
        limit=limit,
    )
    return jsonify({
        "data": [b.to_dict() for b in bookings],
        "total": len(bookings)
    })


@bookings_bp.route("/kanban", methods=["GET"])
def get_kanban():
    date_from_str = request.args.get("date_from", None, type=str)
    date_to_str = request.args.get("date_to", None, type=str)
    customer_name = request.args.get("customer_name", None, type=str)
    chime_name = request.args.get("chime_name", None, type=str)
    satisfaction_min = request.args.get("satisfaction_min", None, type=float)
    satisfaction_max = request.args.get("satisfaction_max", None, type=float)

    date_from = None
    date_to = None
    if date_from_str:
        try:
            date_from = datetime.fromisoformat(date_from_str.replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Invalid date_from format"}), 400
    if date_to_str:
        try:
            date_to = datetime.fromisoformat(date_to_str.replace("Z", "+00:00"))
        except ValueError:
            return jsonify({"error": "Invalid date_to format"}), 400

    try:
        BookingFeedbackFilter(
            date_from=date_from,
            date_to=date_to,
            customer_name=customer_name,
            chime_name=chime_name,
            satisfaction_min=satisfaction_min,
            satisfaction_max=satisfaction_max,
        )
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    kanban = booking_service.get_kanban(
        date_from=date_from,
        date_to=date_to,
        customer_name=customer_name,
        chime_name=chime_name,
        satisfaction_min=satisfaction_min,
        satisfaction_max=satisfaction_max,
    )
    return jsonify(kanban)


@bookings_bp.route("/statistics", methods=["GET"])
def get_statistics():
    days = request.args.get("days", 30, type=int)
    stats = booking_service.get_statistics(days=days)
    return jsonify(stats)


@bookings_bp.route("/<booking_id>", methods=["GET"])
def get_booking(booking_id):
    booking = booking_service.get_by_id(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify(booking.to_dict())


@bookings_bp.route("/chime/<chime_id>", methods=["GET"])
def get_bookings_by_chime(chime_id):
    bookings = booking_service.get_by_chime_id(chime_id)
    return jsonify({
        "data": [b.to_dict() for b in bookings],
        "total": len(bookings)
    })


@bookings_bp.route("", methods=["POST"])
def create_booking():
    try:
        data = BookingCreate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    try:
        booking = booking_service.create(data.model_dump())
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(booking.to_dict()), 201


@bookings_bp.route("/<booking_id>", methods=["PUT"])
def update_booking(booking_id):
    try:
        data = BookingUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    try:
        booking = booking_service.update(booking_id, data.model_dump(exclude_unset=True))
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify(booking.to_dict())


@bookings_bp.route("/<booking_id>/status", methods=["PUT"])
def update_booking_status(booking_id):
    try:
        data = BookingStatusUpdate(**request.json)
    except ValidationError as e:
        return jsonify({"error": e.errors()}), 400

    booking = booking_service.update_status(booking_id, data.status)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify(booking.to_dict())


@bookings_bp.route("/<booking_id>", methods=["DELETE"])
def delete_booking(booking_id):
    success = booking_service.delete(booking_id)
    if not success:
        return jsonify({"error": "Booking not found"}), 404
    return jsonify({"success": True})
