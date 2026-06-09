import { Calendar, Music, Play, Edit2, Trash2, Download } from 'lucide-react';
import { WindChime, Material, MaterialType } from '../../types';
import { MATERIAL_TYPE_INFO } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import Button from '../ui/Button';
import { cn } from '../../lib/utils';

interface ChimeCardProps {
  chime: WindChime;
  onLoadToEditor: () => void;
  onDelete: () => void;
}

const ChimeCard = ({ chime, onLoadToEditor, onDelete }: ChimeCardProps) => {
  const { playChordSound, materials } = useAppStore();

  const getMaterialById = (id: string) => materials.find((m) => m.id === id);

  const getMaterials = () => {
    return chime.materials
      .map((m) => (typeof m === 'string' ? getMaterialById(m) : m))
      .filter((m): m is Material => m !== undefined);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mats = getMaterials();
    const frequencies = mats.map((m) => m.theoretical_pitch);
    const materialTypes = mats.map((m) => m.material_type);
    playChordSound(frequencies, materialTypes);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMaterialTypes = () => {
    const mats = getMaterials();
    const types = new Set(mats.map((m) => m.material_type));
    return Array.from(types);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 border-gray-100 overflow-hidden',
        'hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
      )}
    >
      <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {getMaterials().slice(0, 5).map((material, index) => (
            <div
              key={index}
              className="w-3 rounded-full bg-white/60"
              style={{ height: `${Math.min(material.length * 0.4, 80)}px` }}
            />
          ))}
          {getMaterials().length > 5 && (
            <div className="text-xs text-gray-500 ml-2">
              +{getMaterials().length - 5}
            </div>
          )}
        </div>

        <button
          onClick={handlePlay}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-primary hover:bg-white transition-colors shadow-md"
          title="播放和弦"
        >
          <Play className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{chime.name}</h3>
          {chime.chord_info && chime.chord_info.chord_names && chime.chord_info.chord_names.length > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium flex-shrink-0 ml-2">
              {chime.chord_info.chord_names[0]}
            </span>
          )}
        </div>

        {chime.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{chime.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(chime.created_at)}
          </div>
          <div className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            {getMaterials().length} 管
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {getMaterialTypes().map((type) => (
            <span
              key={type}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {MATERIAL_TYPE_INFO[type].display_name}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onLoadToEditor}
          >
            <Edit2 className="w-4 h-4 mr-1" />
            编辑
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChimeCard;
