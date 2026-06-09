import { useState, useEffect } from 'react';
import { Material, CreateMaterialData, UpdateMaterialData, MaterialType } from '../../types';
import { MATERIAL_TYPE_INFO } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { calculatorService } from '../../services/calculatorService';

interface MaterialFormProps {
  material?: Material;
  onSubmit: (data: CreateMaterialData | UpdateMaterialData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const MaterialForm = ({ material, onSubmit, onCancel, isLoading }: MaterialFormProps) => {
  const [formData, setFormData] = useState({
    material_type: (material?.material_type || 'copper') as MaterialType,
    name: material?.name || '',
    length: material?.length || 180,
    diameter: material?.diameter || 25,
    wall_thickness: material?.wall_thickness || 1.5,
  });
  const [previewPitch, setPreviewPitch] = useState<{ note: string; frequency: number } | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const calculatePreview = async () => {
      setCalculating(true);
      try {
        const result = await calculatorService.calculatePitch({
          material_type: formData.material_type,
          length: formData.length,
          diameter: formData.diameter,
          wall_thickness: formData.wall_thickness,
        });
        setPreviewPitch({ note: result.note, frequency: result.frequency });
      } catch (error) {
        console.error('Failed to calculate preview:', error);
      } finally {
        setCalculating(false);
      }
    };
    calculatePreview();
  }, [formData.material_type, formData.length, formData.diameter, formData.wall_thickness]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const materialOptions = Object.entries(MATERIAL_TYPE_INFO).map(([value, info]) => ({
    value,
    label: `${info.display_name} (密度: ${info.density} kg/m³)`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Select
            label="材质类型"
            value={formData.material_type}
            onChange={(e) => setFormData({ ...formData, material_type: e.target.value as MaterialType })}
            options={materialOptions}
            required
          />
        </div>
        <div className="col-span-2">
          <Input
            label="材料名称"
            placeholder="给这个管体起个名字"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Input
            label="长度 (mm)"
            type="number"
            min="10"
            max="1000"
            step="1"
            value={formData.length}
            onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <Input
            label="直径 (mm)"
            type="number"
            min="5"
            max="100"
            step="0.1"
            value={formData.diameter}
            onChange={(e) => setFormData({ ...formData, diameter: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="col-span-2">
          <Input
            label="壁厚 (mm)"
            type="number"
            min="0.1"
            max="20"
            step="0.1"
            value={formData.wall_thickness}
            onChange={(e) => setFormData({ ...formData, wall_thickness: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      {previewPitch && (
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <p className="text-sm text-gray-600 mb-2">理论音高预览</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">{previewPitch.note}</span>
            <span className="text-gray-500">{previewPitch.frequency.toFixed(2)} Hz</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          取消
        </Button>
        <Button type="submit" loading={isLoading || calculating}>
          {material ? '保存修改' : '添加材料'}
        </Button>
      </div>
    </form>
  );
};

export default MaterialForm;
