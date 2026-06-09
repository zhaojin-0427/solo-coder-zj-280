import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Search, FolderOpen } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ChimeCard from '../components/archive/ChimeCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import CreateWorkOrderModal from '../components/workOrders/CreateWorkOrderModal';
import { useAppStore } from '../store/useAppStore';
import { WindChime, WindChimeWithWorkOrder } from '../types';

const ArchivePage = () => {
  const navigate = useNavigate();
  const {
    chimes,
    chimesWithWorkOrderStatus,
    isLoading,
    fetchChimes,
    fetchChimesWithWorkOrderStatus,
    deleteChime,
    loadChimeToEditor,
    fetchMaterials,
    chimesWithWorkOrderStatusLoading,
  } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChime, setSelectedChime] = useState<WindChime | null>(null);

  useEffect(() => {
    fetchChimesWithWorkOrderStatus();
  }, [fetchChimesWithWorkOrderStatus]);

  const displayChimes = chimesWithWorkOrderStatus.length > 0
    ? chimesWithWorkOrderStatus
    : chimes as WindChimeWithWorkOrder[];

  const filteredChimes = displayChimes.filter((chime) =>
    chime.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chime.description && chime.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: string | number) => {
    if (window.confirm('确定要删除这个作品吗？此操作不可撤销。')) {
      await deleteChime(String(id));
      fetchChimesWithWorkOrderStatus();
    }
  };

  const handleLoadToEditor = async (chime: WindChime) => {
    await fetchMaterials();
    loadChimeToEditor(chime);
    navigate('/listener');
  };

  const handleCreateWorkOrder = (chime: WindChime) => {
    setSelectedChime(chime);
    setShowCreateModal(true);
  };

  const handleViewWorkOrder = (chime: WindChimeWithWorkOrder) => {
    if (chime.latest_work_order) {
      navigate(`/work-orders/${chime.latest_work_order.id}`);
    }
  };

  return (
    <PageContainer
      title="作品归档"
      subtitle="保存和管理您的风铃设计方案，随时回顾和编辑"
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="搜索作品名称或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {(isLoading || chimesWithWorkOrderStatusLoading) ? (
        <div className="text-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : filteredChimes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Archive className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">
            {searchQuery ? '没有找到匹配的作品' : '暂无保存的作品'}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {searchQuery ? '尝试使用其他关键词搜索' : '在虚拟试听器中设计并保存您的第一个风铃'}
          </p>
          {!searchQuery && (
            <Button onClick={() => window.location.href = '/listener'}>
              <FolderOpen className="w-4 h-4 mr-2" />
              去设计风铃
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">
            共 {displayChimes.length} 个作品 · {filteredChimes.length} 个符合搜索条件
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChimes.map((chime) => (
              <ChimeCard
                key={chime.id}
                chime={chime}
                onLoadToEditor={() => handleLoadToEditor(chime)}
                onDelete={() => handleDelete(chime.id)}
                onCreateWorkOrder={() => handleCreateWorkOrder(chime)}
                onViewWorkOrder={() => handleViewWorkOrder(chime)}
              />
            ))}
          </div>
        </>
      )}

      <CreateWorkOrderModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedChime(null);
        }}
        chime={selectedChime}
        onSuccess={() => {
          fetchChimesWithWorkOrderStatus();
        }}
      />
    </PageContainer>
  );
};

export default ArchivePage;
