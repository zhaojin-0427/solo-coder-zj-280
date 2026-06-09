import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { MaterialType, MATERIAL_TYPE_INFO } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const chartColors = {
  primary: '#2D4A3E',
  secondary: '#8B6914',
  accent: '#B87333',
  aluminum: '#C0C0C0',
  copper: '#B87333',
  bamboo: '#7BA05B',
  glass: '#87CEEB',
  background: '#FAF8F5',
  text: '#333333',
  grid: 'rgba(0, 0, 0, 0.1)',
};

export function getMaterialChartColor(type: string): string {
  return (MATERIAL_TYPE_INFO[type as MaterialType]?.color) || '#999999';
}

export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        font: {
          family: "'Noto Sans SC', sans-serif",
          size: 12,
        },
        color: chartColors.text,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(45, 74, 62, 0.95)',
      titleFont: {
        family: "'Noto Sans SC', sans-serif",
        size: 14,
        weight: 'bold' as const,
      },
      bodyFont: {
        family: "'Noto Sans SC', sans-serif",
        size: 12,
      },
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        color: chartColors.grid,
        drawBorder: false,
      },
      ticks: {
        font: {
          family: "'Noto Sans SC', sans-serif",
          size: 11,
        },
        color: chartColors.text,
      },
    },
    y: {
      grid: {
        color: chartColors.grid,
        drawBorder: false,
      },
      ticks: {
        font: {
          family: "'Noto Sans SC', sans-serif",
          size: 11,
        },
        color: chartColors.text,
      },
    },
  },
};

export function createSpectrumChartData(
  overtones: Array<{ harmonic: number; frequency: number; amplitude: number }>
) {
  return {
    labels: overtones.map((o) => `${o.harmonic}次泛音`),
    datasets: [
      {
        label: '振幅',
        data: overtones.map((o) => o.amplitude),
        backgroundColor: overtones.map((_, i) =>
          i === 0 ? 'rgba(45, 74, 62, 0.8)' : 'rgba(139, 105, 20, 0.6)'
        ),
        borderColor: overtones.map((_, i) =>
          i === 0 ? '#2D4A3E' : '#8B6914'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
}

export function createPitchRangeChartData(
  pitchRanges: Array<{
    material: string;
    min_freq: number;
    max_freq: number;
    min_note: string;
    max_note: string;
    count: number;
  }>
) {
  return {
    labels: pitchRanges.map((p) => MATERIAL_TYPE_INFO[p.material as MaterialType]?.display_name || p.material),
    datasets: [
      {
        label: '最低音',
        data: pitchRanges.map((p) => p.min_freq),
        backgroundColor: 'rgba(139, 105, 20, 0.8)',
        borderRadius: 4,
      },
      {
        label: '最高音',
        data: pitchRanges.map((p) => p.max_freq),
        backgroundColor: 'rgba(45, 74, 62, 0.8)',
        borderRadius: 4,
      },
    ],
  };
}

export function createMaterialUsageChartData(
  usageData: Array<{
    material_type: string;
    total_count: number;
    used_count: number;
    utilization_rate: number;
  }>
) {
  return {
    labels: usageData.map((u) => MATERIAL_TYPE_INFO[u.material_type as MaterialType]?.display_name || u.material_type),
    datasets: [
      {
        label: '已使用',
        data: usageData.map((u) => u.used_count),
        backgroundColor: 'rgba(45, 74, 62, 0.8)',
        borderRadius: 4,
      },
      {
        label: '未使用',
        data: usageData.map((u) => u.total_count - u.used_count),
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        borderRadius: 4,
      },
    ],
  };
}

export function createChordPopularityChartData(
  chordData: Array<{ chord_name: string; count: number; avg_dissonance: number }>
) {
  const topChords = chordData.slice(0, 8);
  return {
    labels: topChords.map((c) => c.chord_name),
    datasets: [
      {
        label: '使用次数',
        data: topChords.map((c) => c.count),
        backgroundColor: topChords.map(() =>
          `rgba(45, 74, 62, ${0.6 + Math.random() * 0.4})`
        ),
        borderRadius: 8,
      },
    ],
  };
}

export function createTuningTrendChartData(
  tuningData: Array<{
    material_type: string;
    avg_correction_cents: number;
    correction_count: number;
    trend: string;
  }>
) {
  return {
    labels: tuningData.map((t) => MATERIAL_TYPE_INFO[t.material_type as MaterialType]?.display_name || t.material_type),
    datasets: [
      {
        label: '平均修正量（音分）',
        data: tuningData.map((t) => t.avg_correction_cents),
        backgroundColor: tuningData.map((t) =>
          t.trend === 'positive'
            ? 'rgba(76, 175, 80, 0.8)'
            : t.trend === 'negative'
            ? 'rgba(244, 67, 54, 0.8)'
            : 'rgba(45, 74, 62, 0.8)'
        ),
        borderRadius: 4,
      },
    ],
  };
}

export function createMaterialBreakdownChartData(
  breakdown: Record<string, number>
) {
  const entries = Object.entries(breakdown);
  return {
    labels: entries.map(([type]) => MATERIAL_TYPE_INFO[type as MaterialType]?.display_name || type),
    datasets: [
      {
        data: entries.map(([, count]) => count),
        backgroundColor: entries.map(([type]) => getMaterialChartColor(type)),
        borderColor: '#FFFFFF',
        borderWidth: 2,
      },
    ],
  };
}
