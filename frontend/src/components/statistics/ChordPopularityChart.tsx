import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { commonChartOptions } from '../../utils/chartUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChordData {
  chord_name: string;
  count: number;
}

interface ChordPopularityChartProps {
  data: ChordData[];
}

const ChordPopularityChart = ({ data }: ChordPopularityChartProps) => {
  const colors = [
    'rgba(45, 74, 62, 0.8)',
    'rgba(139, 105, 20, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(239, 68, 68, 0.8)',
  ];

  const chartData = {
    labels: data.map((d) => d.chord_name),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: colors.slice(0, data.length),
        borderColor: data.map((_, i) => colors[i % colors.length].replace('0.8', '1')),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: '热门和弦组合',
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
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} 次 (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default ChordPopularityChart;
