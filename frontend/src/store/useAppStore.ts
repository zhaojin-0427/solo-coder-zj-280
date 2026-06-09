import { create } from 'zustand';
import {
  Material,
  WindChime,
  PitchResult,
  ChordAnalysis,
  CreateMaterialData,
  UpdateMaterialData,
  CreateChimeData,
  MaterialFilter,
  MaterialType,
  StatisticsData,
} from '../types';
import { materialService } from '../services/materialService';
import { calculatorService } from '../services/calculatorService';
import { chimeService } from '../services/chimeService';
import { statisticsService } from '../services/statisticsService';
import { playNote, playChord, playWindChimeEffect, resumeAudioContext } from '../utils/audioUtils';
import { filterMaterials } from '../utils/materialUtils';

interface AppState {
  materials: Material[];
  materialsLoading: boolean;
  selectedMaterial: Material | null;
  materialFilter: MaterialFilter;

  calculatorParams: {
    material_type: MaterialType;
    length: number;
    diameter: number;
    wall_thickness: number;
  };
  calculationResult: PitchResult | null;
  pitchResult: PitchResult | null;
  calculatorLoading: boolean;
  isCalculating: boolean;

  selectedTubes: Material[];
  chimeTubes: Material[];
  hangOrder: string[];
  isPlaying: boolean;
  chordAnalysis: ChordAnalysis | null;

  chimes: WindChime[];
  chimesLoading: boolean;
  currentChime: WindChime | null;

  statistics: StatisticsData;
  statisticsLoading: boolean;

  get isLoading(): boolean;
  get filteredMaterials(): Material[];

  fetchMaterials: () => Promise<void>;
  addMaterial: (data: CreateMaterialData | UpdateMaterialData) => Promise<void>;
  updateMaterial: (id: string, data: UpdateMaterialData) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  setMaterialFilter: (filter: Partial<MaterialFilter>) => void;
  selectMaterial: (material: Material | null) => void;

  setCalculatorParams: (params: Partial<AppState['calculatorParams']>) => void;
  calculatePitch: () => Promise<void>;
  playSingleNote: (frequency: number, materialType: MaterialType) => void;

  addTubeToChime: (materialOrId: Material | string) => void;
  removeTubeFromChime: (materialId: string) => void;
  setHangOrder: (order: string[]) => void;
  reorderTubes: (tubes: Material[] | number, toIndex?: number) => void;
  analyzeChord: () => Promise<void>;
  playChordSound: (frequencies?: number[], materialTypes?: MaterialType[]) => void;
  playWindEffect: () => void;
  clearChime: () => void;

  saveChime: (name: string, description?: string) => Promise<void>;
  fetchChimes: () => Promise<void>;
  loadChimeToEditor: (chime: WindChime) => void;
  deleteChime: (id: string) => Promise<void>;

  fetchStatistics: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  materials: [],
  materialsLoading: false,
  selectedMaterial: null,
  materialFilter: {
    type: null,
    pitchRange: null,
    search: '',
  },

  calculatorParams: {
    material_type: 'copper',
    length: 180,
    diameter: 25,
    wall_thickness: 1.5,
  },
  calculationResult: null,
  pitchResult: null,
  calculatorLoading: false,
  isCalculating: false,

  selectedTubes: [],
  chimeTubes: [],
  hangOrder: [],
  isPlaying: false,
  chordAnalysis: null,

  chimes: [],
  chimesLoading: false,
  currentChime: null,

  statistics: {
    pitch_range_by_material: [],
    chord_statistics: [],
    material_usage: [],
    tuning_statistics: {
      avg_correction_by_material: [],
      common_corrections: [],
    },
  },
  statisticsLoading: false,

  get isLoading() {
    return get().materialsLoading || get().calculatorLoading || get().chimesLoading || get().statisticsLoading;
  },

  get filteredMaterials() {
    const { materials, materialFilter } = get();
    return filterMaterials(materials, {
      type: materialFilter.type,
      search: materialFilter.search,
      minPitch: materialFilter.pitchRange?.[0],
      maxPitch: materialFilter.pitchRange?.[1],
    });
  },

  fetchMaterials: async () => {
    set({ materialsLoading: true });
    try {
      const response = await materialService.getAll();
      set({ materials: response.data });
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      set({ materialsLoading: false });
    }
  },

  addMaterial: async (data) => {
    try {
      const newMaterial = await materialService.create(data as CreateMaterialData);
      set((state) => ({
        materials: [newMaterial, ...state.materials],
      }));
    } catch (error) {
      console.error('Failed to add material:', error);
      throw error;
    }
  },

  updateMaterial: async (id, data) => {
    try {
      const updated = await materialService.update(id, data);
      set((state) => ({
        materials: state.materials.map((m) => (m.id === id ? updated : m)),
        selectedMaterial: state.selectedMaterial?.id === id ? updated : state.selectedMaterial,
      }));
    } catch (error) {
      console.error('Failed to update material:', error);
      throw error;
    }
  },

  deleteMaterial: async (id) => {
    try {
      await materialService.delete(id);
      set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
        selectedMaterial: state.selectedMaterial?.id === id ? null : state.selectedMaterial,
        selectedTubes: state.selectedTubes.filter((t) => t.id !== id),
        chimeTubes: state.chimeTubes.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete material:', error);
      throw error;
    }
  },

  setMaterialFilter: (filter) => {
    set((state) => ({
      materialFilter: { ...state.materialFilter, ...filter },
    }));
  },

  selectMaterial: (material) => {
    set({ selectedMaterial: material });
  },

  setCalculatorParams: (params) => {
    set((state) => ({
      calculatorParams: { ...state.calculatorParams, ...params },
    }));
  },

