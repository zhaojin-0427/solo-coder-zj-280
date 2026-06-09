from utils.pitch_calculator import calculate_pitch


class PitchService:
    @staticmethod
    def calculate(material_type: str, length: float, diameter: float, wall_thickness: float) -> dict:
        return calculate_pitch(material_type, length, diameter, wall_thickness)
