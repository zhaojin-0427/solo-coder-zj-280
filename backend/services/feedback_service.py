import json
from typing import List, Optional
from repositories.feedback_repository import FeedbackRepository
from repositories.booking_repository import BookingRepository
from repositories.chime_repository import ChimeRepository
from models.booking import BookingStatus
from utils.database import db


class FeedbackService:
    def __init__(self):
        self.feedback_repo = FeedbackRepository()
        self.booking_repo = BookingRepository()
        self.chime_repo = ChimeRepository()

    def get_all(self, skip: int = 0, limit: int = 100) -> List:
        return self.feedback_repo.get_all_with_relations(skip=skip, limit=limit)

    def get_by_id(self, feedback_id: str):
        return self.feedback_repo.get_by_id(feedback_id)

    def get_by_booking_id(self, booking_id: str):
        return self.feedback_repo.get_by_booking_id(booking_id)

    def get_by_chime_id(self, chime_id: str) -> List:
        return self.feedback_repo.get_by_chime_id(chime_id)

    def create(self, data: dict):
        booking = self.booking_repo.get_by_id(data["booking_id"])
        if not booking:
            raise ValueError("Booking not found")

        chime = self.chime_repo.get_by_id(data["chime_id"])
        if not chime:
            raise ValueError("Chime not found")

        if booking.chime_id != data["chime_id"]:
            raise ValueError("Booking chime_id does not match feedback chime_id")

        existing_feedback = self.feedback_repo.get_by_booking_id(data["booking_id"])
        if existing_feedback:
            raise ValueError("Feedback already exists for this booking")

        feedback = self.feedback_repo.create(data)

        booking.status = BookingStatus.PENDING_FOLLOWUP
        db.session.flush()

        if data.get("write_back_to_chime"):
            self._write_feedback_to_chime(data["chime_id"], data)

        db.session.commit()
        return feedback

    def update(self, feedback_id: str, data: dict):
        feedback = self.feedback_repo.get_by_id(feedback_id)
        if not feedback:
            return None

        updated = self.feedback_repo.update(feedback, data)

        if data.get("write_back_to_chime"):
            feedback_dict = feedback.to_dict()
            feedback_dict.update({k: v for k, v in data.items() if v is not None})
            self._write_feedback_to_chime(feedback.chime_id, feedback_dict)

        db.session.commit()
        return updated

    def delete(self, feedback_id: str) -> bool:
        success = self.feedback_repo.delete(feedback_id)
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

        tone_score = feedback_data.get("tone_score")
        appearance_score = feedback_data.get("appearance_score")
        price_score = feedback_data.get("price_score")

        if tone_score is not None and appearance_score is not None and price_score is not None:
            satisfaction = (tone_score + appearance_score + price_score) / 3.0
            chord_info["latest_satisfaction_score"] = round(satisfaction, 1)

        chord_info["customer_tags"] = existing_tags
        chord_info["improvement_suggestions"] = existing_suggestions

        self.chime_repo.update(chime, {"chord_info": json.dumps(chord_info)})
