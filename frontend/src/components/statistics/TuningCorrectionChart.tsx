import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { commonChartOptions } from '../../utils/chartUtils';
import { cn } from '../../lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

interface TuningCorrectionChartProps {
  data: {
    avg_correction_by_material: Array<{
      material_type: string;
      avg_correction: number;
      count: number;
    }>;
    common_corrections: CorrectionRecord[];
  } | Array<any>;
}

const TuningCorrectionChart = ({ data }: TuningCorrectionChartProps) => {
  const normalizedData = Array.isArray(data)
    ? { avg_correction_by_material: [], common_corrections: [] }
    : data;

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
          afterLabel: function(context: any) {
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

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <Line data={chartData} options={options} />

      {normalizedData.common_corrections && normalizedData.common_corrections.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">高频修正记录</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {normalizedData.common_corrections.slice(0, 5).map((correction, index) => {
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
                    <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
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
                    <span className="text-xs text-gray-400">{correction.count}次</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TuningCorrectionChart;
