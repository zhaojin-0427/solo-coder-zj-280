from typing import Dict
from .material_repository import MaterialRepository
from .chime_repository import ChimeRepository
from utils.database import db


class StatisticsRepository:
    def __init__(self):
        self.material_repo = MaterialRepository()
        self.chime_repo = ChimeRepository()

    def get_overview(self) -> Dict:
        total_materials = self.material_repo.count()
        total_chimes = self.chime_repo.count()

        material_breakdown = {}
        pitch_ranges = self.material_repo.get_pitch_range_by_material()
        for pr in pitch_ranges:
            material_breakdown[pr["material"]] = pr["count"]

        avg_dissonance = self.chime_repo.get_avg_dissonance()

        return {
            "total_materials": total_materials,
            "total_chimes": total_chimes,
            "material_breakdown": material_breakdown,
            "avg_dissonance": avg_dissonance
        }

    def get_pitch_ranges(self):
        return self.material_repo.get_pitch_range_by_material()

    def get_popular_chords(self):
        return self.chime_repo.get_chord_statistics()

    def get_material_usage(self):
        used_ids = self.chime_repo.get_all_material_ids()
        return self.material_repo.get_material_usage(used_ids)

    def get_tuning_corrections(self):
        return self.chime_repo.get_tuning_statistics()
