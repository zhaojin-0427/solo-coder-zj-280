import { useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { RefreshCw, AlertTriangle, TrendingUp, DollarSign, Package, Building2, TrendingDown, ArrowUpRight } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';
import { MATERIAL_TYPE_INFO } from '../types';
import { commonChartOptions } from '../utils/chartUtils';
import { cn } from '../lib/utils';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CostStatisticsPage = () => {
  const {
    costStatistics,
    costStatisticsLoading,
    fetchCostStatistics,
  } = useAppStore();

  useEffect(() => {
    fetchCostStatistics();
  }, [fetchCostStatistics]);

  const pieChartData = {
    labels: costStatistics?.cost_by_material_type.map((d) => 
      MATERIAL_TYPE_INFO[d.material_type as keyof typeof MATERIAL_TYPE_INFO]?.display_name || d.material_type
    ) || [],
    datasets: [
      {
        label: '成本占比',
        data: costStatistics?.cost_by_material_type.map((d) => d.percentage) || [],
        backgroundColor: costStatistics?.cost_by_material_type.map((d) => 
          MATERIAL_TYPE_INFO[d.material_type as keyof typeof MATERIAL_TYPE_INFO]?.color || '#666'
        ) || [],
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 10,
        cutout: '60%',
      },
    ],
  };

  const pieChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: '材质成本占比',
        font: {
          family: "'Noto Serif SC', serif",
          size: 16,
          weight: 'bold' as const,
        },
        color: '#111827',
        padding: { bottom: 20 },
      },
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = costStatistics?.cost_by_material_type[context.dataIndex];
            if (!item) return '';
            const rawValue = context.raw as number;
            return `${context.label}: ${rawValue.toFixed(1)}% (¥${item.total_cost.toFixed(2)})`;
          }
        }
      }
    },
  };

  const barChartData = {
    labels: costStatistics?.profit_ranking.slice(0, 10).map((d) => d.chime_name) || [],
    datasets: [
      {
        label: '毛利率 (%)',
        data: costStatistics?.profit_ranking.slice(0, 10).map((d) => d.profit_rate * 100) || [],
        backgroundColor: costStatistics?.profit_ranking.slice(0, 10).map((d) => 
          d.profit_rate >= 0.6 ? 'rgba(16, 185, 129, 0.8)' :
          d.profit_rate >= 0.4 ? 'rgba(59, 130, 246, 0.8)' :
          d.profit_rate >= 0.2 ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ) || [],
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    ...commonChartOptions,
    indexAxis: 'y' as const,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: '作品毛利率排行 (Top 10)',
        font: {
          family: "'Noto Serif SC', serif",
          size: 16,
          weight: 'bold' as const,
        },
        color: '#111827',
        padding: { bottom: 20 },
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const item = costStatistics?.profit_ranking[context.dataIndex];
            if (!item) return '';
            const rawValue = context.raw as number;
            return [
              `毛利率: ${rawValue.toFixed(1)}%`,
              `成本: ¥${item.total_cost.toFixed(2)}`,
              `售价: ¥${item.suggested_price.toFixed(2)}`,
              `毛利: ¥${item.profit_margin.toFixed(2)}`,
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
      },
    },
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      default: return '低风险';
    }
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">报价统计分析</h1>
            <p className="text-gray-500 mt-1">全面了解材料成本、利润结构和损耗风险</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchCostStatistics}
            disabled={costStatisticsLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${costStatisticsLoading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">库存总价值</p>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{costStatistics?.total_inventory_value.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">平均毛利率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((costStatistics?.avg_profit_rate || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">供应商数量</p>
                <p className="text-2xl font-bold text-gray-900">
                  {costStatistics?.supplier_usage.length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">高损耗材料</p>
                <p className="text-2xl font-bold text-gray-900">
                  {costStatistics?.high_loss_materials.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <Doughnut data={pieChartData} options={pieChartOptions} />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                {costStatistics?.cost_by_material_type.map((item, index) => {
                  const info = MATERIAL_TYPE_INFO[item.material_type as keyof typeof MATERIAL_TYPE_INFO];
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: info?.color || '#666' }}
                        />
                        <span className="text-sm text-gray-700">{info?.display_name || item.material_type}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.percentage.toFixed(0)}%</p>
                        <p className="text-xs text-gray-500">¥{item.total_cost.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <Bar data={barChartData} options={barChartOptions} />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                  高利润 (≥60%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                  良好 (40-60%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                  一般 (20-40%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
                  低利润 (&lt;20%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900">供应商材料使用量</h3>
              </div>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">供应商</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">材料数</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">已使用</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">总成本</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {costStatistics?.supplier_usage.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.supplier || '未指定'}</p>
                          <div className="flex gap-1 mt-1">
                            {item.material_types.slice(0, 3).map((type, i) => {
                              const info = MATERIAL_TYPE_INFO[type as keyof typeof MATERIAL_TYPE_INFO];
                              return (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 text-[10px] rounded-full"
                                  style={{ backgroundColor: `${info?.color}20`, color: info?.color }}
                                >
                                  {info?.display_name || type}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{item.material_count}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-gray-900">{item.used_count}</span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({item.material_count > 0 ? ((item.used_count / item.material_count) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ¥{item.total_cost.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!costStatistics?.supplier_usage || costStatistics.supplier_usage.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>暂无供应商数据</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">高损耗材料预警</h3>
              </div>
              <span className="text-xs text-gray-500">损耗率 ≥ 5%</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {costStatistics?.high_loss_materials.map((item, index) => {
                const info = MATERIAL_TYPE_INFO[item.material_type as keyof typeof MATERIAL_TYPE_INFO];
                return (
                  <div key={index} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: info?.color || '#666' }}
                        >
                          {item.loss_rate.toFixed(0)}%
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.material_name}</p>
                          <p className="text-xs text-gray-500">
                            {info?.display_name || item.material_type}
                            {item.supplier && ` · ${item.supplier}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium border ${getRiskColor(item.risk_level)}`}>
                          {getRiskLabel(item.risk_level)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 ml-13">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>单价: ¥{item.purchase_price.toFixed(2)}</span>
                        <span>库存: {item.stock_quantity} 件</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        <span>潜在损失: ¥{(item.purchase_price * item.stock_quantity * item.loss_rate / 100).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-2 ml-13">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            item.risk_level === 'high' ? 'bg-red-500' :
                            item.risk_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          )}
                          style={{ width: `${Math.min(item.loss_rate * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!costStatistics?.high_loss_materials || costStatistics.high_loss_materials.length === 0) && (
                <div className="px-4 py-8 text-center text-gray-500">
                  <ArrowUpRight className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  <p>暂无高损耗材料</p>
                  <p className="text-xs mt-1">所有材料损耗率控制良好</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default CostStatisticsPage;
