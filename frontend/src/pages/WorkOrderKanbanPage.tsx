import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Search,
  Calendar,
  Flag,
  Plus,
  Filter,
  GripVertical,
  AlertTriangle,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import WorkOrderCard from '../components/workOrders/WorkOrderCard';
import WorkOrderStatistics from '../components/workOrders/WorkOrderStatistics';
import CreateWorkOrderModal from '../components/workOrders/CreateWorkOrderModal';
import { useAppStore } from '../store/useAppStore';
import { WorkOrder, WorkOrderStatus, WorkOrderPriority } from '../types';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';

const KANBAN_COLUMNS: WorkOrderStatus[] = [
  'pending_material',
  'in_production',
  'pending_tuning',
  'completed',
  'delivered',
];

const COLUMN_TITLES: Record<WorkOrderStatus, string> = {
  pending_material: '待备料',
  in_production: '制作中',
  pending_tuning: '待调音',
  completed: '已完成',
  delivered: '已交付',
  cancelled: '已取消',
};

const COLUMN_COLORS: Record<WorkOrderStatus, string> = {
  pending_material: 'border-amber-300 bg-amber-50',
  in_production: 'border-blue-300 bg-blue-50',
  pending_tuning: 'border-purple-300 bg-purple-50',
  completed: 'border-emerald-300 bg-emerald-50',
  delivered: 'border-gray-300 bg-gray-50',
  cancelled: 'border-red-300 bg-red-50',
};

