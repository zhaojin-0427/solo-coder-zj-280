import math
from typing import Optional
from .constants import NOTE_NAMES, A4_FREQUENCY, A4_MIDI


def frequency_to_midi(frequency: float) -> float:
    return A4_MIDI + 12 * math.log2(frequency / A4_FREQUENCY)


def normalize_pitch_class(midi_number: float) -> int:
    return int(round(midi_number) % 12)


def get_note_name(pitch_class: int) -> str:
    return NOTE_NAMES[pitch_class]


def calculate_interval_semitones(freq1: float, freq2: float) -> float:
    return 12 * math.log2(freq2 / freq1)


CHORD_QUALITIES = {
    (0, 4, 7): ("major", ""),
    (0, 3, 7): ("minor", "m"),
    (0, 3, 6): ("diminished", "dim"),
    (0, 4, 8): ("augmented", "aug"),
    (0, 5, 7): ("sus4", "sus4"),
    (0, 2, 7): ("sus2", "sus2"),
    (0, 4, 7, 10): ("dominant7", "7"),
    (0, 3, 7, 10): ("minor7", "m7"),
    (0, 4, 7, 11): ("major7", "maj7"),
    (0, 3, 7, 11): ("minor_major7", "mM7"),
    (0, 3, 6, 9): ("diminished7", "dim7"),
    (0, 3, 6, 10): ("half_diminished7", "ø7"),
    (0, 4, 8, 11): ("augmented7", "aug7"),
}


def find_chord(frequencies: list[float]) -> dict:
    if not frequencies:
        return {
            "chord_name": "无",
            "chord_quality": None,
            "intervals": [],
            "root_note": "无",
            "dissonance_score": 0,
            "suggested_frequencies": []
        }
    
    sorted_freqs = sorted(frequencies)
    midi_values = [frequency_to_midi(f) for f in sorted_freqs]
    pitch_classes = [normalize_pitch_class(m) for m in midi_values]
    
    intervals = []
    for i in range(1, len(sorted_freqs)):
        semitones = calculate_interval_semitones(sorted_freqs[0], sorted_freqs[i])
        intervals.append(f"{round(semitones)}半音")
    
    unique_pitches = sorted(set(pitch_classes))
    root_pitch = min(unique_pitches)
    relative_pitches = tuple(sorted((p - root_pitch) % 12 for p in unique_pitches if len(unique_pitches) >= 3))
    
    chord_quality = None
    chord_suffix = ""
    
    if len(unique_pitches) >= 3:
        for pattern, (quality, suffix) in CHORD_QUALITIES.items():
            if len(pattern) == len(relative_pitches) and all(p in relative_pitches for p in pattern):
                chord_quality = quality
                chord_suffix = suffix
                break
    
    if chord_quality is None:
        if len(unique_pitches) == 2:
            chord_name = f"{get_note_name(root_pitch)}五度"
            chord_quality = "power"
        else:
            dissonant_intervals = sum(1 for i in range(len(unique_pitches)) 
                                       for j in range(i+1, len(unique_pitches))
                                       if abs(unique_pitches[j] - unique_pitches[i]) in [1, 6, 11])
            if dissonant_intervals > 0:
                chord_name = f"{get_note_name(root_pitch)}不协和和弦"
                chord_quality = "cluster"
            else:
                chord_name = f"{get_note_name(root_pitch)}复合音程"
                chord_quality = "complex"
    else:
        chord_name = f"{get_note_name(root_pitch)}{chord_suffix}"
    
    dissonance_score = calculate_dissonance(sorted_freqs)
    
    suggested = []
    if len(sorted_freqs) >= 3 and dissonance_score > 50:
        base_freq = sorted_freqs[0]
        suggested = [
            round(base_freq, 2),
            round(base_freq * 1.25, 2),
            round(base_freq * 1.5, 2)
        ]
    
    notes = [get_note_name(pc) for pc in unique_pitches]
    
    return {
        "chord_name": chord_name,
        "chord_quality": chord_quality,
        "intervals": intervals,
        "root_note": get_note_name(root_pitch),
        "notes": notes,
        "dissonance_score": round(dissonance_score, 1),
        "suggested_frequencies": suggested
    }


def calculate_dissonance(frequencies: list[float]) -> float:
    if len(frequencies) < 2:
        return 0.0
    
    dissonance = 0.0
    for i in range(len(frequencies)):
        for j in range(i + 1, len(frequencies)):
            f1, f2 = frequencies[i], frequencies[j]
            interval = abs(12 * math.log2(f2 / f1))
            
            roughness = math.exp(-3.5 * abs(interval - 1.0))
            roughness += 0.5 * math.exp(-2.5 * abs(interval - 6.0))
            
            simple_ratio = find_simple_ratio(f1, f2)
            ratio_penalty = (1 - simple_ratio) * 20
            
            dissonance += roughness * 30 + ratio_penalty
    
    max_dissonance = len(frequencies) * (len(frequencies) - 1) / 2 * 50
    return min(100, (dissonance / max(max_dissonance, 1)) * 100)


def find_simple_ratio(f1: float, f2: float) -> float:
    ratio = max(f1, f2) / min(f1, f2)
    best_ratio = 1.0
    for denom in range(1, 10):
        for num in range(denom, denom + 5):
            simple = num / denom
            if abs(ratio - simple) < abs(ratio - best_ratio):
                best_ratio = simple
    simplicity = 1.0 / (best_ratio * 2) if best_ratio > 1 else 1.0
    return max(0.1, min(1.0, simplicity))
