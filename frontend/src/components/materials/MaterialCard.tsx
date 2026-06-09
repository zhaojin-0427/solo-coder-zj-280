import { Edit2, Trash2, Plus, Volume2 } from 'lucide-react';
import { Material } from '../../types';
import { getMaterialGradient, formatMaterialDimensions } from '../../utils/materialUtils';
import { getNoteColor } from '../../utils/pitchUtils';
import { MATERIAL_TYPE_INFO } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

interface MaterialCardProps {
  material: Material;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToChime?: () => void;
  showAddButton?: boolean;
  isSelected?: boolean;
  className?: string;
}

const MaterialCard = ({
  material,
  onEdit,
  onDelete,
  onAddToChime,
  showAddButton = false,
  isSelected = false,
  className,
}: MaterialCardProps) => {
  const { playSingleNote } = useAppStore();
  const materialInfo = MATERIAL_TYPE_INFO[material.material_type];

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSingleNote(material.theoretical_pitch, material.material_type);
  };

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden',
        'hover:shadow-lg hover:-translate-y-1',
        isSelected ? 'border-primary shadow-lg' : 'border-gray-100',
        className
      )}
    >
      <div
        className="h-24 relative"
        style={{ background: getMaterialGradient(material.material_type) }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-2xl mb-1 block">
              {material.material_type === 'aluminum' && '⚙️'}
              {material.material_type === 'copper' && '🔔'}
              {material.material_type === 'bamboo' && '🎋'}
              {material.material_type === 'glass' && '💎'}
            </span>
            <span className="text-white/80 text-xs font-medium">
              {materialInfo.display_name}
            </span>
          </div>
        </div>
        <button
          onClick={handlePlay}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          title="试听音高"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{material.name}</h3>
        <p className="text-xs text-gray-500 mb-3">{formatMaterialDimensions(material)}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getNoteColor(material.theoretical_note) }}
            />
            <span className="text-sm font-medium text-gray-700">
              {material.theoretical_note}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {material.theoretical_pitch.toFixed(1)} Hz
          </span>
        </div>

        {(material.purchase_price > 0 || material.supplier) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">采购单价</span>
              <span className="font-medium text-gray-900">¥{material.purchase_price.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">库存数量</span>
              <span className="font-medium text-gray-900">{material.stock_quantity} 件</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">损耗率</span>
              <span className={cn(
                'font-medium',
                material.loss_rate >= 10 ? 'text-red-600' :
                material.loss_rate >= 5 ? 'text-amber-600' : 'text-emerald-600'
              )}>
                {material.loss_rate.toFixed(1)}%
              </span>
            </div>
            {material.supplier && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">供应商</span>
                <span className="font-medium text-gray-700 truncate ml-2">{material.supplier}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {showAddButton && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onAddToChime}
            >
              <Plus className="w-4 h-4 mr-1" />
              添加
            </Button>
          )}
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;