const WorkOrderKanbanPage = () => {
  const navigate = useNavigate();
  const {
    workOrders,
    workOrdersLoading,
    chimes,
    fetchWorkOrders,
    fetchChimes,
    updateWorkOrderStatus,
    workOrderFilter,
    setWorkOrderFilter,
  } = useAppStore();

  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<WorkOrderStatus | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChimeForOrder, setSelectedChimeForOrder] = useState<any>(null);
  const [showChimeSelector, setShowChimeSelector] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWorkOrders();
    fetchChimes();
  }, [fetchWorkOrders, fetchChimes]);

  const getOrdersByStatus = useCallback(
    (status: WorkOrderStatus) => {
      return workOrders.filter((order) => order.status === status);
    },
    [workOrders]
  );

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: WorkOrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: WorkOrderStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedOrderId) return;

    const order = workOrders.find((o) => o.id === draggedOrderId);
    if (!order) return;

    if (order.status === status) {
      setDraggedOrderId(null);
      return;
    }

    try {
      await updateWorkOrderStatus(draggedOrderId, status);
    } catch (error: any) {
      alert(error.response?.data?.error || '状态更新失败');
    } finally {
      setDraggedOrderId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/work-orders/${orderId}`);
  };

  const handleCreateFromChime = (chime: any) => {
    setSelectedChimeForOrder(chime);
    setShowChimeSelector(false);
    setShowCreateModal(true);
  };

  const availableChimes = chimes.filter((chime) => {
    const hasActiveOrder = workOrders.some(
      (o) =>
        o.chime_id === String(chime.id) &&
        o.status !== 'delivered' &&
        o.status !== 'cancelled'
    );
    return !hasActiveOrder;
  });

  const filteredOrders = workOrders.filter((order) => {
    if (workOrderFilter.search) {
      const searchLower = workOrderFilter.search.toLowerCase();
      if (
        !order.customer_name.toLowerCase().includes(searchLower) &&
        !(order.remarks?.toLowerCase().includes(searchLower))
      ) {
        return false;
      }
    }
    if (workOrderFilter.priority && order.priority !== workOrderFilter.priority) {
      return false;
    }
    return true;
  });

  const totalActiveOrders = workOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const overdueOrders = workOrders.filter((o) => {
    if (o.status === 'delivered' || o.status === 'cancelled') return false;
    return new Date(o.delivery_date) < new Date();
  });

  return (
    <PageContainer
      title="工单看板"
      subtitle="管理所有制作工单的进度，拖拽卡片可快速更新状态"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索客户名称或备注..."
                value={workOrderFilter.search || ''}
                onChange={(e) => setWorkOrderFilter({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && 'bg-primary/10 text-primary border-primary/30')}
              >
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
              <Button onClick={() => setShowChimeSelector(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建工单
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-4">
              <div className="w-48">
                <label className="block text-xs font-medium text-gray-600 mb-1">优先级</label>
                <Select
                  value={workOrderFilter.priority || ''}
                  onChange={(e) => setWorkOrderFilter({ priority: e.target.value || undefined })}
                  options={[
                    { value: '', label: '全部' },
                    { value: 'low', label: '低' },
                    { value: 'medium', label: '中' },
                    { value: 'high', label: '高' },
                    { value: 'urgent', label: '紧急' },
                  ]}
                />
              </div>
              <div className="w-48">
                <label className="block text-xs font-medium text-gray-600 mb-1">交付日期从</label>
                <Input
                  type="date"
                  value={workOrderFilter.delivery_date_from || ''}
                  onChange={(e) => setWorkOrderFilter({ delivery_date_from: e.target.value })}
                />
              </div>
              <div className="w-48">
                <label className="block text-xs font-medium text-gray-600 mb-1">交付日期至</label>
                <Input
                  type="date"
                  value={workOrderFilter.delivery_date_to || ''}
                  onChange={(e) => setWorkOrderFilter({ delivery_date_to: e.target.value })}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setWorkOrderFilter({
                    search: undefined,
                    priority: undefined,
                    delivery_date_from: undefined,
                    delivery_date_to: undefined,
                  })
                }
              >
                清除筛选
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <LayoutGrid className="w-4 h-4" />
              共 {totalActiveOrders} 个进行中工单
            </span>
            {overdueOrders.length > 0 && (
              <span className="flex items-center gap-1 text-red-500 font-medium">
                <AlertTriangle className="w-4 h-4" />
                {overdueOrders.length} 个已逾期
              </span>
            )}
          </div>

          {workOrdersLoading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">加载工单中...</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {KANBAN_COLUMNS.map((status) => {
                const orders = filteredOrders.filter((o) => o.status === status);

                return (
                  <div
                    key={status}
                    className={cn(
                      'flex-shrink-0 w-72 rounded-2xl border-2 p-4 transition-all duration-200',
                      COLUMN_COLORS[status],
                      dragOverColumn === status && 'ring-2 ring-primary ring-offset-2 scale-[1.02]'
                    )}
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        {COLUMN_TITLES[status]}
                        <span className="text-xs font-normal text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                          {orders.length}
                        </span>
                      </h3>
                      <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="space-y-3 min-h-[200px]">
                      {orders.map((order) => (
                        <WorkOrderCard
                          key={order.id}
                          order={order}
                          onClick={() => handleOrderClick(order.id)}
                          onDragStart={handleDragStart}
                          isDragging={draggedOrderId === order.id}
                        />
                      ))}
                      {orders.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          拖拽工单到这里
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:w-80">
          <WorkOrderStatistics />
        </div>
      </div>

      <Modal
        isOpen={showChimeSelector}
        onClose={() => setShowChimeSelector(false)}
        title="选择作品创建工单"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {availableChimes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              所有作品都已有进行中的工单
            </p>
          ) : (
            availableChimes.map((chime) => (
              <button
                key={chime.id}
                onClick={() => handleCreateFromChime(chime)}
                className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-primary">
                      {chime.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chime.materials.length} 件材料 · {chime.chord_info?.chord_name || '自定义'}
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>

      <CreateWorkOrderModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedChimeForOrder(null);
        }}
        chime={selectedChimeForOrder}
        onSuccess={() => fetchWorkOrders()}
      />
    </PageContainer>
  );
};

export default WorkOrderKanbanPage;
