import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { MATERIAL_TYPE_INFO } from '../../types';
import { commonChartOptions } from '../../utils/chartUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface UsageData {
  material_type: string;
  total_count: number;
  used_count: number;
  utilization_rate: number;
}

interface MaterialUsageChartProps {
  data: UsageData[];
}

const MaterialUsageChart = ({ data }: MaterialUsageChartProps) => {
  const chartData = {
    labels: data.map((d) => MATERIAL_TYPE_INFO[d.material_type as keyof typeof MATERIAL_TYPE_INFO]?.display_name || d.material_type),
    datasets: [
      {
        label: '使用率 (%)',
        data: data.map((d) => d.utilization_rate),
        backgroundColor: [
          'rgba(45, 74, 62, 0.7)',
          'rgba(139, 105, 20, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(6, 182, 212, 0.7)',
        ],
        borderColor: [
          '#2D4A3E',
          '#8B6914',
          '#F59E0B',
          '#06b6d4',
        ],
        borderWidth: 2,
        hoverOffset: 10,
        cutout: '60%',
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: '材料利用率',
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
          label: function(context) {
            const item = data[context.dataIndex];
            const rawValue = context.raw as number;
            return `${context.label}: ${rawValue.toFixed(1)}% (${item.used_count}/${item.total_count})`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <Doughnut data={chartData} options={options} />
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          {data.map((item, index) => {
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
                <span className="text-sm font-medium text-gray-900">
                  {item.utilization_rate.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MaterialUsageChart;
