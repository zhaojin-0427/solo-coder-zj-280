const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const A4_FREQUENCY = 440;
const A4_MIDI = 69;

export function frequencyToMidi(frequency: number): number {
  return A4_MIDI + 12 * Math.log2(frequency / A4_FREQUENCY);
}

export function midiToNoteName(midiNumber: number): { note: string; octave: number } {
  const midiRounded = Math.round(midiNumber);
  const octave = Math.floor(midiRounded / 12) - 1;
  const noteIndex = midiRounded % 12;
  return { note: NOTE_NAMES[noteIndex], octave };
}

export function getNoteColor(note: string): string {
  const noteName = note.replace(/[0-9]/g, '');
  const colors: Record<string, string> = {
    'C': '#FF6B6B',
    'C#': '#FF8E53',
    'D': '#FFD93D',
    'D#': '#6BCB77',
    'E': '#4D96FF',
    'F': '#6F69AC',
    'F#': '#845EC2',
    'G': '#B983FF',
    'G#': '#FF6F91',
    'A': '#FF9671',
    'A#': '#FFC75F',
    'B': '#F9F871',
  };
  return colors[noteName] || '#333333';
}

export function calculateCentsDeviation(frequency: number, midiNumber: number): number {
  const nearestMidi = Math.round(midiNumber);
  const nearestFreq = A4_FREQUENCY * Math.pow(2, (nearestMidi - A4_MIDI) / 12);
  if (nearestFreq === 0) return 0;
  return 1200 * Math.log2(frequency / nearestFreq);
}

export function getFrequencyRangeLabel(minFreq: number, maxFreq: number): string {
  const minNote = midiToNoteName(frequencyToMidi(minFreq));
  const maxNote = midiToNoteName(frequencyToMidi(maxFreq));
  return `${minNote.note}${minNote.octave} - ${maxNote.note}${maxNote.octave}`;
}