  calculatePitch: async () => {
    const { calculatorParams } = get();
    set({ calculatorLoading: true, isCalculating: true });
    try {
      const result = await calculatorService.calculatePitch(calculatorParams);
      set({ calculationResult: result, pitchResult: result });
    } catch (error) {
      console.error('Failed to calculate pitch:', error);
    } finally {
      set({ calculatorLoading: false, isCalculating: false });
    }
  },

  playSingleNote: (frequency, materialType) => {
    resumeAudioContext();
    playNote(frequency, materialType);
  },

  addTubeToChime: (materialOrId) => {
    set((state) => {
      let material: Material | undefined;
      if (typeof materialOrId === 'string') {
        material = state.materials.find((m) => m.id === materialOrId);
      } else {
        material = materialOrId;
      }
      if (!material || state.selectedTubes.find((t) => t.id === material.id)) {
        return state;
      }
      const newTubes = [...state.selectedTubes, material];
      return {
        selectedTubes: newTubes,
        chimeTubes: newTubes,
        hangOrder: newTubes.map((t) => t.id),
      };
    });
  },

  removeTubeFromChime: (materialId) => {
    set((state) => {
      const newTubes = state.selectedTubes.filter((t) => t.id !== materialId);
      return {
        selectedTubes: newTubes,
        chimeTubes: newTubes,
        hangOrder: newTubes.map((t) => t.id),
      };
    });
  },

  setHangOrder: (order) => {
    set({ hangOrder: order });
  },

  reorderTubes: (tubesOrFromIndex, toIndex) => {
    if (Array.isArray(tubesOrFromIndex)) {
      set({
        selectedTubes: tubesOrFromIndex,
        chimeTubes: tubesOrFromIndex,
        hangOrder: tubesOrFromIndex.map((t) => t.id),
      });
    } else if (typeof tubesOrFromIndex === 'number' && typeof toIndex === 'number') {
      set((state) => {
        const newTubes = [...state.selectedTubes];
        const [removed] = newTubes.splice(tubesOrFromIndex, 1);
        newTubes.splice(toIndex, 0, removed);
        return {
          selectedTubes: newTubes,
          chimeTubes: newTubes,
          hangOrder: newTubes.map((t) => t.id),
        };
      });
    }
  },

  analyzeChord: async () => {
    const { selectedTubes } = get();
    if (selectedTubes.length < 2) {
      set({ chordAnalysis: null });
      return;
    }
    try {
      const frequencies = selectedTubes.map((t) => t.theoretical_pitch);
      const analysis = await calculatorService.analyzeChord({ frequencies });
      set({ chordAnalysis: analysis as ChordAnalysis });
    } catch (error) {
      console.error('Failed to analyze chord:', error);
    }
  },

  playChordSound: (frequencies, materialTypes) => {
    const { selectedTubes } = get();
    if (selectedTubes.length === 0 && !frequencies) return;
    resumeAudioContext();
    const freqs = frequencies || selectedTubes.map((t) => t.theoretical_pitch);
    const types = materialTypes || selectedTubes.map((t) => t.material_type);
    playChord(freqs, types);
  },

  playWindEffect: () => {
    const { selectedTubes } = get();
    if (selectedTubes.length === 0) return;
    resumeAudioContext();
    const frequencies = selectedTubes.map((t) => t.theoretical_pitch);
    const materialTypes = selectedTubes.map((t) => t.material_type);
    playWindChimeEffect(frequencies, materialTypes);
  },

  clearChime: () => {
    set({
      selectedTubes: [],
      chimeTubes: [],
      hangOrder: [],
      chordAnalysis: null,
    });
  },

  saveChime: async (name, description = '') => {
    const { selectedTubes, hangOrder, chordAnalysis } = get();
    if (selectedTubes.length === 0) return;

    try {
      const chimeData: CreateChimeData = {
        name,
        description,
        materials: selectedTubes.map((t) => t.id),
        hang_order: hangOrder,
        chord_info: {
          chord_name: chordAnalysis?.chord_name || '自定义',
          frequencies: selectedTubes.map((t) => t.theoretical_pitch),
          notes: selectedTubes.map((t) => t.theoretical_note),
        },
      };
      const newChime = await chimeService.create(chimeData);
      set((state) => ({
        chimes: [newChime, ...state.chimes],
      }));
    } catch (error) {
      console.error('Failed to save chime:', error);
      throw error;
    }
  },

  fetchChimes: async () => {
    set({ chimesLoading: true });
    try {
      const response = await chimeService.getAll();
      set({ chimes: response.data });
    } catch (error) {
      console.error('Failed to fetch chimes:', error);
    } finally {
      set({ chimesLoading: false });
    }
  },

  loadChimeToEditor: (chime) => {
    const { materials } = get();
    const tubeMaterials = chime.materials
      .map((mat) => {
        if (typeof mat === 'string') {
          return materials.find((m) => m.id === mat);
        }
        return mat;
      })
      .filter((m): m is Material => m !== undefined);

    set({
      selectedTubes: tubeMaterials,
      chimeTubes: tubeMaterials,
      hangOrder: chime.hang_order as unknown as string[],
      currentChime: chime,
    });
  },

  deleteChime: async (id: string) => {
    try {
      await chimeService.delete(id);
      set((state) => ({
        chimes: state.chimes.filter((c) => String(c.id) !== id),
        currentChime: String(state.currentChime?.id) === id ? null : state.currentChime,
      }));
    } catch (error) {
      console.error('Failed to delete chime:', error);
      throw error;
    }
  },

  fetchStatistics: async () => {
    set({ statisticsLoading: true });
    try {
      const data = await statisticsService.getAll();
      set({ statistics: data });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      set({ statisticsLoading: false });
    }
  },
}));
