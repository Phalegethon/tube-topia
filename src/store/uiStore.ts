import { create } from 'zustand';

interface UIState {
  isChannelListVisible: boolean;
  toggleChannelListVisibility: () => void;
  // isFullScreen: boolean; // Kaldırıldı
  // toggleFullScreen: () => void; // Kaldırıldı
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  // Gelecekte başka UI durumları eklenebilir (örn. isSidebarOpen)
}

const useUIStore = create<UIState>((set) => ({
  isChannelListVisible: true, // Başlangıçta görünür
  toggleChannelListVisibility: () => set((state) => ({ isChannelListVisible: !state.isChannelListVisible })),
  // isFullScreen: false, // Kaldırıldı
  // toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })), // Kaldırıldı
  isSettingsModalOpen: false,
  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
}));

export default useUIStore; 