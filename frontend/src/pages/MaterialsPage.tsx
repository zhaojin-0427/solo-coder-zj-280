import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import MaterialCard from '../components/materials/MaterialCard';
import MaterialFilter from '../components/materials/MaterialFilter';
import MaterialForm from '../components/materials/MaterialForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { useAppStore } from '../store/useAppStore';
import { Material, CreateMaterialData, UpdateMaterialData } from '../types';

const MaterialsPage = () => {
  const {
    materials,
    filteredMaterials,
    isLoading,
    fetchMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
  } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleAdd = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个材料吗？')) {
      await deleteMaterial(id);
    }
  };

  const handleSubmit = async (data: CreateMaterialData | UpdateMaterialData) => {
    if (editingMaterial) {
      await updateMaterial(editingMaterial.id, data);
    } else {
      await addMaterial(data);
    }
    setIsModalOpen(false);
    setEditingMaterial(null);
  };

  return (
    <PageContainer
      title="材料库"
      subtitle="管理您的管体材料收藏，记录材质、尺寸等参数"
      header={
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "'Noto Serif SC', serif" }}
            >
              材料库
            </h1>
            <p className="text-gray-500">
              共 {materials.length} 件材料 · {filteredMaterials.length} 件符合筛选条件
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            添加材料
          </Button>
        </div>
      }
    >
      <MaterialFilter />

      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-6xl mb-4">🔔</div>
          <p className="text-gray-500 mb-4">暂无材料</p>
          <Button onClick={handleAdd} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            添加第一个材料
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={() => handleEdit(material)}
              onDelete={() => handleDelete(material.id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMaterial(null);
        }}
        title={editingMaterial ? '编辑材料' : '添加新材料'}
      >
        <MaterialForm
          material={editingMaterial || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingMaterial(null);
          }}
          isLoading={isLoading}
        />
      </Modal>
    </PageContainer>
  );
};

export default MaterialsPage;
