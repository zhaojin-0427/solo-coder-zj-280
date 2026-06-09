import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from 'chart.js';
import { TrendingUp, TrendingDown, Minus, Music } from 'lucide-react';
import { commonChartOptions } from '../../utils/chartUtils';
import { cn } from '../../lib/utils';
import { DeviationTrend, NoteCombination } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CorrectionRecord {
  material_type: string;
  original_note: string;
  corrected_note: string;
  frequency_diff: number;
  correction_cents: number;
  count: number;
}

interface AvgCorrectionByMaterial {
  material_type: string;
  avg_correction: number;
  count: number;
  trend?: 'positive' | 'negative' | 'stable';
}

interface TuningCorrectionChartProps {
  data: {
    avg_correction_by_material: AvgCorrectionByMaterial[];
    common_corrections: CorrectionRecord[];
    deviation_trend?: DeviationTrend;
    common_note_combinations?: NoteCombination[];
  } | Array<unknown>;
}

const TuningCorrectionChart = ({ data }: TuningCorrectionChartProps) => {
  const normalizedData = Array.isArray(data)
    ? { avg_correction_by_material: [], common_corrections: [], deviation_trend: undefined, common_note_combinations: [] }
    : data || { avg_correction_by_material: [], common_corrections: [], deviation_trend: undefined, common_note_combinations: [] };

  const chartData = {
    labels: normalizedData.avg_correction_by_material.map((d) => {
      const names: Record<string, string> = {
        aluminum: '铝',
        copper: '铜',
        bamboo: '竹',
        glass: '玻璃',
      };
      return names[d.material_type] || d.material_type;
    }),
    datasets: [
      {
        label: '平均修正量 (音分)',
        data: normalizedData.avg_correction_by_material.map((d) => d.avg_correction),
        borderColor: '#2D4A3E',
        backgroundColor: 'rgba(45, 74, 62, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2D4A3E',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: '各材质平均调音修正量',
        font: {
          family: "'Noto Serif SC', serif",
          size: 16,
          weight: 'bold' as const,
        },
        color: '#111827',
        padding: {
          bottom: 20,
        },
      },
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: TooltipItem<'line'>) {
            const item = normalizedData.avg_correction_by_material[context.dataIndex];
            return `修正次数: ${item.count} 次`;
          }
        }
      }
    },
    scales: {
      ...commonChartOptions.scales,
      y: {
        title: {
          display: true,
          text: '修正量 (音分)',
          color: '#6b7280',
        },
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
      },
    },
  };

  const trendChartData = normalizedData.deviation_trend ? {
    labels: ['偏高 (正偏差)', '稳定', '偏低 (负偏差)'],
    datasets: [
      {
        data: [
          normalizedData.deviation_trend.trend_percentage.positive,
          normalizedData.deviation_trend.trend_percentage.stable,
          normalizedData.deviation_trend.trend_percentage.negative,
        ],
        backgroundColor: ['#EF4444', '#10B981', '#3B82F6'],
        borderWidth: 0,
      },
    ],
  } : null;

  const trendChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: '正负偏差趋势',
        font: {
          family: "'Noto Serif SC', serif",
          size: 16,
          weight: 'bold' as const,
        },
        color: '#111827',
        padding: {
          bottom: 20,
        },
      },
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'doughnut'>) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
    cutout: '60%',
  };

  const getDeviationIcon = (deviation: string) => {
    switch (deviation) {
      case 'sharp':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'flat':
        return <TrendingDown className="w-3 h-3 text-blue-500" />;
      default:
        return <Minus className="w-3 h-3 text-emerald-500" />;
    }
  };

  const getDeviationLabel = (deviation: string) => {
    switch (deviation) {
      case 'sharp':
        return '偏高';
      case 'flat':
        return '偏低';
      default:
        return '稳定';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <Line data={chartData} options={options} />
        </div>

        {trendChartData && normalizedData.deviation_trend && normalizedData.deviation_trend.total_count > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <Doughnut data={trendChartData} options={trendChartOptions} />

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">偏高</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {normalizedData.deviation_trend.positive_count}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                  <Minus className="w-4 h-4" />
                  <span className="text-sm font-medium">稳定</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {normalizedData.deviation_trend.stable_count}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">偏低</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {normalizedData.deviation_trend.negative_count}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {normalizedData.common_corrections && normalizedData.common_corrections.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              高频修正记录
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {normalizedData.common_corrections.slice(0, 8).map((correction, index) => {
                const names: Record<string, string> = {
                  aluminum: '铝',
                  copper: '铜',
                  bamboo: '竹',
                  glass: '玻璃',
                };
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-400 w-6">#{index + 1}</span>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          {names[correction.material_type] || correction.material_type}
                        </span>
                        <span className="text-sm text-gray-500 mx-2">→</span>
                        <span className="text-sm">
                          <span className="line-through text-gray-400">{correction.original_note}</span>
                          <span className="mx-1">→</span>
                          <span className="font-medium text-primary">{correction.corrected_note}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          correction.correction_cents > 0 ? 'text-red-500' : 'text-green-500'
                        )}
                      >
                        {correction.correction_cents > 0 ? '+' : ''}
                        {correction.correction_cents.toFixed(0)}¢
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {correction.count}次
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {normalizedData.common_note_combinations && normalizedData.common_note_combinations.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              常见偏差音符组合
            </h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {normalizedData.common_note_combinations.map((combo, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">组合 #{index + 1}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {combo.count} 次出现
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {combo.notes.map((noteData, noteIndex) => (
                      <div
                        key={noteIndex}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200"
                      >
                        <span className="text-sm font-bold text-gray-800">{noteData.note}</span>
                        <div className="flex items-center gap-0.5">
                          {getDeviationIcon(noteData.deviation)}
                          <span className="text-xs text-gray-500">
                            {getDeviationLabel(noteData.deviation)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(!normalizedData.common_corrections || normalizedData.common_corrections.length === 0) &&
       (!normalizedData.deviation_trend || normalizedData.deviation_trend.total_count === 0) &&
       (!normalizedData.common_note_combinations || normalizedData.common_note_combinations.length === 0) && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">暂无调音统计数据</p>
          <p className="text-xs text-gray-400 mt-1">录入调音记录后，这里将展示详细的调音统计分析</p>
        </div>
      )}
    </div>
  );
};

export default TuningCorrectionChart;
