import { create } from 'zustand';
import axios from 'axios';
import useChannelStore, { ChannelType } from './channelStore';
import useGridStore from './gridStore';
import useApiKeyStore from './apiKeyStore';

// YouTube API Arama Sonucu Tipi (Basitleştirilmiş)
// Export SearchResultItem if needed elsewhere
export interface SearchResultItem {
  id: string; // Video ID, Playlist ID, Channel ID
  title: string;
  thumbnail: string;
  kind: 'youtube#video' | 'youtube#playlist' | 'youtube#channel';
}

// Export the SearchState interface
export interface SearchState {
  results: SearchResultItem[];
  isLoading: boolean;
  error: string | null;
  currentSearchTerm: string; // Hangi terimle arama yapıldığını tut
  setSearchTerm: (term: string) => void;
  fetchResults: (term: string) => Promise<void>;
  clearResults: () => void;
  assignResultToGrid: (item: SearchResultItem) => Promise<void>; // Sonucu grid'e ata
}

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

const useSearchStore = create<SearchState>((set, get) => ({
  results: [],
  isLoading: false,
  error: null,
  currentSearchTerm: '',

  setSearchTerm: (term) => set({ currentSearchTerm: term }),

  fetchResults: async (term) => {
    if (!term.trim()) {
      get().clearResults();
      return;
    }
    const apiKey = useApiKeyStore.getState().apiKey;
    if (!apiKey) {
      set({ isLoading: false, error: 'YouTube API Key is not set in the sidebar.', results: [], currentSearchTerm: term });
      console.error('YouTube API Key is not set.');
      return;
    }
    set({ isLoading: true, error: null, currentSearchTerm: term });

    try {
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
        params: {
          key: apiKey,
          part: 'snippet',
          q: term,
          type: 'video,playlist,channel',
          maxResults: 15,
        },
      });

      const items: SearchResultItem[] = response.data.items.map((item: any) => ({
        id: item.id.videoId || item.id.playlistId || item.id.channelId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        kind: item.id.kind,
      }));

      set({ results: items, isLoading: false });

    } catch (error: any) {
      console.error('Error fetching YouTube search results:', error);
      set({ isLoading: false, error: error.message || 'Failed to fetch search results.', results: [] });
    }
  },

  clearResults: () => set({ results: [], isLoading: false, error: null, currentSearchTerm: '' }),

  // Sonucu grid'e atama fonksiyonu
  assignResultToGrid: async (item) => {
    const { activeGridItemId, setCellContent } = useGridStore.getState();
    const { addChannel, channels } = useChannelStore.getState();

    if (!activeGridItemId) {
      alert('Please select a grid cell first by clicking on it.');
      return;
    }

    let channelType: ChannelType | null = null;
    let url = '';
    let extractedId = item.id; // API'den gelen ID'yi kullan

    switch (item.kind) {
      case 'youtube#video':
        channelType = 'video';
        url = `https://www.youtube.com/watch?v=${item.id}`;
        break;
      case 'youtube#playlist':
        channelType = 'playlist';
        url = `https://www.youtube.com/playlist?list=${item.id}`;
        break;
      case 'youtube#channel':
        channelType = 'channel';
        url = `https://www.youtube.com/channel/${item.id}`;
        // Kanal ID'si zaten elimizde, extractIdAndType'a gerek yok
        break;
      default:
        console.error("Unknown search result kind:", item.kind);
        return;
    }

    // Eğer kanal zaten listede yoksa ekle
    const existingChannel = channels.find(c => c.id === extractedId);
    if (!existingChannel && channelType) {
        console.log(`Adding new channel/video from search: ${item.title}`);
        const success = await addChannel({
            url: url,
            name: item.title, // API'den gelen ismi kullan
            type: channelType,
        });
        if (!success) {
            console.error("Failed to add channel from search result.");
            // Hata mesajı addChannel içinde gösteriliyor olmalı
            return;
        }
         // Kanal eklendikten sonra ID'yi state'e ata
         // addChannel'ın return değeri sadece boolean, ID'yi tekrar almamız gerekebilir?
         // addChannel zaten ID'yi extract ediyor, o ID'yi kullanmalıydık.
         // Let's assume addChannel correctly uses extractedId or updates state quickly
    } else if (existingChannel) {
         extractedId = existingChannel.id; // Varolan kanalın ID'sini kullan
         console.log(`Using existing channel: ${existingChannel.name}`);
    } else {
        console.error("Could not determine channel type or ID for assignment.");
        return;
    }


    // Grid hücresine ata
    console.log(`Assigning content ${extractedId} to cell ${activeGridItemId}`);
    setCellContent(activeGridItemId, extractedId);
    // Arama sonuçlarını temizle? İsteğe bağlı.
    // get().clearResults();
  },
}));

export default useSearchStore; 