from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import joinedload
from .base_repository import BaseRepository
from models.booking import Booking, BookingStatus
from models.feedback import Feedback
from models.chime import WindChime
from utils.database import db
import json


class BookingRepository(BaseRepository[Booking]):
    def __init__(self):
        super().__init__(Booking, db.session)

    def get_all_with_relations(self, skip: int = 0, limit: int = 100) -> List[Booking]:
        stmt = (
            select(Booking)
            .options(joinedload(Booking.chime), joinedload(Booking.feedback))
            .order_by(Booking.booking_date.desc())
            .offset(skip)
            .limit(limit)
        )
        result = self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    def get_by_id(self, booking_id: str) -> Optional[Booking]:
        stmt = (
            select(Booking)
            .options(joinedload(Booking.chime), joinedload(Booking.feedback))
            .where(Booking.id == booking_id)
        )
        result = self.db_session.execute(stmt)
        return result.scalars().unique().one_or_none()

    def get_by_chime_id(self, chime_id: str) -> List[Booking]:
        stmt = (
            select(Booking)
            .options(joinedload(Booking.feedback))
            .where(Booking.chime_id == chime_id)
            .order_by(Booking.booking_date.desc())
        )
        result = self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    def get_by_status(self, status: str, skip: int = 0, limit: int = 100) -> List[Booking]:
        stmt = (
            select(Booking)
            .options(joinedload(Booking.chime), joinedload(Booking.feedback))
            .where(Booking.status == status)
            .order_by(Booking.booking_date.desc())
            .offset(skip)
            .limit(limit)
        )
        result = self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

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
    ) -> List[Booking]:
        stmt = (
            select(Booking)
            .options(joinedload(Booking.chime), joinedload(Booking.feedback))
            .order_by(Booking.booking_date.desc())
        )

        conditions = []
        if status:
            conditions.append(Booking.status == status)
        if date_from:
            conditions.append(Booking.booking_date >= date_from)
        if date_to:
            conditions.append(Booking.booking_date <= date_to)
        if customer_name:
            conditions.append(Booking.customer_name.ilike(f"%{customer_name}%"))
        if chime_id:
            conditions.append(Booking.chime_id == chime_id)
        if chime_name:
            conditions.append(WindChime.name.ilike(f"%{chime_name}%"))
            stmt = stmt.join(WindChime, Booking.chime_id == WindChime.id)

        if satisfaction_min is not None or satisfaction_max is not None:
            stmt = stmt.outerjoin(Feedback, Booking.id == Feedback.booking_id)
            if satisfaction_min is not None:
                avg_score = (Feedback.tone_score + Feedback.appearance_score + Feedback.price_score) / 3.0
                conditions.append(avg_score >= satisfaction_min)
            if satisfaction_max is not None:
                avg_score = (Feedback.tone_score + Feedback.appearance_score + Feedback.price_score) / 3.0
                conditions.append(avg_score <= satisfaction_max)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        stmt = stmt.offset(skip).limit(limit)
        result = self.db_session.execute(stmt)
        return list(result.scalars().unique().all())

    def get_kanban_data(
        self,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        customer_name: Optional[str] = None,
        chime_name: Optional[str] = None,
        satisfaction_min: Optional[float] = None,
        satisfaction_max: Optional[float] = None,
    ) -> Dict[str, List[Booking]]:
        statuses = [
            BookingStatus.PENDING_AUDIO,
            BookingStatus.COMPLETED,
            BookingStatus.PENDING_FOLLOWUP,
            BookingStatus.ARCHIVED,
        ]

        result = {}
        for status in statuses:
            result[status] = self.get_by_filters(
                status=status,
                date_from=date_from,
                date_to=date_to,
                customer_name=customer_name,
                chime_name=chime_name,
                satisfaction_min=satisfaction_min,
                satisfaction_max=satisfaction_max,
                skip=0,
                limit=1000,
            )

        return result

    def get_booking_statistics(self, days: int = 30) -> Dict[str, Any]:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        total_bookings = self.db_session.execute(
            select(func.count()).select_from(Booking).where(Booking.created_at >= cutoff_date)
        ).scalar_one()

        status_counts = self.db_session.execute(
            select(Booking.status, func.count())
            .select_from(Booking)
            .where(Booking.created_at >= cutoff_date)
            .group_by(Booking.status)
        ).all()

        bookings_by_date = self.db_session.execute(
            select(
                func.date(Booking.booking_date),
                func.count()
            )
            .select_from(Booking)
            .where(Booking.booking_date >= cutoff_date)
            .group_by(func.date(Booking.booking_date))
            .order_by(func.date(Booking.booking_date))
        ).all()

        return {
            "total_bookings_last_30_days": total_bookings,
            "status_counts": {status: count for status, count in status_counts},
            "bookings_by_date": [{"date": str(date), "count": count} for date, count in bookings_by_date],
        }

    def get_satisfaction_distribution(self, days: int = 30) -> Dict[str, Any]:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        feedbacks = self.db_session.execute(
            select(Feedback)
            .where(Feedback.created_at >= cutoff_date)
        ).scalars().all()

        distribution = {"1-2": 0, "2-3": 0, "3-4": 0, "4-5": 0}
        total_satisfaction = 0
        count = 0

        for fb in feedbacks:
            avg = (fb.tone_score + fb.appearance_score + fb.price_score) / 3.0
            total_satisfaction += avg
            count += 1
            if avg < 2:
                distribution["1-2"] += 1
            elif avg < 3:
                distribution["2-3"] += 1
            elif avg < 4:
                distribution["3-4"] += 1
            else:
                distribution["4-5"] += 1

        return {
            "distribution": distribution,
            "average_satisfaction": round(total_satisfaction / count, 1) if count > 0 else 0,
            "total_feedbacks": count,
        }

    def get_material_preference_stats(self, days: int = 30) -> List[Dict[str, Any]]:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        results = self.db_session.execute(
            select(
                Feedback.material_preference,
                func.count()
            )
            .select_from(Feedback)
            .where(
                Feedback.created_at >= cutoff_date,
                Feedback.material_preference.isnot(None)
            )
            .group_by(Feedback.material_preference)
            .order_by(func.count().desc())
        ).all()

        from models.feedback import MaterialPreference
        return [
            {
                "material_pref": pref,
                "material_pref_display": MaterialPreference.display_names().get(pref, pref),
                "count": count
            }
            for pref, count in results
        ]

    def get_top_improvement_suggestions(self, days: int = 30, limit: int = 10) -> List[Dict[str, Any]]:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        suggestions = self.db_session.execute(
            select(Feedback.improvement_suggestions)
            .select_from(Feedback)
            .where(
                Feedback.created_at >= cutoff_date,
                Feedback.improvement_suggestions.isnot(None)
            )
        ).all()

        suggestion_counts: Dict[str, int] = {}
        for (suggestions_json,) in suggestions:
            try:
                items = json.loads(suggestions_json)
                for item in items:
                    if item:
                        suggestion_counts[item] = suggestion_counts.get(item, 0) + 1
            except (json.JSONDecodeError, TypeError):
                continue

        sorted_suggestions = sorted(
            suggestion_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]

        return [
            {"suggestion": text, "count": count}
            for text, count in sorted_suggestions
        ]

    def get_top_tags(self, days: int = 30, limit: int = 10) -> List[Dict[str, Any]]:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        tags = self.db_session.execute(
            select(Feedback.tags)
            .select_from(Feedback)
            .where(
                Feedback.created_at >= cutoff_date,
                Feedback.tags.isnot(None)
            )
        ).all()

        tag_counts: Dict[str, int] = {}
        for (tags_json,) in tags:
            try:
                items = json.loads(tags_json)
                for item in items:
                    if item:
                        tag_counts[item] = tag_counts.get(item, 0) + 1
            except (json.JSONDecodeError, TypeError):
                continue

        sorted_tags = sorted(
            tag_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]

        return [
            {"tag": text, "count": count}
            for text, count in sorted_tags
        ]

    def create(self, obj_in: Dict[str, Any]) -> Booking:
        data = obj_in.copy()
        if "focus_points" in data and data["focus_points"] is not None:
            data["focus_points"] = json.dumps(data["focus_points"])
        return super().create(data)

    def update(self, db_obj: Booking, obj_in: Dict[str, Any]) -> Booking:
        data = obj_in.copy()
        if "focus_points" in data and data["focus_points"] is not None:
            data["focus_points"] = json.dumps(data["focus_points"])
        return super().update(db_obj, data)

    def update_status(self, booking_id: str, status: str) -> Optional[Booking]:
        booking = self.get_by_id(booking_id)
        if not booking:
            return None
        booking.status = status
        self.db_session.flush()
        return booking

    def get_latest_feedback_for_chime(self, chime_id: str) -> Optional[Feedback]:
        stmt = (
            select(Feedback)
            .where(Feedback.chime_id == chime_id)
            .order_by(Feedback.created_at.desc())
            .limit(1)
        )
        result = self.db_session.execute(stmt)
        return result.scalars().one_or_none()
