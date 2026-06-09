import { RefreshCw, Calculator, DollarSign, TrendingUp, Clock, Package, AlertTriangle } from 'lucide-react';
import { CostCalculationResult } from '../../types';
import { MATERIAL_TYPE_INFO } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CostPanelProps {
  costCalculation: CostCalculationResult | null;
  isLoading: boolean;
  onRecalculate: () => void;
  onParamsChange: (params: {
    labor_hours?: number;
    labor_rate?: number;
    overhead_rate?: number;
    profit_rate?: number;
  }) => void;
  labor_hours?: number;
  labor_rate?: number;
  overhead_rate?: number;
  profit_rate?: number;
}

const CostPanel = ({
  costCalculation,
  isLoading,
  onRecalculate,
  onParamsChange,
  labor_hours,
  labor_rate = 50,
  overhead_rate = 0.3,
  profit_rate = 0.5,
}: CostPanelProps) => {
  if (!costCalculation) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-gray-900">成本计算</h4>
        </div>
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">添加管体后自动计算成本</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-white" />
            <h4 className="font-semibold text-white">成本与报价</h4>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/90 hover:text-white hover:bg-white/20"
            onClick={onRecalculate}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            重新计算
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">材料成本</p>
            <p className="text-lg font-bold text-gray-900">
              ¥{costCalculation.total_material_cost.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">损耗成本</p>
            <p className="text-lg font-bold text-amber-600">
              ¥{costCalculation.total_loss_cost.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">工时成本</p>
            <p className="text-lg font-bold text-blue-600">
              ¥{costCalculation.labor_cost.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-emerald-600 mb-1">总成本</p>
              <p className="text-2xl font-bold text-emerald-700">
                ¥{costCalculation.total_cost.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-teal-600 mb-1">建议售价</p>
              <p className="text-2xl font-bold text-teal-700">
                ¥{costCalculation.suggested_price.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">预估毛利</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-emerald-700 mr-3">
                ¥{costCalculation.profit_margin.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                {(costCalculation.profit_rate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-3">材料明细</h5>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {costCalculation.material_costs.map((item, index) => (
              <div
                key={item.material_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: MATERIAL_TYPE_INFO[item.material_type as keyof typeof MATERIAL_TYPE_INFO]?.color || '#666' }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                    <p className="text-xs text-gray-500">
                      {item.supplier} · 损耗 {item.loss_rate}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">¥{item.subtotal.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    材料 ¥{item.material_cost.toFixed(2)} · 损耗 ¥{item.loss_cost.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">成本参数</h5>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="工时 (小时)"
                type="number"
                min="0"
                step="0.1"
                value={labor_hours ?? costCalculation.labor_hours}
                onChange={(e) => onParamsChange({ labor_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Input
                label="工时费率 (元/小时)"
                type="number"
                min="0"
                step="1"
                value={labor_rate ?? costCalculation.labor_rate}
                onChange={(e) => onParamsChange({ labor_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Input
                label="管理费率 (%)"
                type="number"
                min="0"
                max="100"
                step="1"
                value={(overhead_rate ?? costCalculation.overhead_rate) * 100}
                onChange={(e) => onParamsChange({ overhead_rate: (parseFloat(e.target.value) || 0) / 100 })}
              />
            </div>
            <div>
              <Input
                label="期望利润率 (%)"
                type="number"
                min="0"
                max="100"
                step="1"
                value={(profit_rate ?? costCalculation.profit_rate) * 100}
                onChange={(e) => onParamsChange({ profit_rate: (parseFloat(e.target.value) || 0) / 100 })}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
          <p className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            总成本 = 材料成本 + 损耗成本 + 工时成本 + 管理费
          </p>
          <p className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            建议售价 = 总成本 × (1 + 利润率)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CostPanel;
