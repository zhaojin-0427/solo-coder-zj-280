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
  purchase_price: number;
  stock_quantity: number;
  loss_rate: number;
  supplier: string;
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
  id?: string;
  chime_id?: string;
  material_id: string;
  theoretical_freq: number;
  actual_freq: number;
  correction_cents: number;
  recorded_at?: string;
}

export type TuningStatus = 'none' | 'ok' | 'warning' | 'error';

export interface DeviationTrend {
  positive_count: number;
  negative_count: number;
  stable_count: number;
  total_count: number;
  trend_percentage: {
    positive: number;
    negative: number;
    stable: number;
  };
}

export interface NoteDeviation {
  note: string;
  deviation: 'sharp' | 'flat' | 'stable';
}

export interface NoteCombination {
  notes: NoteDeviation[];
  count: number;
}

export interface WindChime {
  id: number | string;
  name: string;
  description: string;
  materials: Material[] | string[];
  hang_order: string[];
  chord_info: {
    chord_name: string;
    chord_names: string[];
    frequencies: number[];
    notes: string[];
    dissonance_score?: number;
  };
  tuning_corrections?: TuningCorrection[];
  cost_snapshot: CostSnapshot | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMaterialData {
  material_type: MaterialType;
  name: string;
  length: number;
  diameter: number;
  wall_thickness: number;
  purchase_price?: number;
  stock_quantity?: number;
  loss_rate?: number;
  supplier?: string;
}

export interface UpdateMaterialData {
  material_type?: MaterialType;
  name?: string;
  length?: number;
  diameter?: number;
  wall_thickness?: number;
  theoretical_pitch?: number;
  theoretical_note?: string;
  purchase_price?: number;
  stock_quantity?: number;
  loss_rate?: number;
  supplier?: string;
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
  tuning_corrections?: TuningCorrection[];
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

export interface AvgCorrectionByMaterial {
  material_type: string;
  avg_correction: number;
  count: number;
  trend?: 'positive' | 'negative' | 'stable';
}

export interface CommonCorrection {
  material_type: string;
  original_note: string;
  corrected_note: string;
  frequency_diff: number;
  correction_cents: number;
  count: number;
}

export interface TuningStatistics {
  avg_correction_by_material: AvgCorrectionByMaterial[];
  common_corrections: CommonCorrection[];
  deviation_trend: DeviationTrend;
  common_note_combinations: NoteCombination[];
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
  tuning_statistics: TuningStatistics;
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

export interface MaterialCostItem {
  material_id: string;
  material_name: string;
  material_type: string;
  purchase_price: number;
  length: number;
  loss_rate: number;
  supplier?: string;
  material_cost: number;
  loss_cost: number;
  subtotal: number;
}

export interface CostCalculationResult {
  material_ids: string[];
  material_costs: MaterialCostItem[];
  total_material_cost: number;
  total_loss_cost: number;
  labor_hours: number;
  labor_cost: number;
  labor_rate: number;
  overhead_rate: number;
  overhead_cost: number;
  total_cost: number;
  suggested_price: number;
  profit_margin: number;
  profit_rate: number;
}

export interface CostSnapshot {
  material_costs: MaterialCostItem[];
  total_material_cost: number;
  total_loss_cost: number;
  labor_hours: number;
  labor_cost: number;
  labor_rate: number;
  overhead_rate: number;
  overhead_cost: number;
  total_cost: number;
  suggested_price: number;
  profit_margin: number;
  profit_rate: number;
  calculated_at: string;
}

export interface CostCalculateRequest {
  material_ids: string[];
  labor_hours?: number;
  labor_rate?: number;
  overhead_rate?: number;
  profit_rate?: number;
}

export interface WindChimeWithCost extends WindChime {
  cost_snapshot: CostSnapshot | null;
}

export interface MaterialCostByType {
  material_type: string;
  total_cost: number;
  count: number;
  percentage: number;
}

export interface ChimeProfitRankItem {
  chime_id: string;
  chime_name: string;
  total_cost: number;
  suggested_price: number;
  profit_margin: number;
  profit_rate: number;
  material_count: number;
  created_at: string;
}

export interface SupplierUsageItem {
  supplier: string;
  material_count: number;
  total_cost: number;
  used_count: number;
  material_types: string[];
}

export interface HighLossMaterialItem {
  material_id: string;
  material_name: string;
  material_type: string;
  loss_rate: number;
  purchase_price: number;
  supplier?: string;
  stock_quantity: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface CostStatistics {
  cost_by_material_type: MaterialCostByType[];
  profit_ranking: ChimeProfitRankItem[];
  supplier_usage: SupplierUsageItem[];
  high_loss_materials: HighLossMaterialItem[];
  total_inventory_value: number;
  avg_profit_rate: number;
}

export interface CreateChimeWithCostData extends CreateChimeData {
  cost_snapshot?: CostSnapshot;
}

export interface UpdateChimeWithCostData extends UpdateChimeData {
  cost_snapshot?: CostSnapshot;
}

export type WorkOrderStatus =
  | 'pending_material'
  | 'in_production'
  | 'pending_tuning'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export type WorkOrderStage =
  | 'material_prep'
  | 'production'
  | 'tuning'
  | 'packaging';

export interface WorkOrderStageCompletion {
  completed: boolean;
  completed_at?: string;
}

export interface WorkOrder {
  id: string;
  chime_id: string;
  customer_name: string;
  delivery_date: string;
  priority: WorkOrderPriority;
  priority_display: string;
  status: WorkOrderStatus;
  status_display: string;
  remarks?: string;
  materials_snapshot: Material[];
  cost_snapshot: CostSnapshot | null;
  tuning_records_snapshot: TuningCorrection[];
  stages_completed: Record<WorkOrderStage, WorkOrderStageCompletion>;
  inventory_deducted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkOrderData {
  chime_id: string;
  customer_name: string;
  delivery_date: string;
  priority?: WorkOrderPriority;
  remarks?: string;
}

export interface UpdateWorkOrderData {
  customer_name?: string;
  delivery_date?: string;
  priority?: WorkOrderPriority;
  remarks?: string;
  status?: WorkOrderStatus;
}

export interface WorkOrderStatistics {
  total_orders: number;
  overdue_orders: number;
  overdue_orders_list: WorkOrder[];
  status_distribution: Record<WorkOrderStatus, number>;
  status_distribution_with_names: Record<string, number>;
  material_occupied: {
    by_material: Array<{
      material_id: string;
      material_name: string;
      material_type: string;
      quantity: number;
      total_value: number;
    }>;
    total_orders_with_deducted_inventory: number;
    total_occupied_value: number;
  };
  delivery_trend: Array<{
    date: string;
    delivered_count: number;
  }>;
}

export interface WindChimeWithWorkOrder extends WindChime {
  has_work_order: boolean;
  work_order_count: number;
  latest_work_order?: {
    id: string;
    status: WorkOrderStatus;
    status_display: string;
    priority: WorkOrderPriority;
    customer_name: string;
    delivery_date: string;
  };
}
