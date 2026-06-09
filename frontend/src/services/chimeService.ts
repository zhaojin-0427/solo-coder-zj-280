import apiClient from './api';
import { WindChime, CreateChimeData, UpdateChimeData } from '../types';

export interface ChimeListResponse {
  data: WindChime[];
  total: number;
}

export const chimeService = {
  async getAll(params?: { skip?: number; limit?: number }): Promise<ChimeListResponse> {
    const response = await apiClient.get('/api/chimes', { params });
    return response.data;
  },

  async getById(id: string): Promise<WindChime> {
    const response = await apiClient.get(`/api/chimes/${id}`);
    return response.data;
  },

  async create(data: CreateChimeData): Promise<WindChime> {
    const response = await apiClient.post('/api/chimes', data);
    return response.data;
  },

  async update(id: string, data: UpdateChimeData): Promise<WindChime> {
    const response = await apiClient.put(`/api/chimes/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/api/chimes/${id}`);
    return response.data;
  },
};
