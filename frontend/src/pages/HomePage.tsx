import { Link } from 'react-router-dom';
import { Package, Calculator, Headphones, Archive, BarChart3, ChevronRight, Sparkles } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useAppStore } from '../store/useAppStore';
import { playWindChimeEffect } from '../utils/audioUtils';
import { MaterialType } from '../types';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: Package,
    title: '材料库',
    description: '管理您的管体材料收藏，记录材质、尺寸等参数',
    to: '/materials',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Calculator,
    title: '音高计算器',
    description: '基于物理公式精确计算理论音高，预览音色效果',
    to: '/calculator',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Headphones,
    title: '虚拟试听器',
    description: '拖拽组合管体，实时模拟和弦效果，调整悬挂顺序',
    to: '/listener',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Archive,
    title: '作品归档',
    description: '保存您的风铃设计方案，随时回顾和编辑',
    to: '/archive',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: BarChart3,
    title: '统计分析',
    description: '音域分布、热门和弦、材料利用率等数据洞察',
    to: '/statistics',
    color: 'from-rose-500 to-pink-600',
  },
];

const HomePage = () => {
  const { materials, chimes, fetchMaterials, fetchChimes, playWindEffect } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchChimes();
  }, [fetchMaterials, fetchChimes]);

  const handlePlayWind = () => {
    setIsPlaying(true);
    if (materials.length > 0) {
      playWindEffect();
    } else {
      const demoFreqs = [523.25, 659.25, 783.99, 1046.50];
      const demoTypes: MaterialType[] = ['copper', 'aluminum', 'bamboo', 'glass'];
      playWindChimeEffect(demoFreqs, demoTypes);
    }
    setTimeout(() => setIsPlaying(false), 5000);
  };

  return (
    <PageContainer>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary mb-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptLTYgMGg0djFoLTR2LTF6bTEyLTZoLTR2MWg0di0xem0tNiAwaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6bTEyLTZoLTR2MWg0di0xem0tNiAwaC00djFoNHYtMXptLTYgMGgtNHYxaDR2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              手作风铃材料管理与音色试听平台
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              匠心独运
              <br />
              <span className="text-accent">铃音</span>悠扬
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl leading-relaxed">
              录入管体材料，基于声学物理公式计算理论音高，
              拖拽组合设计专属风铃，实时预览和弦效果，
              记录每一次手作的美好。
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePlayWind}
                disabled={isPlaying}
                className="px-8 py-3.5 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {isPlaying ? '🎐 铃声飘扬中...' : '🎐 试听风铃'}
              </button>
              <Link
                to="/materials"
                className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                开始创作
              </Link>
            </div>
          </div>
        </div>

        <div className="relative bg-black/10 backdrop-blur-sm px-8 py-6 border-t border-white/10">
          <div className="grid grid-cols-3 gap-6 max-w-2xl">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{materials.length}</p>
              <p className="text-sm text-white/60">材料总数</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{chimes.length}</p>
              <p className="text-sm text-white/60">作品数量</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">4</p>
              <p className="text-sm text-white/60">材质类型</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-2xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              功能模块
            </h2>
            <p className="text-gray-500">探索平台的核心功能</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 mb-4 leading-relaxed">{feature.description}</p>
              <div className="flex items-center gap-1 text-primary font-medium text-sm">
                进入 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100">
        <div className="text-center max-w-2xl mx-auto">
          <h2
            className="text-2xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            科学与艺术的完美结合
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            基于开管声学公式精确计算音高，结合 Web Audio API 合成真实音色。
            支持铝、铜、竹、玻璃四种材质，每种材质都有独特的密度、声速和衰减特性，
            为您带来最真实的听觉体验。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['铝 · 明亮通透', '铜 · 浑厚悠长', '竹 · 自然清新', '玻璃 · 清脆悦耳'].map((text, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-white rounded-full text-sm text-gray-600 shadow-sm border border-gray-100"
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default HomePage;
