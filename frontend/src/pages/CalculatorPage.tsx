import { useState, useEffect } from 'react';
import { Calculator, Play, Volume2 } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import PitchDisplay from '../components/calculator/PitchDisplay';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';
import { MaterialType, PitchResult } from '../types';
import { MATERIAL_TYPE_INFO } from '../types';

const CalculatorPage = () => {
  const { calculatorParams, setCalculatorParams, calculatePitch, pitchResult, playSingleNote, isCalculating } = useAppStore();
  const [localResult, setLocalResult] = useState<PitchResult | null>(null);

  useEffect(() => {
    if (pitchResult) {
      setLocalResult(pitchResult);
    }
  }, [pitchResult]);

  const handleCalculate = async () => {
    await calculatePitch();
  };

  const handlePlay = () => {
    if (localResult) {
      playSingleNote(localResult.frequency, calculatorParams.material_type);
    }
  };

  const materialOptions = Object.entries(MATERIAL_TYPE_INFO).map(([value, info]) => ({
    value,
    label: `${info.display_name} (声速: ${info.sound_velocity} m/s, 密度: ${info.density} kg/m³)`,
  }));

  const presetLengths = [
    { label: '短管 (120mm)', value: 120 },
    { label: '中短管 (150mm)', value: 150 },
    { label: '标准管 (180mm)', value: 180 },
    { label: '中长管 (220mm)', value: 220 },
    { label: '长管 (280mm)', value: 280 },
  ];

  return (
    <PageContainer
      title="音高计算器"
      subtitle="基于开管声学公式精确计算理论音高，支持实时音色预览"
    >
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">参数设置</h3>
                <p className="text-sm text-gray-500">输入管体物理参数</p>
              </div>
            </div>

            <div className="space-y-5">
              <Select
                label="材质类型"
                value={calculatorParams.material_type}
                onChange={(e) =>
                  setCalculatorParams({ material_type: e.target.value as MaterialType })
                }
                options={materialOptions}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  快速选择长度
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetLengths.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setCalculatorParams({ length: preset.value })}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        calculatorParams.length === preset.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="长度 (mm)"
                type="number"
                min="10"
                max="1000"
                step="1"
                value={calculatorParams.length}
                onChange={(e) =>
                  setCalculatorParams({ length: parseFloat(e.target.value) })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="直径 (mm)"
                  type="number"
                  min="5"
                  max="100"
                  step="0.1"
                  value={calculatorParams.diameter}
                  onChange={(e) =>
                    setCalculatorParams({ diameter: parseFloat(e.target.value) })
                  }
                />
                <Input
                  label="壁厚 (mm)"
                  type="number"
                  min="0.1"
                  max="20"
                  step="0.1"
                  value={calculatorParams.wall_thickness}
                  onChange={(e) =>
                    setCalculatorParams({ wall_thickness: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={handleCalculate}
                  loading={isCalculating}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  计算音高
                </Button>
                {localResult && (
                  <Button variant="outline" onClick={handlePlay}>
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/20">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">💡 声学原理</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              系统使用开管声学公式计算基频：
              <code className="block mt-2 p-2 bg-white rounded-lg text-xs font-mono">
                f = v / (2 × L × (1 + 0.8 × d/L))
              </code>
            </p>
            <ul className="mt-3 space-y-1 text-xs text-gray-500">
              <li>• v = 343 m/s (空气中声速)</li>
              <li>• L = 管长 (m)</li>
              <li>• d = 管径 (m)</li>
              <li>• 0.8d = 管口修正系数</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3">
          {localResult ? (
            <PitchDisplay result={localResult} />
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-full flex items-center justify-center">
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calculator className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">输入参数后点击计算</p>
                <p className="text-sm text-gray-400">查看详细的音高分析结果</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default CalculatorPage;
