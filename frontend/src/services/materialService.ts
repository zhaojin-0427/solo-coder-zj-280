import apiClient from './api';
import { Material, CreateMaterialData, UpdateMaterialData } from '../types';

export interface MaterialListResponse {
  data: Material[];
  total: number;
}

export const materialService = {
  async getAll(params?: {
    type?: string;
    min_pitch?: number;
    max_pitch?: number;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<MaterialListResponse> {
    const response = await apiClient.get('/api/materials', { params });
    return response.data;
  },

  async getById(id: string): Promise<Material> {
    const response = await apiClient.get(`/api/materials/${id}`);
    return response.data;
  },

  async create(data: CreateMaterialData): Promise<Material> {
    const response = await apiClient.post('/api/materials', data);
    return response.data;
  },

  async update(id: string, data: UpdateMaterialData): Promise<Material> {
    const response = await apiClient.put(`/api/materials/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/api/materials/${id}`);
    return response.data;
  },
};
