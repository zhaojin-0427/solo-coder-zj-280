import { useState, useMemo } from 'react';
import { Sliders, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Material, TuningCorrection } from '../../types';
import { MATERIAL_TYPE_INFO } from '../../types';
import { calculateCentsBetween, getTuningStatus } from '../../utils/pitchUtils';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

interface TuningPanelProps {
  materials: Material[];
  tuningCorrections: TuningCorrection[];
  onUpdateCorrection: (correction: TuningCorrection) => void;
  onRemoveCorrection: (materialId: string) => void;
  onClearAll: () => void;
}

const TuningPanel = ({
  materials,
  tuningCorrections,
  onUpdateCorrection,
  onRemoveCorrection,
  onClearAll,
}: TuningPanelProps) => {
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const getCorrectionForMaterial = (materialId: string) => {
    return tuningCorrections.find((c) => c.material_id === materialId);
  };

  const handleActualFreqChange = (material: Material, value: string) => {
    setInputValues((prev) => ({ ...prev, [material.id]: value }));
    const actualFreq = parseFloat(value);

    if (!isNaN(actualFreq) && actualFreq > 0) {
      const correctionCents = calculateCentsBetween(material.theoretical_pitch, actualFreq);
      const correction: TuningCorrection = {
        material_id: material.id,
        theoretical_freq: material.theoretical_pitch,
        actual_freq: actualFreq,
        correction_cents: parseFloat(correctionCents.toFixed(2)),
      };
      onUpdateCorrection(correction);
    }
  };

  const handleQuickSet = (material: Material, offsetCents: number) => {
    const actualFreq = material.theoretical_pitch * Math.pow(2, offsetCents / 1200);
    const actualFreqStr = actualFreq.toFixed(2);
    setInputValues((prev) => ({ ...prev, [material.id]: actualFreqStr }));

    const correction: TuningCorrection = {
      material_id: material.id,
      theoretical_freq: material.theoretical_pitch,
      actual_freq: parseFloat(actualFreqStr),
      correction_cents: offsetCents,
    };
    onUpdateCorrection(correction);
  };

  const stats = useMemo(() => {
    const total = materials.length;
    const measured = tuningCorrections.length;
    const okCount = tuningCorrections.filter((c) => getTuningStatus(c.correction_cents).status === 'ok').length;
    const warningCount = tuningCorrections.filter((c) => getTuningStatus(c.correction_cents).status === 'warning').length;
    const errorCount = tuningCorrections.filter((c) => getTuningStatus(c.correction_cents).status === 'error').length;

    return { total, measured, okCount, warningCount, errorCount };
  }, [materials, tuningCorrections]);

  const StatusIcon = ({ status }: { status: 'ok' | 'warning' | 'error' }) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">调音实测</h3>
              <p className="text-sm text-gray-500">录入实际频率，系统自动计算音分偏差</p>
            </div>
          </div>
          {tuningCorrections.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-gray-500">
              清除全部
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-white/60 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.measured}/{stats.total}</div>
            <div className="text-xs text-gray-500">已测量</div>
          </div>
          <div className="bg-emerald-50/80 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.okCount}</div>
            <div className="text-xs text-gray-500">无需调整</div>
          </div>
          <div className="bg-amber-50/80 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.warningCount}</div>
            <div className="text-xs text-gray-500">建议微调</div>
          </div>
          <div className="bg-red-50/80 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
            <div className="text-xs text-gray-500">偏差较大</div>
          </div>
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto">
        {materials.length === 0 ? (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">请先添加管体到风铃中</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((material, index) => {
              const correction = getCorrectionForMaterial(material.id);
              const isActive = activeMaterialId === material.id;
              const tuningInfo = correction
                ? getTuningStatus(correction.correction_cents)
                : null;

              return (
                <div
                  key={material.id}
                  className={cn(
                    'border-2 rounded-xl p-4 transition-all cursor-pointer',
                    isActive ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-100 hover:border-gray-200 bg-white',
                    correction && tuningInfo?.status === 'ok' && 'border-l-emerald-500',
                    correction && tuningInfo?.status === 'warning' && 'border-l-amber-500',
                    correction && tuningInfo?.status === 'error' && 'border-l-red-500'
                  )}
                  onClick={() => setActiveMaterialId(isActive ? null : material.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: MATERIAL_TYPE_INFO[material.material_type].color }}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{material.name}</div>
                        <div className="text-xs text-gray-400">
                          {MATERIAL_TYPE_INFO[material.material_type].display_name} · {material.theoretical_note} · {material.theoretical_pitch.toFixed(1)}Hz
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {correction && tuningInfo && (
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={tuningInfo.status} />
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${tuningInfo.color}15`, color: tuningInfo.color }}
                          >
                            {tuningInfo.label}
                          </span>
                        </div>
                      )}
                      {!correction && (
                        <span className="text-xs text-gray-400">未测量</span>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            理论频率
                          </label>
                          <div className="text-lg font-semibold text-gray-700">
                            {material.theoretical_pitch.toFixed(2)} <span className="text-sm font-normal text-gray-400">Hz</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            理论音高
                          </label>
                          <div className="text-lg font-semibold text-gray-700">
                            {material.theoretical_note}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          实测频率 (Hz)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="输入实际测得的频率值"
                          value={inputValues[material.id] || correction?.actual_freq?.toString() || ''}
                          onChange={(e) => handleActualFreqChange(material, e.target.value)}
                          className="text-center text-lg font-mono"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs text-gray-400">快捷设置：</span>
                        {[-10, -5, 0, 5, 10].map((cents) => (
                          <button
                            key={cents}
                            onClick={() => handleQuickSet(material, cents)}
                            className={cn(
                              'px-2 py-1 text-xs rounded-lg border transition-colors',
                              correction?.correction_cents === cents
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                            )}
                          >
                            {cents > 0 ? '+' : ''}{cents}¢
                          </button>
                        ))}
                      </div>

                      {correction && (
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">音分偏差</span>
                            <span
                              className="text-lg font-bold font-mono"
                              style={{ color: tuningInfo?.color }}
                            >
                              {correction.correction_cents > 0 ? '+' : ''}
                              {correction.correction_cents.toFixed(2)} ¢
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">频率偏差</span>
                            <span className="text-sm font-medium text-gray-700">
                              {correction.actual_freq > correction.theoretical_freq ? '+' : ''}
                              {(correction.actual_freq - correction.theoretical_freq).toFixed(2)} Hz
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(Math.abs(correction.correction_cents) / 30 * 100, 100)}%`,
                                backgroundColor: tuningInfo?.color,
                                marginLeft: correction.correction_cents < 0 ? 'auto' : '50%',
                                transform: correction.correction_cents < 0 ? 'scaleX(-1)' : 'none',
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>-30¢</span>
                            <span>0¢</span>
                            <span>+30¢</span>
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onRemoveCorrection(material.id);
                                setInputValues((prev) => {
                                  const next = { ...prev };
                                  delete next[material.id];
                                  return next;
                                });
                              }}
                              className="text-red-500 text-xs"
                            >
                              清除此条记录
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TuningPanel;
