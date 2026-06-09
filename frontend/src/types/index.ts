export type MaterialType = 'aluminum' | 'copper' | 'bamboo' | 'glass';

export interface Material {
  id: string;
  material_type: MaterialType;
  name: string;
  length: number;
  diameter: number;
  wall_thickness: number;
  theoretical_pitch: number;
  theoretical_note: string;
  created_at: string;
  updated_at: string;
}

export interface Overtone {
  harmonic: number;
  frequency: number;
  amplitude: number;
  note: string;
}

export interface MaterialProperties {
  density: number;
  sound_velocity: number;
  decay_rate: number;
}

export interface PitchResult {
  frequency: number;
  note: string;
  octave: number;
  cents_deviation: number;
  midi_number: number;
  wavelength: number;
  overtones: Overtone[];
  material_properties: MaterialProperties;
}

export interface IntervalInfo {
  notes: string;
  name: string;
  semitones: number;
}

export interface ChordAnalysis {
  chord_name: string;
  chord_names: string[];
  chord_quality: string | null;
  intervals: IntervalInfo[];
  root_note: string;
  notes: string[];
  dissonance: number;
  dissonance_score: number;
  frequencies: number[];
  suggested_frequencies: number[];
}

export interface TuningCorrection {
  material_id: number;
  theoretical_freq: number;
  actual_freq: number;
  correction_cents: number;
  recorded_at?: string;
}

export interface WindChime {
  id: number;
  name: string;
  description: string;
  materials: Material[];
  hang_order: number[];
  chord_info: {
    chord_name: string;
    chord_names: string[];
    frequencies: number[];
    notes: string[];
    dissonance_score?: number;
  };
  tuning_corrections?: TuningCorrection[];
  created_at: string;
  updated_at: string;
}

export interface CreateMaterialData {
  material_type: MaterialType;
  name: string;
  length: number;
  diameter: number;
  wall_thickness: number;
}

export interface UpdateMaterialData {
  material_type?: MaterialType;
  name?: string;
  length?: number;
  diameter?: number;
  wall_thickness?: number;
  theoretical_pitch?: number;
  theoretical_note?: string;
}

export interface CreateChimeData {
  name: string;
  description?: string;
  materials: string[];
  hang_order: string[];
  chord_info: {
    chord_name: string;
    frequencies: number[];
    notes: string[];
  };
  tuning_corrections?: TuningCorrection[];
}

export interface UpdateChimeData {
  name?: string;
  description?: string;
  materials?: string[];
  hang_order?: string[];
  chord_info?: {
    chord_name: string;
    frequencies: number[];
    notes: string[];
  };
}

export interface MaterialFilter {
  type: MaterialType | null;
  pitchRange: [number, number] | null;
  search: string;
}

export interface StatisticsOverview {
  total_materials: number;
  total_chimes: number;
  material_breakdown: Record<string, number>;
  avg_dissonance: number;
}

export interface PitchRangeData {
  material: string;
  min_freq: number;
  max_freq: number;
  min_note: string;
  max_note: string;
  count: number;
}

export interface ChordPopularity {
  chord_name: string;
  count: number;
  avg_dissonance: number;
}

export interface MaterialUsage {
  material_type: string;
  total_count: number;
  used_count: number;
  utilization_rate: number;
}

export interface TuningCorrectionStat {
  material_type: string;
  avg_correction_cents: number;
  correction_count: number;
  trend: 'positive' | 'negative' | 'stable';
}

export interface StatisticsData {
  pitch_range_by_material: Array<{
    material_type: string;
    min_pitch: number;
    max_pitch: number;
    avg_pitch: number;
    count: number;
  }>;
  chord_statistics: Array<{
    chord_name: string;
    count: number;
  }>;
  material_usage: Array<{
    material_type: string;
    total_count: number;
    used_count: number;
    utilization_rate: number;
  }>;
  tuning_statistics: {
    avg_correction_by_material: Array<{
      material_type: string;
      avg_correction: number;
      count: number;
    }>;
    common_corrections: Array<{
      material_type: string;
      original_note: string;
      corrected_note: string;
      frequency_diff: number;
      correction_cents: number;
      count: number;
    }>;
  };
}

export interface MaterialTypeInfo {
  display_name: string;
  color: string;
  density: number;
  sound_velocity: number;
  decay_rate: number;
}

export const MATERIAL_TYPE_INFO: Record<MaterialType, MaterialTypeInfo> = {
  aluminum: {
    display_name: '铝',
    color: '#C0C0C0',
    density: 2700,
    sound_velocity: 5100,
    decay_rate: 0.8,
  },
  copper: {
    display_name: '铜',
    color: '#B87333',
    density: 8960,
    sound_velocity: 4760,
    decay_rate: 0.5,
  },
  bamboo: {
    display_name: '竹',
    color: '#7BA05B',
    density: 700,
    sound_velocity: 3300,
    decay_rate: 1.2,
  },
  glass: {
    display_name: '玻璃',
    color: '#87CEEB',
    density: 2500,
    sound_velocity: 5640,
    decay_rate: 0.9,
  },
};
