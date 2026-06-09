import api from './api';
import { StatisticsData } from '../types';

export const statisticsService = {
  getAll: async (): Promise<StatisticsData> => {
    const [pitchRange, chords, usage, tuning] = await Promise.all([
      api.get('/api/statistics/pitch-range'),
      api.get('/api/statistics/chords'),
      api.get('/api/statistics/material-usage'),
      api.get('/api/statistics/tuning-corrections'),
    ]);

    const tuningData = tuning.data;
    const normalizedTuning = Array.isArray(tuningData)
      ? {
          avg_correction_by_material: [],
          common_corrections: [],
          deviation_trend: undefined,
          common_note_combinations: [],
        }
      : tuningData || {
          avg_correction_by_material: [],
          common_corrections: [],
          deviation_trend: undefined,
          common_note_combinations: [],
        };

    return {
      pitch_range_by_material: pitchRange.data || [],
      chord_statistics: chords.data || [],
      material_usage: usage.data || [],
      tuning_statistics: normalizedTuning,
    };
  },

  getOverview: async () => {
    const response = await api.get('/api/statistics/overview');
    return response.data;
  },

  getPitchRange: async () => {
    const response = await api.get('/api/statistics/pitch-range');
    return response.data;
  },

  getChordStatistics: async () => {
    const response = await api.get('/api/statistics/chords');
    return response.data;
  },

  getMaterialUsage: async () => {
    const response = await api.get('/api/statistics/material-usage');
    return response.data;
  },

  getTuningCorrections: async () => {
    const response = await api.get('/api/statistics/tuning-corrections');
    return response.data;
  },
};
