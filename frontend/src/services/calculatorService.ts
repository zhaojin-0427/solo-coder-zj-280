import apiClient from './api';
import { PitchResult, ChordAnalysis, MaterialType } from '../types';

export interface PitchCalculateRequest {
  material_type: MaterialType;
  length: number;
  diameter: number;
  wall_thickness: number;
}

export interface ChordAnalyzeRequest {
  frequencies: number[];
}

export const calculatorService = {
  async calculatePitch(params: PitchCalculateRequest): Promise<PitchResult> {
    const response = await apiClient.post('/api/calculate/pitch', params);
    return response.data;
  },

  async analyzeChord(params: ChordAnalyzeRequest): Promise<ChordAnalysis> {
    const response = await apiClient.post('/api/analyze/chord', params);
    return response.data;
  },
};
