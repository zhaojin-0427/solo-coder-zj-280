import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Flag,
  FileText,
  Package,
  DollarSign,
  Sliders,
  CheckCircle2,
  Circle,
  Trash2,
  AlertTriangle,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useAppStore } from '../store/useAppStore';
import { WorkOrderStage, WorkOrderStatus, WorkOrderPriority } from '../types';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { MATERIAL_TYPE_INFO } from '../types';

const STAGES: { key: WorkOrderStage; label: string; description: string }[] = [
  { key: 'material_prep', label: '备料完成', description: '所有管体材料已准备就绪' },
  { key: 'production', label: '制作完成', description: '管体切割、打磨等制作工序完成' },
  { key: 'tuning', label: '调音完成', description: '所有管体音高调校完成' },
  { key: 'packaging', label: '包装完成', description: '产品已包装完毕待交付' },
];

const STATUS_OPTIONS: { value: WorkOrderStatus; label: string; color: string }[] = [
  { value: 'pending_material', label: '待备料', color: 'text-amber-600' },
  { value: 'in_production', label: '制作中', color: 'text-blue-600' },
  { value: 'pending_tuning', label: '待调音', color: 'text-purple-600' },
  { value: 'completed', label: '已完成', color: 'text-emerald-600' },
  { value: 'delivered', label: '已交付', color: 'text-gray-600' },
  { value: 'cancelled', label: '已取消', color: 'text-red-600' },
];

const PRIORITY_OPTIONS: { value: WorkOrderPriority; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
];

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

const WorkOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentWorkOrder,
    workOrders,
    fetchWorkOrderById,
    updateWorkOrderStage,
    updateWorkOrder,
    updateWorkOrderStatus,
    deleteWorkOrder,
    workOrdersLoading,
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    customer_name: '',
    delivery_date: '',
    priority: 'medium' as WorkOrderPriority,
    remarks: '',
    status: 'pending_material' as WorkOrderStatus,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchWorkOrderById(id);
    }
  }, [id, fetchWorkOrderById]);

  useEffect(() => {
    if (currentWorkOrder) {
      setEditData({
        customer_name: currentWorkOrder.customer_name,
        delivery_date: currentWorkOrder.delivery_date.split('T')[0],
        priority: currentWorkOrder.priority,
        remarks: currentWorkOrder.remarks || '',
        status: currentWorkOrder.status,
      });
    }
  }, [currentWorkOrder]);

  const order = currentWorkOrder || workOrders.find((o) => o.id === id);

  const isOverdue = () => {
    if (!order) return false;
    if (order.status === 'delivered' || order.status === 'cancelled') return false;
    return new Date(order.delivery_date) < new Date();
  };

  const handleStageToggle = async (stage: WorkOrderStage, completed: boolean) => {
    if (!order) return;
    try {
      await updateWorkOrderStage(order.id, stage, completed);
    } catch (error: any) {
      alert(error.response?.data?.error || '更新失败');
    }
  };

  const handleSave = async () => {
    if (!order) return;
    try {
      const deliveryDateTime = new Date(editData.delivery_date);
      deliveryDateTime.setHours(18, 0, 0, 0);

      if (editData.status !== order.status) {
        await updateWorkOrderStatus(order.id, editData.status);
      }

      await updateWorkOrder(order.id, {
        customer_name: editData.customer_name,
        delivery_date: deliveryDateTime.toISOString(),
        priority: editData.priority,
        remarks: editData.remarks,
      });

      setIsEditing(false);
    } catch (error: any) {
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (window.confirm('确定要删除这个工单吗？')) {
      try {
        await deleteWorkOrder(order.id);
        navigate('/work-orders');
      } catch (error: any) {
        alert(error.response?.data?.error || '删除失败');
      }
    }
    setDeleteConfirm(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCompletedStagesCount = () => {
    if (!order) return 0;
    return Object.values(order.stages_completed || {}).filter((s) => s?.completed).length;
  };

  if (workOrdersLoading || !order) {
    return (
      <PageContainer title="工单详情" subtitle="">
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </PageContainer>
    );
  }

  const overdue = isOverdue();
  const completedStages = getCompletedStagesCount();
  const allStagesCompleted = completedStages === 4;

  return (
    <PageContainer title="工单详情" subtitle="">
      <div className="mb-6">
        <Link
          to="/work-orders"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回工单看板
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border',
                    STATUS_COLORS[order.status]
                  )}>
                    {order.status_display}
                  </span>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    PRIORITY_COLORS[order.priority]
                  )}>
                    {order.priority_display} 优先级
                  </span>
                  {overdue && (
                    <span className="flex items-center gap-1 text-sm text-red-500 font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      已逾期
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {order.customer_name}
                </h1>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => setDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">客户名称</label>
                {isEditing ? (
                  <Input
                    value={editData.customer_name}
                    onChange={(e) => setEditData({ ...editData, customer_name: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{order.customer_name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">交付日期</label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editData.delivery_date}
                    onChange={(e) => setEditData({ ...editData, delivery_date: e.target.value })}
                  />
                ) : (
                  <p className={cn(
                    'font-medium',
                    overdue ? 'text-red-600' : 'text-gray-900'
                  )}>
                    {formatDate(order.delivery_date)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">优先级</label>
                {isEditing ? (
                  <Select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as WorkOrderPriority })}
                    options={PRIORITY_OPTIONS}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{order.priority_display}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">当前状态</label>
                {isEditing ? (
                  <Select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value as WorkOrderStatus })}
                    options={STATUS_OPTIONS.map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    }))}
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{order.status_display}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">备注</label>
              {isEditing ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  rows={3}
                  value={editData.remarks}
                  onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                />
              ) : (
                <p className="text-gray-700">{order.remarks || '暂无备注'}</p>
              )}
            </div>

            {order.inventory_deducted && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  材料库存已扣减
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                阶段任务
              </h2>
              <span className="text-sm text-gray-500">
                {completedStages}/{STAGES.length} 已完成
              </span>
            </div>

            <div className="space-y-3">
              {STAGES.map((stage, index) => {
                const stageData = order.stages_completed?.[stage.key];
                const isCompleted = stageData?.completed || false;

                return (
                  <div
                    key={stage.key}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={cn(
                              'font-medium',
                              isCompleted ? 'text-emerald-700' : 'text-gray-900'
                            )}>
                              {index + 1}. {stage.label}
                            </h3>
                            <p className="text-sm text-gray-500">{stage.description}</p>
                            {stageData?.completed_at && (
                              <p className="text-xs text-gray-400 mt-1">
                                完成时间: {formatDateTime(stageData.completed_at)}
                              </p>
                            )}
                          </div>
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant={isCompleted ? 'ghost' : 'outline'}
                              onClick={() => handleStageToggle(stage.key, !isCompleted)}
                              className={cn(
                                isCompleted && 'text-emerald-600 hover:text-emerald-700'
                              )}
                            >
                              {isCompleted ? '取消完成' : '标记完成'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {allStagesCompleted && order.status === 'pending_tuning' && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <p className="text-emerald-700 font-medium">
                  🎉 所有阶段已完成！工单状态已自动更新为"已完成"
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              管体材料
              <span className="text-sm font-normal text-gray-500">
                ({order.materials_snapshot?.length || 0} 件)
              </span>
            </h2>
            <div className="space-y-3">
              {order.materials_snapshot?.map((material, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{material.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{
                      backgroundColor: `${MATERIAL_TYPE_INFO[material.material_type]?.color}20`,
                      color: MATERIAL_TYPE_INFO[material.material_type]?.color,
                    }}>
                      {MATERIAL_TYPE_INFO[material.material_type]?.display_name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>长度: {material.length}mm · 直径: {material.diameter}mm</p>
                    <p>音高: {material.theoretical_note} ({material.theoretical_pitch.toFixed(1)}Hz)</p>
                    <p className="text-gray-600 font-medium">¥{material.purchase_price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.cost_snapshot && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                成本报价
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">材料成本</span>
                  <span className="text-gray-900">¥{order.cost_snapshot.total_material_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">损耗成本</span>
                  <span className="text-gray-900">¥{order.cost_snapshot.total_loss_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">人工成本</span>
                  <span className="text-gray-900">¥{order.cost_snapshot.labor_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">管理费用</span>
                  <span className="text-gray-900">¥{order.cost_snapshot.overhead_cost.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">总成本</span>
                    <span className="text-gray-900 font-bold">¥{order.cost_snapshot.total_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">建议售价</span>
                    <span className="text-emerald-600 font-bold">¥{order.cost_snapshot.suggested_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500">毛利率</span>
                    <span className="text-emerald-600 font-medium">
                      {(order.cost_snapshot.profit_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {order.tuning_records_snapshot && order.tuning_records_snapshot.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                调音记录
                <span className="text-sm font-normal text-gray-500">
                  ({order.tuning_records_snapshot.length} 条)
                </span>
              </h2>
              <div className="space-y-2">
                {order.tuning_records_snapshot.map((record, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">
                        材料 #{index + 1}
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        Math.abs(record.correction_cents) > 10
                          ? 'bg-red-100 text-red-600'
                          : Math.abs(record.correction_cents) > 5
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-emerald-100 text-emerald-600'
                      )}>
                        {record.correction_cents > 0 ? '+' : ''}{record.correction_cents.toFixed(1)} 音分
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      理论: {record.theoretical_freq.toFixed(1)}Hz → 实际: {record.actual_freq.toFixed(1)}Hz
                    </div>
                    {record.recorded_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDateTime(record.recorded_at)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">工单信息</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">创建时间</span>
                <span className="text-gray-900">{formatDateTime(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">更新时间</span>
                <span className="text-gray-900">{formatDateTime(order.updated_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">工单编号</span>
                <span className="text-gray-400 font-mono text-xs">{order.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除这个工单吗？此操作不可撤销。如果工单已扣减库存，将自动恢复。
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(false)}>
                取消
              </Button>
              <Button variant="ghost" className="flex-1 text-red-500 hover:text-red-600 bg-red-50" onClick={handleDelete}>
                确认删除
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default WorkOrderDetailPage;
