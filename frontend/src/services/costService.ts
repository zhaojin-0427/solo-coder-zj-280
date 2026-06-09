import api from './api';
import {
  CostCalculationResult,
  CostSnapshot,
  CostCalculateRequest,
  CostStatistics,
} from '../types';

export const costService = {
  calculate: async (data: CostCalculateRequest): Promise<CostCalculationResult> => {
    const response = await api.post('/api/cost/calculate', data);
    return response.data;
  },

  createSnapshot: async (data: CostCalculateRequest): Promise<CostSnapshot> => {
    const response = await api.post('/api/cost/snapshot', data);
    return response.data;
  },

  getStatistics: async (): Promise<CostStatistics> => {
    const response = await api.get('/api/statistics/cost');
    return response.data;
  },
};
