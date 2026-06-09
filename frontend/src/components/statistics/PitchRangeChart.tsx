import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { MATERIAL_TYPE_INFO } from '../../types';
import { commonChartOptions } from '../../utils/chartUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PitchRangeChartProps {
  data: Array<{
    material_type: string;
    min_pitch: number;
    max_pitch: number;
    avg_pitch: number;
    count: number;
  }>;
}

const PitchRangeChart = ({ data }: PitchRangeChartProps) => {
  const chartData = {
    labels: data.map((d) => MATERIAL_TYPE_INFO[d.material_type as keyof typeof MATERIAL_TYPE_INFO]?.display_name || d.material_type),
    datasets: [
      {
        label: '最低音高 (Hz)',
        data: data.map((d) => d.min_pitch),
        backgroundColor: 'rgba(139, 105, 20, 0.6)',
        borderColor: '#8B6914',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: '平均音高 (Hz)',
        data: data.map((d) => d.avg_pitch),
        backgroundColor: 'rgba(45, 74, 62, 0.6)',
        borderColor: '#2D4A3E',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: '最高音高 (Hz)',
        data: data.map((d) => d.max_pitch),
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: '#F59E0B',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: '各材质音域分布',
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
    },
    scales: {
      ...commonChartOptions.scales,
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '频率 (Hz)',
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PitchRangeChart;
