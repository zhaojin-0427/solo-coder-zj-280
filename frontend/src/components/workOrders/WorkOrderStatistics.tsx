import { useEffect } from 'react';
import {
  BarChart3,
  Clock,
  Package,
  TrendingUp,
  AlertTriangle,
  CircleDot,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { WorkOrderStatus } from '../../types';
import { cn } from '../../lib/utils';

const STATUS_ORDER: WorkOrderStatus[] = [
  'pending_material',
  'in_production',
  'pending_tuning',
  'completed',
  'delivered',
  'cancelled',
];

const STATUS_DISPLAY: Record<WorkOrderStatus, string> = {
  pending_material: '待备料',
  in_production: '制作中',
  pending_tuning: '待调音',
  completed: '已完成',
  delivered: '已交付',
  cancelled: '已取消',
};

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  pending_material: 'bg-amber-500',
  in_production: 'bg-blue-500',
  pending_tuning: 'bg-purple-500',
  completed: 'bg-emerald-500',
  delivered: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

const WorkOrderStatistics = () => {
  const { workOrderStatistics, workOrderStatisticsLoading, fetchWorkOrderStatistics } = useAppStore();

  useEffect(() => {
    fetchWorkOrderStatistics();
  }, [fetchWorkOrderStatistics]);

  if (workOrderStatisticsLoading || !workOrderStatistics) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { total_orders, overdue_orders, status_distribution, material_occupied, delivery_trend } = workOrderStatistics;

  const totalDeliveredLast30Days = delivery_trend.reduce((sum, day) => sum + day.delivered_count, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">工单统计</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CircleDot className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-blue-600 font-medium">总工单</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{total_orders}</p>
        </div>

        <div className={cn(
          'bg-gradient-to-br rounded-xl p-4',
          overdue_orders > 0 ? 'from-red-50 to-red-100' : 'from-gray-50 to-gray-100'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              overdue_orders > 0 ? 'bg-red-500/20' : 'bg-gray-500/20'
            )}>
              <AlertTriangle className={cn('w-4 h-4', overdue_orders > 0 ? 'text-red-600' : 'text-gray-600')} />
            </div>
            <span className={cn('text-xs font-medium', overdue_orders > 0 ? 'text-red-600' : 'text-gray-600')}>
              逾期工单
            </span>
          </div>
          <p className={cn('text-2xl font-bold', overdue_orders > 0 ? 'text-red-700' : 'text-gray-700')}>
            {overdue_orders}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-emerald-600 font-medium">材料占用</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            ¥{material_occupied.total_occupied_value.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600/70 mt-1">
            {material_occupied.total_orders_with_deducted_inventory} 个工单
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-purple-600 font-medium">近30天交付</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{totalDeliveredLast30Days}</p>
          <p className="text-xs text-purple-600/70 mt-1">单</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">各状态分布</h4>
        <div className="space-y-2">
          {STATUS_ORDER.map((status) => {
            const count = status_distribution[status] || 0;
            const percentage = total_orders > 0 ? (count / total_orders) * 100 : 0;

            return (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">{STATUS_DISPLAY[status]}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', STATUS_COLORS[status])}
                    style={{ width: `${percentage}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {count}
                  </span>
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">{percentage.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">近30天交付趋势</h4>
        <div className="flex items-end gap-0.5 h-24">
          {delivery_trend.slice(-14).map((day, index) => {
            const maxCount = Math.max(...delivery_trend.map((d) => d.delivered_count), 1);
            const height = maxCount > 0 ? (day.delivered_count / maxCount) * 100 : 0;
            const date = new Date(day.date);

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${date.getMonth() + 1}/${date.getDate()}: ${day.delivered_count} 单`}
              >
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-300 group-hover:from-primary/80 group-hover:to-primary/40"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-[10px] text-gray-400">
                  {index % 3 === 0 ? `${date.getMonth() + 1}/${date.getDate()}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderStatistics;
