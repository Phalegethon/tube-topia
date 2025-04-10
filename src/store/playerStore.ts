import { create } from 'zustand';

// Olası YouTube kalite seviyeleri (daha fazlası eklenebilir)
type VideoQuality = 'auto' | 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres';

// Export the interface
export interface PlayerState {
  targetQuality: VideoQuality;
  setTargetQuality: (quality: VideoQuality) => void;
  isGloballyMuted: boolean;
  toggleGlobalMute: () => void;
  setGlobalMute: (muted: boolean) => void;
  isPlayingGlobally: boolean;
  toggleGlobalPlayPause: () => void;
}

const usePlayerStore = create<PlayerState>((set) => ({
  targetQuality: 'auto', // Başlangıçta otomatik kalite
  setTargetQuality: (quality) => set({ targetQuality: quality }),
  isGloballyMuted: false, // Başlangıçta ses açık
  toggleGlobalMute: () => set((state) => ({ isGloballyMuted: !state.isGloballyMuted })),
  setGlobalMute: (muted) => set({ isGloballyMuted: muted }),
  isPlayingGlobally: true,
  toggleGlobalPlayPause: () => set((state) => ({ isPlayingGlobally: !state.isPlayingGlobally })),
}));

export default usePlayerStore;
export type { VideoQuality }; 