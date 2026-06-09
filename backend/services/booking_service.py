import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from repositories.booking_repository import BookingRepository
from repositories.feedback_repository import FeedbackRepository
from repositories.chime_repository import ChimeRepository
from models.booking import BookingStatus
from utils.database import db


class BookingService:
    def __init__(self):
        self.booking_repo = BookingRepository()
        self.feedback_repo = FeedbackRepository()
        self.chime_repo = ChimeRepository()

    def get_all(self, skip: int = 0, limit: int = 100) -> List:
        return self.booking_repo.get_all_with_relations(skip=skip, limit=limit)

    def get_by_id(self, booking_id: str):
        return self.booking_repo.get_by_id(booking_id)

    def get_by_chime_id(self, chime_id: str) -> List:
        return self.booking_repo.get_by_chime_id(chime_id)

    def get_by_status(self, status: str, skip: int = 0, limit: int = 100) -> List:
        return self.booking_repo.get_by_status(status, skip=skip, limit=limit)

    def get_by_filters(
        self,
        status: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        customer_name: Optional[str] = None,
        chime_id: Optional[str] = None,
        chime_name: Optional[str] = None,
        satisfaction_min: Optional[float] = None,
        satisfaction_max: Optional[float] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List:
        return self.booking_repo.get_by_filters(
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

    def get_kanban(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        customer_name: Optional[str] = None,
        chime_name: Optional[str] = None,
        satisfaction_min: Optional[float] = None,
        satisfaction_max: Optional[float] = None,
    ) -> Dict[str, Any]:
        kanban_data = self.booking_repo.get_kanban_data(
            date_from=date_from,
            date_to=date_to,
            customer_name=customer_name,
            chime_name=chime_name,
            satisfaction_min=satisfaction_min,
            satisfaction_max=satisfaction_max,
        )

        result = {}
        for status, bookings in kanban_data.items():
            result[status] = {
                "bookings": [b.to_dict() for b in bookings],
                "count": len(bookings)
            }

        return result

    def get_statistics(self, days: int = 30) -> Dict[str, Any]:
        booking_stats = self.booking_repo.get_booking_statistics(days=days)
        satisfaction_stats = self.booking_repo.get_satisfaction_distribution(days=days)
        material_pref_stats = self.booking_repo.get_material_preference_stats(days=days)
        improvement_stats = self.booking_repo.get_top_improvement_suggestions(days=days)
        tag_stats = self.booking_repo.get_top_tags(days=days)

        status_display = BookingStatus.display_names()
        status_counts_with_display = {}
        for status, count in booking_stats["status_counts"].items():
            status_counts_with_display[status] = {
                "count": count,
                "display_name": status_display.get(status, status)
            }

        return {
            "booking_statistics": {
                "total_bookings": booking_stats["total_bookings_last_30_days"],
                "status_counts": status_counts_with_display,
                "bookings_by_date": booking_stats["bookings_by_date"],
            },
            "satisfaction_statistics": satisfaction_stats,
            "material_preference_statistics": material_pref_stats,
            "improvement_suggestions": improvement_stats,
            "top_tags": tag_stats,
        }

    def create(self, data: dict):
        chime = self.chime_repo.get_by_id(data["chime_id"])
        if not chime:
            raise ValueError("Chime not found")

        booking = self.booking_repo.create(data)
        db.session.commit()
        return booking

    def update(self, booking_id: str, data: dict):
        booking = self.booking_repo.get_by_id(booking_id)
        if not booking:
            return None

        if "chime_id" in data:
            chime = self.chime_repo.get_by_id(data["chime_id"])
            if not chime:
                raise ValueError("Chime not found")

        updated = self.booking_repo.update(booking, data)
        db.session.commit()
        return updated

    def update_status(self, booking_id: str, status: str):
        booking = self.booking_repo.update_status(booking_id, status)
        if not booking:
            return None
        db.session.commit()
        return booking

    def delete(self, booking_id: str) -> bool:
        success = self.booking_repo.delete(booking_id)
        if success:
            db.session.commit()
        return success

    def _write_feedback_to_chime(self, chime_id: str, feedback_data: dict) -> None:
        chime = self.chime_repo.get_by_id(chime_id)
        if not chime:
            return

        try:
            chord_info = json.loads(chime.chord_info) if chime.chord_info else {}
        except (json.JSONDecodeError, TypeError):
            chord_info = {}

        existing_tags = chord_info.get("customer_tags", [])
        existing_suggestions = chord_info.get("improvement_suggestions", [])

        new_tags = feedback_data.get("tags", [])
        for tag in new_tags:
            if tag and tag not in existing_tags:
                existing_tags.append(tag)

        new_suggestions = feedback_data.get("improvement_suggestions", [])
        for suggestion in new_suggestions:
            if suggestion and suggestion not in existing_suggestions:
                existing_suggestions.append(suggestion)

        if feedback_data.get("overall_conclusion"):
            chord_info["latest_feedback_conclusion"] = feedback_data["overall_conclusion"]

        if feedback_data.get("material_preference"):
            chord_info["latest_material_preference"] = feedback_data["material_preference"]

        satisfaction = (
            feedback_data.get("tone_score", 0) +
            feedback_data.get("appearance_score", 0) +
            feedback_data.get("price_score", 0)
        ) / 3.0
        chord_info["latest_satisfaction_score"] = round(satisfaction, 1)

        chord_info["customer_tags"] = existing_tags
        chord_info["improvement_suggestions"] = existing_suggestions

        self.chime_repo.update(chime, {"chord_info": json.dumps(chord_info)})
