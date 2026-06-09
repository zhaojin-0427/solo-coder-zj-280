import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Volume2 } from 'lucide-react';
import { Material } from '../../types';
import { getMaterialGradient } from '../../utils/materialUtils';
import { getNoteColor } from '../../utils/pitchUtils';
import { MATERIAL_TYPE_INFO } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

interface ChimeTubeProps {
  material: Material;
  index: number;
}

const ChimeTube = ({ material, index }: ChimeTubeProps) => {
  const { playSingleNote, removeTubeFromChime } = useAppStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: material.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: `${Math.min(material.length * 1.2, 280)}px`,
  };

  const tubeHeight = Math.min(material.length * 1.2, 280);
  const tubeWidth = Math.max(material.diameter * 1.2, 30);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <div className="flex flex-col items-center h-full">
        <div className="w-1 h-4 bg-gray-300" />
        <div className="w-3 h-3 rounded-full bg-gray-400 mb-1" />
        <div className="w-1 h-3 bg-gray-300" />

        <div
          className="relative flex flex-col items-center justify-center rounded-lg cursor-pointer transition-transform duration-200 hover:scale-105"
          style={{
            width: `${tubeWidth}px`,
            height: `${tubeHeight}px`,
            background: getMaterialGradient(material.material_type),
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.15)',
          }}
          onClick={() => playSingleNote(material.theoretical_pitch, material.material_type)}
        >
          <div
            className="absolute inset-x-0 top-0 h-1/3 rounded-t-lg"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}
          />

          <div className="text-center text-white z-10">
            <div
              className="text-xl font-bold mb-1"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
            >
              {material.theoretical_note}
            </div>
            <div className="text-xs opacity-80">
              {material.theoretical_pitch.toFixed(0)}Hz
            </div>
          </div>

          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/60 text-[10px] font-medium">
            #{index + 1}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playSingleNote(material.theoretical_pitch, material.material_type);
            }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 p-1.5 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Volume2 className="w-3 h-3 text-white" />
          </button>
        </div>

        <div className="mt-2 text-center">
          <p className="text-xs font-medium text-gray-700 truncate max-w-[80px]">
            {material.name}
          </p>
          <p className="text-[10px] text-gray-400">
            {MATERIAL_TYPE_INFO[material.material_type].display_name}
          </p>
        </div>

        <div
          {...attributes}
          {...listeners}
          className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-gray-100"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeTubeFromChime(material.id);
          }}
          className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-gray-400 hover:text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChimeTube;
