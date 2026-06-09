import { useState } from 'react';
import { X, Calendar, User, Flag, FileText, AlertCircle } from 'lucide-react';
import { WindChime, WorkOrderPriority, CreateWorkOrderData } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  chime: WindChime | null;
  onSuccess?: () => void;
}

const PRIORITY_OPTIONS: { value: WorkOrderPriority; label: string; color: string }[] = [
  { value: 'low', label: '低', color: 'text-gray-600' },
  { value: 'medium', label: '中', color: 'text-blue-600' },
  { value: 'high', label: '高', color: 'text-orange-600' },
  { value: 'urgent', label: '紧急', color: 'text-red-600' },
];

const CreateWorkOrderModal = ({ isOpen, onClose, chime, onSuccess }: CreateWorkOrderModalProps) => {
  const { createWorkOrder } = useAppStore();
  const [formData, setFormData] = useState<Omit<CreateWorkOrderData, 'chime_id'>>({
    customer_name: '',
    delivery_date: '',
    priority: 'medium',
    remarks: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDefaultDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chime) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const deliveryDateTime = new Date(formData.delivery_date);
      deliveryDateTime.setHours(18, 0, 0, 0);

      await createWorkOrder({
        chime_id: String(chime.id),
        customer_name: formData.customer_name,
        delivery_date: deliveryDateTime.toISOString(),
        priority: formData.priority,
        remarks: formData.remarks,
      });

      setFormData({
        customer_name: '',
        delivery_date: '',
        priority: 'medium',
        remarks: '',
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || '创建工单失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !chime) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="创建制作工单">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-primary/5 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-600">
            为作品 <span className="font-semibold text-primary">"{chime.name}"</span> 创建工单
          </p>
          <p className="text-xs text-gray-400 mt-1">
            共 {chime.materials.length} 件材料 · {chime.chord_info?.chord_name || '自定义和弦'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            客户名称 <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="请输入客户名称"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            交付日期 <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.delivery_date || getDefaultDeliveryDate()}
            onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Flag className="w-4 h-4 inline mr-1" />
            优先级
          </label>
          <Select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as WorkOrderPriority })}
            options={PRIORITY_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
          <div className="flex gap-2 mt-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <span
                key={opt.value}
                className={`text-xs px-2 py-0.5 rounded ${formData.priority === opt.value ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}
              >
                {opt.label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4 inline mr-1" />
            备注
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            rows={3}
            placeholder="请输入备注信息（可选）"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting || !formData.customer_name || !formData.delivery_date}
          >
            {isSubmitting ? '创建中...' : '创建工单'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkOrderModal;
