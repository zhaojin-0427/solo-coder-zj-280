from typing import Dict, List
from sqlalchemy import select, func, text
import json
from .material_repository import MaterialRepository
from .chime_repository import ChimeRepository
from models.tuning_correction import TuningCorrection
from models.material import Material
from models.chime import WindChime
from utils.database import db
from utils.pitch_calculator import frequency_to_midi, midi_to_note_name


class StatisticsRepository:
    def __init__(self):
        self.material_repo = MaterialRepository()
        self.chime_repo = ChimeRepository()
        self.db_session = db.session

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

    def get_cost_statistics(self) -> Dict:
        cost_by_material_type = self._get_cost_by_material_type()
        profit_ranking = self._get_profit_ranking()
        supplier_usage = self._get_supplier_usage()
        high_loss_materials = self._get_high_loss_materials()
        total_inventory_value = self._get_total_inventory_value()
        avg_profit_rate = self._get_avg_profit_rate()

        return {
            "cost_by_material_type": cost_by_material_type,
            "profit_ranking": profit_ranking,
            "supplier_usage": supplier_usage,
            "high_loss_materials": high_loss_materials,
            "total_inventory_value": round(total_inventory_value, 2),
            "avg_profit_rate": round(avg_profit_rate, 4)
        }

    def _get_cost_by_material_type(self) -> List[Dict]:
        stmt = select(
            Material.material_type,
            func.sum(Material.purchase_price),
            func.count(Material.id)
        ).group_by(Material.material_type)

        result = self.db_session.execute(stmt)
        all_costs = []
        total_cost = 0.0

        for row in result.all():
            mat_type = row[0]
            cost = row[1] or 0.0
            count = row[2] or 0
            total_cost += cost
            all_costs.append({
                "material_type": mat_type,
                "total_cost": round(cost, 2),
                "count": count,
                "percentage": 0
            })

        for item in all_costs:
            item["percentage"] = round((item["total_cost"] / total_cost * 100) if total_cost > 0 else 0, 2)

        return sorted(all_costs, key=lambda x: x["total_cost"], reverse=True)

    def _get_profit_ranking(self) -> List[Dict]:
        stmt = select(WindChime).where(WindChime.cost_snapshot.isnot(None))
        result = self.db_session.execute(stmt)
        chimes = list(result.scalars().all())

        profit_data = []
        for chime in chimes:
            try:
                cost_snapshot = json.loads(chime.cost_snapshot) if chime.cost_snapshot else None
                if cost_snapshot:
                    material_ids = json.loads(chime.materials) if chime.materials else []
                    profit_data.append({
                        "chime_id": chime.id,
                        "chime_name": chime.name,
                        "total_cost": cost_snapshot.get("total_cost", 0),
                        "suggested_price": cost_snapshot.get("suggested_price", 0),
                        "profit_margin": cost_snapshot.get("profit_margin", 0),
                        "profit_rate": cost_snapshot.get("profit_rate", 0),
                        "material_count": len(material_ids),
                        "created_at": chime.created_at.isoformat() if chime.created_at else None
                    })
            except (json.JSONDecodeError, TypeError):
                continue

        return sorted(profit_data, key=lambda x: x["profit_rate"], reverse=True)

    def _get_supplier_usage(self) -> List[Dict]:
        used_material_ids = self.chime_repo.get_all_material_ids()
        used_id_set = set(used_material_ids)

        stmt = select(Material.supplier, Material.material_type, Material.purchase_price, Material.id)\
            .where(Material.supplier.isnot(None))\
            .where(Material.supplier != '')

        result = self.db_session.execute(stmt)
        supplier_data = {}

        for row in result.all():
            supplier = row[0]
            mat_type = row[1]
            price = row[2] or 0.0
            mat_id = row[3]

            if supplier not in supplier_data:
                supplier_data[supplier] = {
                    "supplier": supplier,
                    "material_count": 0,
                    "total_cost": 0.0,
                    "used_count": 0,
                    "material_types": set()
                }

            supplier_data[supplier]["material_count"] += 1
            supplier_data[supplier]["total_cost"] += price
            supplier_data[supplier]["material_types"].add(mat_type)
            if mat_id in used_id_set:
                supplier_data[supplier]["used_count"] += 1

        result_list = []
        for supplier, data in supplier_data.items():
            result_list.append({
                "supplier": supplier,
                "material_count": data["material_count"],
                "total_cost": round(data["total_cost"], 2),
                "used_count": data["used_count"],
                "material_types": sorted(list(data["material_types"]))
            })

        return sorted(result_list, key=lambda x: x["total_cost"], reverse=True)

    def _get_high_loss_materials(self) -> List[Dict]:
        threshold = 5.0
        stmt = select(Material).where(Material.loss_rate >= threshold).order_by(Material.loss_rate.desc())

        result = self.db_session.execute(stmt)
        materials = list(result.scalars().all())

        high_loss_list = []
        for mat in materials:
            loss_rate = mat.loss_rate or 0.0
            if loss_rate >= 10:
                risk_level = "high"
            elif loss_rate >= 7:
                risk_level = "medium"
            else:
                risk_level = "low"

            high_loss_list.append({
                "material_id": mat.id,
                "material_name": mat.name,
                "material_type": mat.material_type,
                "loss_rate": loss_rate,
                "purchase_price": mat.purchase_price or 0.0,
                "supplier": mat.supplier,
                "stock_quantity": mat.stock_quantity or 0,
                "risk_level": risk_level
            })

        return high_loss_list

    def _get_total_inventory_value(self) -> float:
        stmt = select(func.sum(Material.purchase_price * Material.stock_quantity))
        result = self.db_session.execute(stmt)
        total = result.scalar_one_or_none() or 0.0
        return float(total)

    def _get_avg_profit_rate(self) -> float:
        stmt = select(WindChime.cost_snapshot).where(WindChime.cost_snapshot.isnot(None))
        result = self.db_session.execute(stmt)

        profit_rates = []
        for row in result.all():
            try:
                snapshot = json.loads(row[0]) if row[0] else None
                if snapshot and snapshot.get("profit_rate") is not None:
                    profit_rates.append(snapshot["profit_rate"])
            except (json.JSONDecodeError, TypeError):
                continue

        if not profit_rates:
            return 0.0
        return sum(profit_rates) / len(profit_rates)

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
