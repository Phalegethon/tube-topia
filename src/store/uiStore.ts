import { create } from 'zustand';

interface UIState {
  isChannelListVisible: boolean;
  toggleChannelListVisibility: () => void;
  // isFullScreen: boolean; // Kaldırıldı
  // toggleFullScreen: () => void; // Kaldırıldı
}

const useUIStore = create<UIState>((set) => ({
  isChannelListVisible: true, // Başlangıçta görünür
  toggleChannelListVisibility: () => set((state) => ({ isChannelListVisible: !state.isChannelListVisible })),
  // isFullScreen: false, // Kaldırıldı
  // toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })), // Kaldırıldı
}));

export default useUIStore; 