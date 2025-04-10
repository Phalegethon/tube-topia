import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios'; // axios import edildi
import useGridStore from '@/store/gridStore'; // gridStore import edildi
import useApiKeyStore from '@/store/apiKeyStore'; // ApiKeyStore import edildi
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify'; // toast import edildi

// Kanal tiplerini tanımla
export type ChannelType = 'channel' | 'playlist' | 'live' | 'video';

export interface Channel {
  id: string; // Benzersiz ID (örn. URL veya özel ID)
  url: string; // YouTube URL'si veya ID'si
  name?: string; // name alanını opsiyonel yap
  type: ChannelType;
}

interface ChannelState {
  channels: Channel[];
  addChannel: (channel: Omit<Channel, 'id'>) => Promise<boolean>;
  removeChannel: (id: string) => void;
  updateChannel: (id: string, updatedChannel: Partial<Omit<Channel, 'id'>>) => void;
  initializeDefaultChannels: () => void; // Yeni başlatma fonksiyonu
}

// Basit bir URL/ID ayrıştırma fonksiyonu (daha gelişmiş hale getirilebilir)
const extractIdAndType = (url: string): { id: string; type: ChannelType; name?: string } | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      if (urlObj.pathname.startsWith('/live/')) {
        return { id: urlObj.pathname.split('/')[2], type: 'live' };
      }
      if (urlObj.pathname.startsWith('/playlist')) {
        const listId = urlObj.searchParams.get('list');
        return listId ? { id: listId, type: 'playlist' } : null;
      }
      if (urlObj.pathname.startsWith('/channel/')) {
        return { id: urlObj.pathname.split('/')[2], type: 'channel' };
      }
      if (urlObj.pathname.startsWith('/@')) {
        // Handle/Kullanıcı adı durumu - Şimdilik URL'yi ID olarak alalım, daha sonra API ile doğrulanabilir
        return { id: url, name: urlObj.pathname.substring(1), type: 'channel' };
      }
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return { id: videoId, type: 'video' };
      }
       if (urlObj.hostname === 'youtu.be') {
         const pathSegments = urlObj.pathname.split('/').filter(Boolean);
         if(pathSegments.length === 1) {
            return { id: pathSegments[0], type: 'video' };
         }
      }
    }
    // Doğrudan ID girilmiş olabilir (varsayım: video ID)
    if (!url.includes('/') && url.length === 11) { // Tipik video ID uzunluğu
      return { id: url, type: 'video' };
    }
    // TODO: Diğer YouTube URL formatlarını da ekle (örn. custom channel URLs /c/)
  } catch (e) {
    // Geçersiz URL veya ID ise
    console.error("Invalid URL or ID format:", url, e);
    // Belki doğrudan ID olarak kabul edilebilir? Şimdilik null dönüyoruz.
    if (!url.includes('/') && url.length > 5) { // Genel bir ID varsayımı
        // return { id: url, type: 'video' }; // Veya 'channel' ? Belirsiz.
    }
  }
  return null;
};

