from typing import Optional, Tuple, List
from repositories.material_repository import MaterialRepository
from utils.pitch_calculator import calculate_pitch
from utils.database import db


class MaterialService:
    def __init__(self):
        self.repository = MaterialRepository()

    def get_all(self, skip: int = 0, limit: int = 100) -> Tuple[List, int]:
        materials, total = self.repository.get_filtered(skip=skip, limit=limit)
        return materials, total

    def get_filtered(
        self,
        material_type: Optional[str] = None,
        min_pitch: Optional[float] = None,
        max_pitch: Optional[float] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List, int]:
        return self.repository.get_filtered(
            material_type=material_type,
            min_pitch=min_pitch,
            max_pitch=max_pitch,
            search=search,
            skip=skip,
            limit=limit
        )

    def get_by_id(self, material_id: str):
        return self.repository.get_by_id(material_id)

    def create(self, data: dict):
        pitch_result = calculate_pitch(
            data["material_type"],
            data["length"],
            data["diameter"],
            data["wall_thickness"]
        )
        data["theoretical_pitch"] = pitch_result["frequency"]
        data["theoretical_note"] = pitch_result["note"]

        material = self.repository.create(data)
        db.session.commit()
        return material

    def update(self, material_id: str, data: dict):
        material = self.repository.get_by_id(material_id)
        if not material:
            return None

        needs_recalc = any(
            key in data for key in ["material_type", "length", "diameter", "wall_thickness"]
        )

        if needs_recalc:
            pitch_result = calculate_pitch(
                data.get("material_type") or material.material_type,
                data.get("length") or material.length,
                data.get("diameter") or material.diameter,
                data.get("wall_thickness") or material.wall_thickness
            )
            data["theoretical_pitch"] = pitch_result["frequency"]
            data["theoretical_note"] = pitch_result["note"]

        updated = self.repository.update(material, data)
        db.session.commit()
        return updated

    def delete(self, material_id: str) -> bool:
        success = self.repository.delete(material_id)
        if success:
            db.session.commit()
        return success
