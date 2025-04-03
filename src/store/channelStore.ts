import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios'; // axios import edildi
import useGridStore from '@/store/gridStore'; // gridStore import edildi

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

// YouTube API Anahtarı (Environment Variable'dan alınacak)
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// YouTube API'sinden isim getirme fonksiyonu
const fetchContentName = async (id: string, type: ChannelType): Promise<string | null> => {
  if (!API_KEY) {
    console.warn('YouTube API Key (NEXT_PUBLIC_YOUTUBE_API_KEY) is not set. Cannot fetch names automatically.');
    return null;
  }

  let endpoint = '';
  let params: any = { key: API_KEY, part: 'snippet', id };

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
    (set, get) => ({ // get eklendi
      channels: [],
      // addChannel fonksiyonu async ve boolean döndürecek
      addChannel: async (newChannelData): Promise<boolean> => {
         const extracted = extractIdAndType(newChannelData.url);
         if (!extracted) {
             // Konsol log yerine alert göster
             alert(`Invalid YouTube URL or ID format: ${newChannelData.url}`);
             console.error("Could not extract ID or type from URL:", newChannelData.url);
             return false; // Başarısız olduğunu belirt
         }

         if (get().channels.some(channel => channel.id === extracted.id)) {
            // Uyarıyı alert ile göster
            alert(`Channel with ID ${extracted.id} already exists.`);
            console.warn(`Channel with ID ${extracted.id} already exists.`);
            return false; // Başarısız (zaten var)
         }

         let channelName = newChannelData.name || extracted.name;
         if (!channelName && API_KEY) {
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

         set({ channels: [...get().channels, newChannel] });
         return true; // Başarılı
      },
      removeChannel: (id) => {
        // Önce grid store'dan bu contentId'yi temizle
        useGridStore.getState().clearContentIdFromAllCells(id);
        // Sonra kanalı state'den sil
        set((state) => ({ channels: state.channels.filter((channel) => channel.id !== id) }));
      },
      updateChannel: (id, updatedChannel) => {
        set((state) => ({
          channels: state.channels.map((channel) =>
            channel.id === id ? { ...channel, ...updatedChannel } : channel
          ),
        }));
        // İsim güncellenirse grid'deki gösterim de güncellenecektir (GridItem name'i channelStore'dan alıyor)
      },
    }),
    {
      name: 'youtube-channels-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useChannelStore; 