// YouTube API Anahtarı tanımı kaldırıldı
// const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// YouTube API'sinden isim getirme fonksiyonu güncellendi
const fetchContentName = async (id: string, type: ChannelType): Promise<string | null> => {
  const apiKey = useApiKeyStore.getState().apiKey; // Anahtarı store'dan al
  if (!apiKey) { // Store'daki anahtarı kontrol et
    console.warn('YouTube API Key is not set. Cannot fetch names automatically.');
    return null;
  }

  let endpoint = '';
  const params: Record<string, string> = { key: apiKey, part: 'snippet', id }; // apiKey kullanıldı

  switch (type) {
    case 'video':
    case 'live': // Canlı yayınlar da video endpoint'ini kullanır
      endpoint = 'videos';
      break;
    case 'playlist':
      endpoint = 'playlists';
      break;
    case 'channel':
       // Handle (@kullaniciadi) durumunda ID URL'dir, normal ID'ler /channel/ endpoint'ini kullanır.
       // API v3 doğrudan handle ile sorguyu desteklemiyor olabilir, bu yüzden ID formatına göre karar verelim.
       // Basit bir kontrol: ID 'UC' ile başlıyorsa veya 24 karakter uzunluğundaysa kanal ID'si varsayalım.
      if (id.startsWith('UC') || id.length === 24) {
           endpoint = 'channels';
      } else {
          console.warn(`Cannot reliably fetch name for channel handle/URL: ${id}. Skipping API call.`);
          return id; // Handle'ı isim olarak döndür
      }
      break;
    default:
      return null; // Bilinmeyen tip
  }

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/${endpoint}`, { params });
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].snippet.title;
    } else {
      console.warn(`Could not find title for ${type} with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching YouTube ${type} title:`, error);
    return null;
  }
};

const useChannelStore = create<ChannelState>()(
  persist(
    (set, get) => ({ 
      channels: [],
      addChannel: async (newChannelData): Promise<boolean> => {
         const extracted = extractIdAndType(newChannelData.url);
         if (!extracted) {
             toast.error(`Invalid YouTube URL or ID format: ${newChannelData.url}`);
             console.error("Could not extract ID or type from URL:", newChannelData.url);
             return false;
         }

         const channels = get().channels;
         if (channels.some(channel => channel.id === extracted.id)) {
            toast.warn(`Channel with ID ${extracted.id} already exists.`);
            return false;
         }

         let channelName = newChannelData.name || extracted.name;
         if (!channelName && useApiKeyStore.getState().apiKey) {
             const fetchedName = await fetchContentName(extracted.id, extracted.type);
             if (fetchedName) { channelName = fetchedName; }
         }
         if (!channelName) { channelName = extracted.id; }

         const newChannel: Channel = {
             id: extracted.id,
             url: newChannelData.url,
             name: channelName,
             type: newChannelData.type || extracted.type,
         };

         set({ channels: [...channels, newChannel] });
         return true; 
      },
      removeChannel: (id) => {
        useGridStore.getState().clearContentIdFromAllCells(id);
        set((state) => ({ channels: state.channels.filter((channel) => channel.id !== id) }));
      },
      updateChannel: (id, updatedChannel) => {
        set((state) => ({
          channels: state.channels.map((channel) =>
            channel.id === id ? { ...channel, ...updatedChannel } : channel
          ),
        }));
      },

      // Yeni başlatma fonksiyonu
      initializeDefaultChannels: () => {
        // Sadece kanallar boşsa çalıştır
        if (get().channels.length === 0) {
            console.log("Initializing default channels...");
            const defaultChannelsData: Omit<Channel, 'id'>[] = [
                { name: 'Halk TV', url: 'https://www.youtube.com/watch?v=ylZEtd1qSTk', type: 'live' },
                { name: 'Sözcü Tv', url: 'https://www.youtube.com/watch?v=uvRufI_dfz4', type: 'live' },
            ];

            const addedChannels: Channel[] = [];
            let assignedCount = 0;

            defaultChannelsData.forEach((chData) => {
                const extracted = extractIdAndType(chData.url);
                if (extracted) {
                    const newChannel: Channel = {
                        id: extracted.id,
                        url: chData.url,
                        name: chData.name || extracted.id,
                        type: extracted.type,
                    };
                    addedChannels.push(newChannel);

                    // İlk iki kanalı grid'e ata (gridStore'un 2x2 olduğunu varsayıyoruz)
                    if (assignedCount < 2) {
                        useGridStore.getState().setCellContent(`cell-${assignedCount}`, newChannel.id);
                        assignedCount++;
                    }
                }
            });

            if (addedChannels.length > 0) {
                set({ channels: addedChannels });
                console.log("Default channels added:", addedChannels);
            }
        }
      },
    }),
    {
      name: 'youtube-channels-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useChannelStore; 