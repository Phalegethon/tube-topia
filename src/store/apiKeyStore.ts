import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ApiKeyState {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set) => ({
      apiKey: null, // Başlangıçta anahtar yok
      setApiKey: (key: string | null) => {
          const trimmedKey = key?.trim(); // Boşlukları temizle
          set({ apiKey: trimmedKey ? trimmedKey : null }); // Boşsa null olarak kaydet
      },
    }),
    {
      name: 'youtube-api-key-storage', // storage adı
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useApiKeyStore; 