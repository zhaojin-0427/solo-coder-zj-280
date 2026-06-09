import apiClient from './api';
import {
  WorkOrder,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  WorkOrderStatistics,
  WindChimeWithWorkOrder,
  WorkOrderStage,
} from '../types';

export interface WorkOrderListResponse {
  data: WorkOrder[];
  total: number;
}

export interface WorkOrderFilterParams {
  status?: string;
  priority?: string;
  delivery_date_from?: string;
  delivery_date_to?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export const workOrderService = {
  async getAll(params?: WorkOrderFilterParams): Promise<WorkOrderListResponse> {
    const response = await apiClient.get('/api/work-orders', { params });
    return response.data;
  },

  async getById(id: string): Promise<WorkOrder> {
    const response = await apiClient.get(`/api/work-orders/${id}`);
    return response.data;
  },

  async getByChimeId(chimeId: string): Promise<WorkOrderListResponse> {
    const response = await apiClient.get(`/api/work-orders/by-chime/${chimeId}`);
    return response.data;
  },

  async create(data: CreateWorkOrderData): Promise<WorkOrder> {
    const response = await apiClient.post('/api/work-orders', data);
    return response.data;
  },

  async update(id: string, data: UpdateWorkOrderData): Promise<WorkOrder> {
    const response = await apiClient.put(`/api/work-orders/${id}`, data);
    return response.data;
  },

  async updateStatus(id: string, status: string): Promise<WorkOrder> {
    const response = await apiClient.put(`/api/work-orders/${id}/status`, { status });
    return response.data;
  },

  async updateStage(id: string, stage: WorkOrderStage, completed: boolean): Promise<WorkOrder> {
    const response = await apiClient.put(`/api/work-orders/${id}/stage`, { stage, completed });
    return response.data;
  },

  async delete(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/api/work-orders/${id}`);
    return response.data;
  },

  async getStatistics(): Promise<WorkOrderStatistics> {
    const response = await apiClient.get('/api/work-orders/statistics');
    return response.data;
  },

  async getChimesWithWorkOrderStatus(): Promise<{ data: WindChimeWithWorkOrder[]; total: number }> {
    const response = await apiClient.get('/api/work-orders/chimes-with-status');
    return response.data;
  },
};
