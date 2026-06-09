from utils.chord_analyzer import find_chord


class ChordService:
    @staticmethod
    def analyze(frequencies: list[float]) -> dict:
        return find_chord(frequencies)
