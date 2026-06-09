import { Music, Waves, Info } from 'lucide-react';
import { PitchResult } from '../../types';
import { getNoteColor } from '../../utils/pitchUtils';

interface PitchDisplayProps {
  result: PitchResult;
}

const PitchDisplay = ({ result }: PitchDisplayProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">音高分析结果</h3>
          <p className="text-sm text-gray-500">基于开管声学模型计算</p>
        </div>
        <div className="p-3 rounded-xl bg-primary/10">
          <Music className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
          style={{
            backgroundColor: `${getNoteColor(result.note)}20`,
            borderColor: getNoteColor(result.note),
            borderWidth: '3px',
          }}
        >
          <span
            className="text-4xl font-bold"
            style={{ color: getNoteColor(result.note) }}
          >
            {result.note}
          </span>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {result.frequency.toFixed(2)}
          <span className="text-lg text-gray-500 ml-1">Hz</span>
        </div>
        <p className="text-sm text-gray-500">MIDI 编号: {result.midi_number}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <Waves className="w-5 h-5 text-secondary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">基频波长</p>
            <p className="text-sm font-medium text-gray-900">{result.wavelength.toFixed(2)} m</p>
          </div>
        </div>

        <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-1">计算说明</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                使用开管声学公式 <code className="bg-white px-1.5 py-0.5 rounded text-xs">f = v / (2 × L × (1 + 0.8d))</code> 计算，
                其中 v=343m/s 为空气中声速，L 为管长，d 为直径，0.8d 为管口修正系数。
              </p>
            </div>
          </div>
        </div>
      </div>

      {result.overtones && result.overtones.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">泛音列</p>
          <div className="flex flex-wrap gap-2">
            {result.overtones.map((overtone, index) => (
              <div
                key={index}
                className="px-3 py-1.5 bg-gray-100 rounded-lg"
                style={{
                  opacity: 1 - index * 0.15,
                  transform: `scale(${1 - index * 0.08})`,
                }}
              >
                <span className="text-xs font-medium text-gray-700">
                  {overtone.note}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {overtone.frequency.toFixed(0)}Hz
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchDisplay;
