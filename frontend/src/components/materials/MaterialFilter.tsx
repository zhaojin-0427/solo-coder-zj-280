import { Search, SlidersHorizontal } from 'lucide-react';
import { MaterialType } from '../../types';
import { MATERIAL_TYPE_INFO } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import Input from '../ui/Input';
import { cn } from '../../lib/utils';

const MaterialFilter = () => {
  const { materialFilter, setMaterialFilter, materials } = useAppStore();

  const typeOptions: Array<{ value: MaterialType | null; label: string }> = [
    { value: null, label: '全部' },
    ...Object.entries(MATERIAL_TYPE_INFO).map(([value, info]) => ({
      value: value as MaterialType,
      label: info.display_name,
    })),
  ];

  const allPitches = materials.map((m) => m.theoretical_pitch);
  const minPitch = allPitches.length > 0 ? Math.min(...allPitches) : 0;
  const maxPitch = allPitches.length > 0 ? Math.max(...allPitches) : 2000;

  return (
    <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="搜索材料名称..."
              value={materialFilter.search}
              onChange={(e) => setMaterialFilter({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <SlidersHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {typeOptions.map((option) => (
            <button
              key={option.value || 'all'}
              onClick={() => setMaterialFilter({ type: option.value })}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0',
                materialFilter.type === option.value
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">音高范围: {minPitch.toFixed(0)} - {maxPitch.toFixed(0)} Hz</p>
        <input
          type="range"
          min={minPitch}
          max={maxPitch}
          value={materialFilter.pitchRange?.[1] || maxPitch}
          onChange={(e) =>
            setMaterialFilter({
              pitchRange: [minPitch, parseFloat(e.target.value)],
            })
          }
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
    </div>
  );
};

export default MaterialFilter;
