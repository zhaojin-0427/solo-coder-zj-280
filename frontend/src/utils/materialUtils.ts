import { MaterialType, MATERIAL_TYPE_INFO, Material } from '../types';

export function getMaterialTypeInfo(type: MaterialType) {
  return MATERIAL_TYPE_INFO[type];
}

export function getMaterialGradient(type: MaterialType): string {
  const gradients: Record<MaterialType, string> = {
    aluminum: 'linear-gradient(135deg, #E8E8E8 0%, #A0A0A0 50%, #C0C0C0 100%)',
    copper: 'linear-gradient(135deg, #D4A574 0%, #B87333 50%, #8B4513 100%)',
    bamboo: 'linear-gradient(135deg, #9ACD32 0%, #7BA05B 50%, #556B2F 100%)',
    glass: 'linear-gradient(135deg, rgba(135,206,235,0.6) 0%, rgba(173,216,230,0.8) 50%, rgba(240,248,255,0.6) 100%)',
  };
  return gradients[type];
}

export function getMaterialIcon(type: MaterialType): string {
  const icons: Record<MaterialType, string> = {
    aluminum: '⚙️',
    copper: '🔔',
    bamboo: '🎋',
    glass: '💎',
  };
  return icons[type];
}

export function formatMaterialDimensions(material: Material): string {
  return `长${material.length}mm × 直径${material.diameter}mm × 壁厚${material.wall_thickness}mm`;
}

export function filterMaterials(
  materials: Material[],
  filter: {
    type: MaterialType | null;
    search: string;
    minPitch?: number;
    maxPitch?: number;
  }
): Material[] {
  return materials.filter((m) => {
    if (filter.type && m.material_type !== filter.type) return false;
    if (filter.search && !m.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.minPitch !== undefined && m.theoretical_pitch < filter.minPitch) return false;
    if (filter.maxPitch !== undefined && m.theoretical_pitch > filter.maxPitch) return false;
    return true;
  });
}

export function sortMaterials(
  materials: Material[],
  sortBy: 'name' | 'pitch' | 'length' | 'date',
  ascending: boolean = true
): Material[] {
  const sorted = [...materials].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'pitch':
        return a.theoretical_pitch - b.theoretical_pitch;
      case 'length':
        return a.length - b.length;
      case 'date':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default:
        return 0;
    }
  });
  return ascending ? sorted : sorted.reverse();
}
