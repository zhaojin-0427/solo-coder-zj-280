import json
from typing import List, Optional
from repositories.chime_repository import ChimeRepository
from utils.database import db


class ChimeService:
    def __init__(self):
        self.repository = ChimeRepository()

    def get_all(self, skip: int = 0, limit: int = 100) -> List:
        return self.repository.get_all_with_timestamps(skip=skip, limit=limit)

    def get_by_id(self, chime_id: str):
        return self.repository.get_by_id(chime_id)

    def create(self, data: dict):
        chime_data = {
            "name": data["name"],
            "description": data.get("description"),
            "materials": json.dumps(data["materials"]),
            "hang_order": json.dumps(data.get("hang_order", [])),
            "chord_info": json.dumps(data.get("chord_info", {}))
        }
        chime = self.repository.create(chime_data)

        tuning_corrections = data.get("tuning_corrections")
        if tuning_corrections:
            for tc in tuning_corrections:
                self.repository.add_tuning_correction(chime.id, tc.model_dump())

        db.session.commit()
        return chime

    def update(self, chime_id: str, data: dict):
        chime = self.repository.get_by_id(chime_id)
        if not chime:
            return None

        update_data = {}
        if "name" in data:
            update_data["name"] = data["name"]
        if "description" in data:
            update_data["description"] = data["description"]
        if "materials" in data:
            update_data["materials"] = json.dumps(data["materials"])
        if "hang_order" in data:
            update_data["hang_order"] = json.dumps(data["hang_order"])
        if "chord_info" in data:
            update_data["chord_info"] = json.dumps(data["chord_info"])

        updated = self.repository.update(chime, update_data)

        tuning_corrections = data.get("tuning_corrections")
        if tuning_corrections is not None:
            self.repository.delete_tuning_corrections_for_chime(chime_id)
            for tc in tuning_corrections:
                tc_dict = tc.model_dump() if hasattr(tc, "model_dump") else tc
                self.repository.add_tuning_correction(chime_id, tc_dict)

        db.session.commit()
        return updated

    def delete(self, chime_id: str) -> bool:
        success = self.repository.delete(chime_id)
        if success:
            db.session.commit()
        return success
