from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from .base_repository import BaseRepository
from models.feedback import Feedback
from models.booking import Booking
from utils.database import db
import json


class FeedbackRepository(BaseRepository[Feedback]):
    def __init__(self):
        super().__init__(Feedback, db.session)

    def get_all_with_relations(self, skip: int = 0, limit: int = 100) -> List[Feedback]:
        stmt = (
            select(Feedback)
            .options(joinedload(Feedback.booking), joinedload(Feedback.chime))
            .order_by(Feedback.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    def get_by_id(self, feedback_id: str) -> Optional[Feedback]:
        stmt = (
            select(Feedback)
            .options(joinedload(Feedback.booking), joinedload(Feedback.chime))
            .where(Feedback.id == feedback_id)
        )
        result = self.db_session.execute(stmt)
        return result.scalars().unique().one_or_none()

    def get_by_booking_id(self, booking_id: str) -> Optional[Feedback]:
        stmt = (
            select(Feedback)
            .options(joinedload(Feedback.booking), joinedload(Feedback.chime))
            .where(Feedback.booking_id == booking_id)
        )
        result = self.db_session.execute(stmt)
        return result.scalars().unique().one_or_none()

    def get_by_chime_id(self, chime_id: str) -> List[Feedback]:
        stmt = (
            select(Feedback)
            .options(joinedload(Feedback.booking))
            .where(Feedback.chime_id == chime_id)
            .order_by(Feedback.created_at.desc())
        )
        result = self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    def create(self, obj_in: Dict[str, Any]) -> Feedback:
        data = obj_in.copy()
        if "improvement_suggestions" in data and data["improvement_suggestions"] is not None:
            data["improvement_suggestions"] = json.dumps(data["improvement_suggestions"])
        if "tags" in data and data["tags"] is not None:
            data["tags"] = json.dumps(data["tags"])
        data.pop("write_back_to_chime", None)
        return super().create(data)

    def update(self, db_obj: Feedback, obj_in: Dict[str, Any]) -> Feedback:
        data = obj_in.copy()
        if "improvement_suggestions" in data and data["improvement_suggestions"] is not None:
            data["improvement_suggestions"] = json.dumps(data["improvement_suggestions"])
        if "tags" in data and data["tags"] is not None:
            data["tags"] = json.dumps(data["tags"])
        data.pop("write_back_to_chime", None)
        return super().update(db_obj, data)
