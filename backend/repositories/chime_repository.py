from typing import List, Optional
from sqlalchemy import select, func, text
from .base_repository import BaseRepository
from models.chime import WindChime
from models.tuning_correction import TuningCorrection
from utils.database import db
import json


class ChimeRepository(BaseRepository[WindChime]):
    def __init__(self):
        super().__init__(WindChime, db.session)

    def get_all_with_timestamps(self, skip: int = 0, limit: int = 100) -> List[WindChime]:
        stmt = select(WindChime).order_by(WindChime.created_at.desc()).offset(skip).limit(limit)
        result = self.db_session.execute(stmt)
        return list(result.scalars().all())

    def get_all_material_ids(self) -> List[str]:
        stmt = select(WindChime.materials)
        result = self.db_session.execute(stmt)
        all_ids = []
        for row in result.all():
            if row[0]:
                try:
                    ids = json.loads(row[0])
                    all_ids.extend(ids)
                except (json.JSONDecodeError, TypeError):
                    pass
        return all_ids

    def get_chord_statistics(self) -> List[dict]:
        stmt = select(WindChime.chord_info)
        result = self.db_session.execute(stmt)
        chord_counts = {}
        dissonance_sums = {}

        for row in result.all():
            if row[0]:
                try:
                    chord_info = json.loads(row[0])
                    chord_name = chord_info.get("chord_name", "未知")
                    dissonance = chord_info.get("dissonance_score", 0)

                    if chord_name in chord_counts:
                        chord_counts[chord_name] += 1
                        dissonance_sums[chord_name] += dissonance
                    else:
                        chord_counts[chord_name] = 1
                        dissonance_sums[chord_name] = dissonance
                except (json.JSONDecodeError, TypeError):
                    pass

        return [
            {
                "chord_name": name,
                "count": count,
                "avg_dissonance": round(dissonance_sums[name] / count if count > 0 else 0, 1)
            }
            for name, count in sorted(chord_counts.items(), key=lambda x: x[1], reverse=True)
        ]

    def add_tuning_correction(self, chime_id: str, correction_data: dict) -> TuningCorrection:
        correction = TuningCorrection(
            chime_id=chime_id,
            material_id=correction_data["material_id"],
            theoretical_freq=correction_data["theoretical_freq"],
            actual_freq=correction_data["actual_freq"],
            correction_cents=correction_data["correction_cents"]
        )
        self.db_session.add(correction)
        self.db_session.flush()
        return correction

    def get_tuning_corrections(self, material_id: Optional[str] = None) -> List[TuningCorrection]:
        stmt = select(TuningCorrection)
        if material_id:
            stmt = stmt.where(TuningCorrection.material_id == material_id)
        result = self.db_session.execute(stmt)
        return list(result.scalars().all())

    def delete_tuning_corrections_for_chime(self, chime_id: str) -> None:
        stmt = select(TuningCorrection).where(TuningCorrection.chime_id == chime_id)
        result = self.db_session.execute(stmt)
        corrections = list(result.scalars().all())
        for correction in corrections:
            self.db_session.delete(correction)
        self.db_session.flush()

    def get_tuning_statistics(self) -> List[dict]:
        stmt = text("""
            SELECT
                m.material_type,
                AVG(tc.correction_cents) as avg_correction,
                COUNT(*) as correction_count
            FROM tuning_corrections tc
            JOIN materials m ON tc.material_id = m.id
            GROUP BY m.material_type
        """)
        result = self.db_session.execute(stmt)

        stats = []
        for row in result.all():
            avg_corr = row[1] or 0
            if avg_corr > 5:
                trend = "positive"
            elif avg_corr < -5:
                trend = "negative"
            else:
                trend = "stable"

            stats.append({
                "material_type": row[0],
                "avg_correction_cents": round(avg_corr, 2),
                "correction_count": row[2],
                "trend": trend
            })
        return stats

    def get_avg_dissonance(self) -> float:
        stmt = select(WindChime.chord_info)
        result = self.db_session.execute(stmt)
        total = 0
        count = 0
        for row in result.all():
            if row[0]:
                try:
                    chord_info = json.loads(row[0])
                    dissonance = chord_info.get("dissonance_score")
                    if dissonance is not None:
                        total += dissonance
                        count += 1
                except (json.JSONDecodeError, TypeError):
                    pass
        return round(total / count if count > 0 else 0, 1)
