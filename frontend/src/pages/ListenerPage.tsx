import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Play, Save, Trash2, Sparkles, Plus } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ChimeTube from '../components/listener/ChimeTube';
import ChordInfoDisplay from '../components/listener/ChordInfoDisplay';
import TuningPanel from '../components/listener/TuningPanel';
import MaterialCard from '../components/materials/MaterialCard';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Tabs, TabPanel } from '../components/ui/Tabs';
import { useAppStore } from '../store/useAppStore';
import { ChordAnalysis } from '../types';

const ListenerPage = () => {
  const {
    materials,
    chimeTubes,
    chordAnalysis,
    currentChime,
    tuningCorrections,
    fetchMaterials,
    addTubeToChime,
    reorderTubes,
    analyzeChord,
    playChordSound,
    saveChime,
    clearChime,
    setTuningCorrection,
    removeTuningCorrection,
    clearTuningCorrections,
  } = useAppStore();

  const [isMaterialSelectorOpen, setIsMaterialSelectorOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [chimeName, setChimeName] = useState('');
  const [chimeDescription, setChimeDescription] = useState('');
  const [activeTab, setActiveTab] = useState('chord');

  useEffect(() => {
    if (currentChime) {
      setChimeName(currentChime.name);
      setChimeDescription(currentChime.description || '');
    }
  }, [currentChime]);

  const tabConfig = [
    { key: 'chord', label: '和弦分析' },
    {
      key: 'tuning',
      label: (
        <span className="flex items-center gap-1">
          调音实测
          {tuningCorrections.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full">
              {tuningCorrections.length}
            </span>
          )}
        </span>
      ),
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    if (chimeTubes.length >= 2) {
      analyzeChord();
    }
  }, [chimeTubes, analyzeChord]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chimeTubes.findIndex((t) => t.id === active.id);
      const newIndex = chimeTubes.findIndex((t) => t.id === over.id);
      const newOrder = arrayMove(chimeTubes, oldIndex, newIndex);
      reorderTubes(newOrder);
    }
  };

  const handleAddMaterial = (materialId: string) => {
    addTubeToChime(materialId);
    setIsMaterialSelectorOpen(false);
  };

  const handleSave = async () => {
    if (!chimeName.trim()) return;
    await saveChime(chimeName.trim(), chimeDescription.trim());
    setIsSaveModalOpen(false);
    setChimeName('');
    setChimeDescription('');
  };

  const handlePlayAll = () => {
    const frequencies = chimeTubes.map((m) => m.theoretical_pitch);
    const materialTypes = chimeTubes.map((m) => m.material_type);
    playChordSound(frequencies, materialTypes);
  };

  const availableMaterials = materials.filter(
    (m) => !chimeTubes.find((t) => t.id === m.id)
  );

  return (
    <PageContainer
      title="虚拟试听器"
      subtitle="拖拽组合管体，实时模拟和弦效果，调整悬挂顺序"
    >
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">风铃组装区</h3>
                  <p className="text-sm text-gray-500">
                    {chimeTubes.length} 根管体 · 拖拽调整顺序
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {chimeTubes.length >= 2 && (
                    <Button variant="outline" size="sm" onClick={handlePlayAll}>
                      <Play className="w-4 h-4 mr-1" />
                      播放和弦
                    </Button>
                  )}
                  {chimeTubes.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsSaveModalOpen(true)}>
                        <Save className="w-4 h-4 mr-1" />
                        {currentChime ? '更新作品' : '保存'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearChime} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 min-h-[400px] bg-gradient-to-b from-gray-50 to-white">
              <div className="w-full h-3 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-full mb-8 shadow-inner" />

              {chimeTubes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">还没有添加管体</p>
                  <Button onClick={() => setIsMaterialSelectorOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加管体
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={chimeTubes.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex items-end justify-center gap-6 px-16">
                      {chimeTubes.map((material, index) => (
                        <ChimeTube
                          key={material.id}
                          material={material}
                          index={index}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {chimeTubes.length > 0 && chimeTubes.length < 8 && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMaterialSelectorOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加更多管体
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Tabs
            tabs={tabConfig}
            defaultTab="chord"
            onTabChange={setActiveTab}
            className="w-full"
          >
            <TabPanel tabKey="chord" activeTab={activeTab}>
              <div className="space-y-6">
                <ChordInfoDisplay analysis={chordAnalysis as ChordAnalysis} />

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 设计提示</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>悬挂顺序会影响和弦的层次感</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>建议使用3-5根管体获得最佳和声效果</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>不同材质组合会产生独特的音色</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>协和度低于30%时音色最和谐</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabPanel>
            <TabPanel tabKey="tuning" activeTab={activeTab}>
              <TuningPanel
                materials={chimeTubes}
                tuningCorrections={tuningCorrections}
                onUpdateCorrection={setTuningCorrection}
                onRemoveCorrection={removeTuningCorrection}
                onClearAll={clearTuningCorrections}
              />
            </TabPanel>
          </Tabs>
        </div>
      </div>

      <Modal
        isOpen={isMaterialSelectorOpen}
        onClose={() => setIsMaterialSelectorOpen(false)}
        title="选择管体材料"
        size="lg"
      >
        {availableMaterials.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">没有可用的材料了</p>
            <p className="text-sm text-gray-400 mt-1">所有材料都已添加到风铃中</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {availableMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                showAddButton
                onAddToChime={() => handleAddMaterial(material.id)}
              />
            ))}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title={currentChime ? '更新风铃作品' : '保存风铃作品'}
      >
        <div className="space-y-4">
          <Input
            label="作品名称"
            placeholder="给这个风铃起个名字"
            value={chimeName}
            onChange={(e) => setChimeName(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作品描述 (可选)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
              rows={3}
              placeholder="记录一下设计灵感..."
              value={chimeDescription}
              onChange={(e) => setChimeDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!chimeName.trim()}>
              保存作品
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ListenerPage;
