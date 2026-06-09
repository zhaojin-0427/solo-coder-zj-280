import math
from .constants import (
    MaterialType,
    MATERIAL_PROPERTIES,
    NOTE_NAMES,
    A4_FREQUENCY,
    A4_MIDI,
    SPEED_OF_SOUND_AIR,
    END_CORRECTION_FACTOR
)


def frequency_to_midi(frequency: float) -> float:
    return A4_MIDI + 12 * math.log2(frequency / A4_FREQUENCY)


def midi_to_note_name(midi_number: float) -> tuple[str, int]:
    midi_rounded = round(midi_number)
    octave = midi_rounded // 12 - 1
    note_index = midi_rounded % 12
    return NOTE_NAMES[note_index], octave


def calculate_cents_deviation(frequency: float, midi_number: float) -> float:
    nearest_midi = round(midi_number)
    nearest_freq = A4_FREQUENCY * (2 ** ((nearest_midi - A4_MIDI) / 12))
    if nearest_freq == 0:
        return 0.0
    return 1200 * math.log2(frequency / nearest_freq)


def calculate_open_pipe_frequency(
    length_mm: float,
    diameter_mm: float,
    harmonic: int = 1
) -> float:
    length_m = length_mm / 1000.0
    diameter_m = diameter_mm / 1000.0
    inner_diameter = diameter_m
    effective_length = length_m * (1 + END_CORRECTION_FACTOR * inner_diameter / length_m)
    frequency = (SPEED_OF_SOUND_AIR * harmonic) / (2 * effective_length)
    return frequency


def calculate_overtones(
    base_frequency: float,
    material_type: MaterialType,
    num_overtones: int = 8
) -> list[dict]:
    properties = MATERIAL_PROPERTIES[material_type]
    decay_rate = properties["decay_rate"]
    
    overtones = []
    for n in range(1, num_overtones + 1):
        harmonic_freq = base_frequency * n
        if n == 1:
            amplitude = 1.0
        else:
            amplitude = math.exp(-decay_rate * (n - 1)) * (1.0 / n)
        overtones.append({
            "harmonic": n,
            "frequency": round(harmonic_freq, 2),
            "amplitude": round(amplitude, 4)
        })
    return overtones


def calculate_pitch(
    material_type: str,
    length_mm: float,
    diameter_mm: float,
    wall_thickness_mm: float
) -> dict:
    material = MaterialType(material_type)
    properties = MATERIAL_PROPERTIES[material]
    
    base_frequency = calculate_open_pipe_frequency(length_mm, diameter_mm)
    base_frequency = round(base_frequency, 2)
    
    midi_number = frequency_to_midi(base_frequency)
    note_name, octave = midi_to_note_name(midi_number)
    cents_deviation = round(calculate_cents_deviation(base_frequency, midi_number), 2)
    
    overtones = calculate_overtones(base_frequency, material)
    
    return {
        "frequency": base_frequency,
        "note": f"{note_name}{octave}",
        "octave": octave,
        "cents_deviation": cents_deviation,
        "overtones": overtones,
        "material_properties": {
            "density": properties["density"],
            "sound_velocity": properties["sound_velocity"],
            "decay_rate": properties["decay_rate"]
        }
    }
