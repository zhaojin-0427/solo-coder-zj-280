import { Calendar, User, Clock, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../../types';
import { cn } from '../../lib/utils';

interface WorkOrderCardProps {
  order: WorkOrder;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, orderId: string) => void;
  isDragging?: boolean;
}

const STATUS_COLORS: Record<WorkOrderStatus, string> = {
  pending_material: 'bg-amber-100 text-amber-700 border-amber-200',
  in_production: 'bg-blue-100 text-blue-700 border-blue-200',
  pending_tuning: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delivered: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

const WorkOrderCard = ({ order, onClick, onDragStart, isDragging }: WorkOrderCardProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = () => {
    if (order.status === 'delivered' || order.status === 'cancelled') return false;
    return new Date(order.delivery_date) < new Date();
  };

  const getStagesProgress = () => {
    const stages = Object.values(order.stages_completed || {});
    const completed = stages.filter((s) => s?.completed).length;
    return { completed, total: 4, percentage: (completed / 4) * 100 };
  };

  const progress = getStagesProgress();
  const overdue = isOverdue();

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, order.id)}
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-4 cursor-pointer',
        'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        'active:cursor-grabbing',
        isDragging && 'opacity-50 scale-95',
        overdue && 'ring-2 ring-red-200'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-medium border',
            STATUS_COLORS[order.status]
          )}>
            {order.status_display}
          </span>
          <span className={cn(
            'px-2 py-0.5 rounded text-xs font-medium',
            PRIORITY_COLORS[order.priority]
          )}>
            {order.priority_display}
          </span>
        </div>
        {overdue && (
          <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
            <AlertTriangle className="w-3 h-3" />
            已逾期
          </span>
        )}
      </div>

      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
        {order.customer_name}
      </h4>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <User className="w-3 h-3" />
          <span className="line-clamp-1">{order.customer_name}</span>
        </div>
        <div className={cn(
          'flex items-center gap-2 text-xs',
          overdue ? 'text-red-500 font-medium' : 'text-gray-500'
        )}>
          <Calendar className="w-3 h-3" />
          <span>交付: {formatDate(order.delivery_date)}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            进度
          </span>
          <span>{progress.completed}/{progress.total}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Package className="w-3 h-3" />
        <span>{order.materials_snapshot?.length || 0} 件材料</span>
        {order.cost_snapshot && (
          <>
            <span>·</span>
            <span>¥{order.cost_snapshot.total_cost.toFixed(0)}</span>
          </>
        )}
      </div>

      {order.remarks && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-1 italic">
          "{order.remarks}"
        </p>
      )}
    </div>
  );
};

export default WorkOrderCard;
