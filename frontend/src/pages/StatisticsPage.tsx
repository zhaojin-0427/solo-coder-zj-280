import { useEffect, useState } from 'react';
import {
  BarChart3,
  Package,
  Music,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import StatCard from '../components/statistics/StatCard';
import PitchRangeChart from '../components/statistics/PitchRangeChart';
import ChordPopularityChart from '../components/statistics/ChordPopularityChart';
import MaterialUsageChart from '../components/statistics/MaterialUsageChart';
import TuningCorrectionChart from '../components/statistics/TuningCorrectionChart';
import Button from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';

const StatisticsPage = () => {
  const {
    statistics,
    isLoading,
    fetchStatistics,
    materials,
    chimes,
    fetchMaterials,
    fetchChimes,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      fetchStatistics(),
      fetchMaterials(),
      fetchChimes(),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const avgMaterialsPerChime = chimes.length > 0
    ? (chimes.reduce((sum, c) => sum + c.materials.length, 0) / chimes.length).toFixed(1)
    : '0';

  return (
    <PageContainer
      title="统计分析"
      subtitle="音域分布、热门和弦、材料利用率等数据洞察"
      header={
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              统计分析
            </h1>
            <p className="text-gray-500">
              基于 {materials.length} 件材料和 {chimes.length} 个作品的数据分析
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing || isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">加载统计数据中...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="材料总数"
              value={materials.length}
              icon={Package}
              color="primary"
            />
            <StatCard
              title="作品数量"
              value={chimes.length}
              icon={Music}
              color="secondary"
            />
            <StatCard
              title="平均管体数"
              value={avgMaterialsPerChime}
              icon={BarChart3}
              color="accent"
            />
            <StatCard
              title="材质类型"
              value="4"
              icon={TrendingUp}
              color="success"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {statistics.pitch_range_by_material && statistics.pitch_range_by_material.length > 0 && (
              <PitchRangeChart data={statistics.pitch_range_by_material} />
            )}
            {statistics.chord_statistics && statistics.chord_statistics.length > 0 && (
              <ChordPopularityChart data={statistics.chord_statistics} />
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {statistics.material_usage && statistics.material_usage.length > 0 && (
              <MaterialUsageChart data={statistics.material_usage} />
            )}
            {statistics.tuning_statistics && (
              <TuningCorrectionChart data={statistics.tuning_statistics} />
            )}
          </div>

          {(!statistics.pitch_range_by_material || statistics.pitch_range_by_material.length === 0) &&
           (!statistics.chord_statistics || statistics.chord_statistics.length === 0) &&
           (!statistics.material_usage || statistics.material_usage.length === 0) && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">暂无统计数据</p>
              <p className="text-sm text-gray-400">
                添加材料和作品后，这里将展示详细的数据分析
              </p>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default StatisticsPage;
