import { Music, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { ChordAnalysis } from '../../types';
import { cn } from '../../lib/utils';

interface ChordInfoDisplayProps {
  analysis: ChordAnalysis | null;
}

const ChordInfoDisplay = ({ analysis }: ChordInfoDisplayProps) => {
  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Music className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">添加管体开始分析和弦</p>
          <p className="text-sm text-gray-400 mt-1">至少需要2个管体</p>
        </div>
      </div>
    );
  }

  const getDissonanceColor = (value: number) => {
    if (value < 0.3) return 'text-green-600 bg-green-50';
    if (value < 0.6) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getDissonanceLabel = (value: number) => {
    if (value < 0.3) return '协和';
    if (value < 0.6) return '中性';
    return '不协和';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">和弦分析</h3>
          <p className="text-sm text-gray-500">实时和声效果评估</p>
        </div>
        <div className="p-3 rounded-xl bg-secondary/10">
          <Sparkles className="w-6 h-6 text-secondary" />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs text-gray-500 mb-2">识别和弦</p>
        <div className="flex flex-wrap gap-2">
          {analysis.chord_names && analysis.chord_names.length > 0 ? (
            analysis.chord_names.map((name, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
              >
                {name}
              </span>
            ))
          ) : (
            <span className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm">
              未识别到标准和弦
            </span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-500">协和度</p>
          <span
            className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              getDissonanceColor(analysis.dissonance)
            )}
          >
            {getDissonanceLabel(analysis.dissonance)}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${analysis.dissonance * 100}%`,
              background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">协和</span>
          <span className="text-xs font-medium text-gray-700">
            {(analysis.dissonance * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-gray-400">不协和</span>
        </div>
      </div>

      {analysis.intervals && analysis.intervals.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2">音程关系</p>
          <div className="flex flex-wrap gap-2">
            {analysis.intervals.map((interval, index) => (
              <div
                key={index}
                className="px-2.5 py-1 bg-gray-50 rounded-lg text-xs"
              >
                <span className="text-gray-500">{interval.notes}</span>
                <span className="text-gray-700 font-medium ml-1">
                  {interval.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-gray-50 rounded-xl">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500 mb-1">组合音高</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.frequencies?.map((freq, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white rounded text-xs text-gray-700 font-mono"
                >
                  {freq.toFixed(0)}Hz
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChordInfoDisplay;
