from typing import List, Optional, Tuple
from sqlalchemy import select, func, and_
from .base_repository import BaseRepository
from models.material import Material
from utils.database import db


class MaterialRepository(BaseRepository[Material]):
    def __init__(self):
        super().__init__(Material, db.session)

    def get_filtered(
        self,
        material_type: Optional[str] = None,
        min_pitch: Optional[float] = None,
        max_pitch: Optional[float] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Material], int]:
        stmt = select(Material)
        conditions = []

        if material_type:
            conditions.append(Material.material_type == material_type)
        if min_pitch is not None:
            conditions.append(Material.theoretical_pitch >= min_pitch)
        if max_pitch is not None:
            conditions.append(Material.theoretical_pitch <= max_pitch)
        if search:
            conditions.append(Material.name.ilike(f"%{search}%"))

        if conditions:
            stmt = stmt.where(and_(*conditions))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db_session.execute(count_stmt).scalar_one()

        stmt = stmt.order_by(Material.created_at.desc()).offset(skip).limit(limit)
        result = self.db_session.execute(stmt)
        materials = list(result.scalars().all())

        return materials, int(total)

    def get_pitch_range_by_material(self) -> List[dict]:
        stmt = select(
            Material.material_type,
            func.min(Material.theoretical_pitch),
            func.max(Material.theoretical_pitch),
            func.min(Material.theoretical_note),
            func.max(Material.theoretical_note),
            func.count(Material.id)
        ).group_by(Material.material_type)

        result = self.db_session.execute(stmt)
        return [
            {
                "material": row[0],
                "min_freq": row[1],
                "max_freq": row[2],
                "min_note": row[3],
                "max_note": row[4],
                "count": row[5]
            }
            for row in result.all()
        ]

    def get_material_usage(self, used_material_ids: List[str]) -> List[dict]:
        stmt = select(
            Material.material_type,
            func.count(Material.id)
        ).group_by(Material.material_type)
        result = self.db_session.execute(stmt)
        all_counts = {row[0]: row[1] for row in result.all()}

        used_stmt = select(
            Material.material_type,
            func.count(Material.id)
        )
        if used_material_ids:
            used_stmt = used_stmt.where(Material.id.in_(used_material_ids))
        else:
            used_stmt = used_stmt.where(Material.id.in_([]))
        used_stmt = used_stmt.group_by(Material.material_type)
        used_result = self.db_session.execute(used_stmt)
        used_counts = {row[0]: row[1] for row in used_result.all()}

        return [
            {
                "material_type": mat_type,
                "total_count": total,
                "used_count": used_counts.get(mat_type, 0),
                "utilization_rate": round(
                    (used_counts.get(mat_type, 0) / total * 100) if total > 0 else 0,
                    2
                )
            }
            for mat_type, total in all_counts.items()
        ]
