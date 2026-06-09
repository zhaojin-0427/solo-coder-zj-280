from typing import Dict, List
from sqlalchemy import select, func, text
from .material_repository import MaterialRepository
from .chime_repository import ChimeRepository
from models.tuning_correction import TuningCorrection
from models.material import Material
from utils.database import db
from utils.pitch_calculator import frequency_to_midi, midi_to_note_name


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

    def get_tuning_corrections(self) -> Dict:
        avg_correction_by_material = self._get_avg_correction_by_material()
        common_corrections = self._get_common_corrections()
        deviation_trend = self._get_deviation_trend()
        common_note_combinations = self._get_common_note_combinations()

        return {
            "avg_correction_by_material": avg_correction_by_material,
            "common_corrections": common_corrections,
            "deviation_trend": deviation_trend,
            "common_note_combinations": common_note_combinations
        }

    def _get_avg_correction_by_material(self) -> List[Dict]:
        stmt = text("""
            SELECT
                m.material_type,
                AVG(tc.correction_cents) as avg_correction,
                COUNT(*) as count
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
                "avg_correction": round(avg_corr, 2),
                "count": row[2],
                "trend": trend
            })
        return stats

    def _get_common_corrections(self) -> List[Dict]:
        stmt = select(
            Material.material_type,
            TuningCorrection.theoretical_freq,
            TuningCorrection.actual_freq,
            TuningCorrection.correction_cents,
            func.count(TuningCorrection.id).label('count')
        ).join(
            Material, TuningCorrection.material_id == Material.id
        ).group_by(
            Material.material_type,
            TuningCorrection.theoretical_freq,
            TuningCorrection.actual_freq,
            TuningCorrection.correction_cents
        ).order_by(
            func.count(TuningCorrection.id).desc()
        ).limit(10)

        result = self.db_session.execute(stmt)
        corrections = []

        for row in result.all():
            material_type = row[0]
            theoretical_freq = row[1]
            actual_freq = row[2]
            correction_cents = row[3]
            count = row[4]

            theoretical_midi = frequency_to_midi(theoretical_freq)
            actual_midi = frequency_to_midi(actual_freq)

            theoretical_note_name, theoretical_octave = midi_to_note_name(theoretical_midi)
            actual_note_name, actual_octave = midi_to_note_name(actual_midi)

            corrections.append({
                "material_type": material_type,
                "original_note": f"{theoretical_note_name}{theoretical_octave}",
                "corrected_note": f"{actual_note_name}{actual_octave}",
                "frequency_diff": round(actual_freq - theoretical_freq, 2),
                "correction_cents": round(correction_cents, 2),
                "count": count
            })

        return corrections

    def _get_deviation_trend(self) -> Dict:
        stmt = select(TuningCorrection.correction_cents)
        result = self.db_session.execute(stmt)
        all_corrections = [row[0] for row in result.all()]

        if not all_corrections:
            return {
                "positive_count": 0,
                "negative_count": 0,
                "stable_count": 0,
                "total_count": 0,
                "trend_percentage": {
                    "positive": 0,
                    "negative": 0,
                    "stable": 0
                }
            }

        positive_count = sum(1 for c in all_corrections if c > 5)
        negative_count = sum(1 for c in all_corrections if c < -5)
        stable_count = len(all_corrections) - positive_count - negative_count
        total = len(all_corrections)

        return {
            "positive_count": positive_count,
            "negative_count": negative_count,
            "stable_count": stable_count,
            "total_count": total,
            "trend_percentage": {
                "positive": round((positive_count / total) * 100, 1),
                "negative": round((negative_count / total) * 100, 1),
                "stable": round((stable_count / total) * 100, 1)
            }
        }

    def _get_common_note_combinations(self) -> List[Dict]:
        stmt = text("""
            SELECT
                tc.chime_id,
                m.theoretical_note,
                tc.correction_cents
            FROM tuning_corrections tc
            JOIN materials m ON tc.material_id = m.id
            ORDER BY tc.chime_id, tc.recorded_at
        """)
        result = self.db_session.execute(stmt)

        chime_notes = {}
        for row in result.all():
            chime_id = row[0]
            note = row[1]
            cents = row[2]

            if chime_id not in chime_notes:
                chime_notes[chime_id] = []

            deviation_type = "stable"
            if cents > 5:
                deviation_type = "sharp"
            elif cents < -5:
                deviation_type = "flat"

            chime_notes[chime_id].append(f"{note}_{deviation_type}")

        combination_counts = {}
        for notes in chime_notes.values():
            if len(notes) >= 2:
                key = "|".join(sorted(notes))
                combination_counts[key] = combination_counts.get(key, 0) + 1

        sorted_combinations = sorted(
            combination_counts.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]

        result_list = []
        for combo, count in sorted_combinations:
            parts = combo.split("|")
            notes = []
            for p in parts:
                note, deviation = p.rsplit("_", 1)
                notes.append({
                    "note": note,
                    "deviation": deviation
                })
            result_list.append({
                "notes": notes,
                "count": count
            })

        return result_list
