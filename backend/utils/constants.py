from enum import Enum


class MaterialType(str, Enum):
    ALUMINUM = "aluminum"
    COPPER = "copper"
    BAMBOO = "bamboo"
    GLASS = "glass"


MATERIAL_PROPERTIES = {
    MaterialType.ALUMINUM: {
        "density": 2700.0,
        "sound_velocity": 5100.0,
        "decay_rate": 0.8,
        "display_name": "铝",
        "color": "#C0C0C0"
    },
    MaterialType.COPPER: {
        "density": 8960.0,
        "sound_velocity": 4760.0,
        "decay_rate": 0.5,
        "display_name": "铜",
        "color": "#B87333"
    },
    MaterialType.BAMBOO: {
        "density": 700.0,
        "sound_velocity": 3500.0,
        "decay_rate": 1.2,
        "display_name": "竹",
        "color": "#7BA05B"
    },
    MaterialType.GLASS: {
        "density": 2500.0,
        "sound_velocity": 5640.0,
        "decay_rate": 0.9,
        "display_name": "玻璃",
        "color": "#87CEEB"
    }
}

NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

A4_FREQUENCY = 440.0
A4_MIDI = 69

SPEED_OF_SOUND_AIR = 343.0
END_CORRECTION_FACTOR = 0.8
