import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Layout } from 'react-grid-layout';

// Hücre içeriğini tutacak tip
interface CellContents {
  [cellId: string]: string | null; // Değer: channelId veya null
}

// Export the GridState interface
export interface GridState {
  layout: Layout[]; // Hücrelerin konumu ve boyutu (i: 'cell-0', 'cell-1', ...)
  gridCols: number;
  activeGridItemId: string | null; // Aktif HÜCRE ID'si
  cellContents: CellContents; // Hangi hücrede hangi kanal var?
  isChatVisible: boolean; // Chat görünürlüğü state'i eklendi

  // Fonksiyonlar
  setLayout: (newLayout: Layout[]) => void;
  setGridCols: (cols: number, updateLayout?: boolean) => void; // Izgara değiştiğinde layout'u güncelleyebilmek için parametre eklendi
  setActiveGridItemId: (itemId: string | null) => void;
  setCellContent: (cellId: string, contentId: string | null) => void; // Hücre içeriğini ayarla
  clearCellContent: (cellId: string) => void; // Hücre içeriğini temizle (removeItem yerine)
  clearContentIdFromAllCells: (contentId: string) => void; // Belirli bir içeriği tüm hücrelerden temizle
  generateLayout: (cols: number) => void; // Yeni layout ve boş içerik oluşturma fonksiyonu
  setChatVisibility: (isVisible: boolean) => void; // Yeni fonksiyon
  removeCell: (cellId: string) => void; // Yeni fonksiyon tanımı
  addEmptyCell: () => void; // Yeni fonksiyon tanımı
  resetCurrentLayout: () => void; // Yeni fonksiyon tanımı
}

// Belirli sayıda hücre için varsayılan layout oluşturan yardımcı fonksiyon
const createDefaultLayout = (cellCount: number, cols: number, rows: number): Layout[] => {
  const layout: Layout[] = [];
  // Genişliği sütun sayısına göre daha hassas hesapla
  const itemW = Math.round(cols / Math.ceil(cellCount / rows)); 
  const itemH = 1; // Yükseklik hep 1 rowHeight birimi olacak
  
  for (let i = 0; i < cellCount; i++) {
    const rowNum = Math.floor(i / (cols / itemW)); // Hücrenin hangi satırda olduğunu hesapla
    layout.push({
      i: `cell-${i}`,
      // x koordinatını hesaplarken satır başlarına dikkat et
      x: (i * itemW) % cols,
      y: rowNum, // y koordinatı doğrudan satır numarası (h=1 olduğu için)
      w: itemW,
      h: itemH, // h=1
      isResizable: true,
      isDraggable: true,
    });
  }
  return layout;
};

// Grid sayısını (cols), hücre sayısına (cells) ve satır sayısına (rows) çeviren map
export const gridLayoutConfig: { [key: number]: { cells: number; rows: number } } = {
    4: { cells: 4, rows: 2 },  // 2x2
    6: { cells: 6, rows: 2 },  // 3x2
    8: { cells: 8, rows: 2 },  // 4x2
    9: { cells: 9, rows: 3 },  // 3x3
    12: { cells: 12, rows: 3 } // 4x3
};

const useGridStore = create<GridState>()(
  persist(
    (set, get) => ({
      // Başlangıç layout'unu 2x2 (4 cols) olarak ayarla
      layout: createDefaultLayout(gridLayoutConfig[4].cells, 4, gridLayoutConfig[4].rows),
      gridCols: 4,
      activeGridItemId: null,
      cellContents: {},
      isChatVisible: false, // Başlangıçta chat gizli

      setLayout: (newLayout) => set({ layout: newLayout }),

      setActiveGridItemId: (itemId) => set({ activeGridItemId: itemId }),

      // Belirli bir hücreye içerik ata
      setCellContent: (cellId, contentId) => {
        set((state) => ({
          cellContents: {
            ...state.cellContents,
            [cellId]: contentId,
          },
        }));
      },

      // Hücre içeriğini temizle
      clearCellContent: (cellId) => {
         get().setCellContent(cellId, null); 
      },

      // Belirli bir contentId'yi tüm hücrelerden temizle (Kanal silindiğinde kullanılır)
      clearContentIdFromAllCells: (contentId) => {
          set(state => {
              const newContents: CellContents = {};
              Object.entries(state.cellContents).forEach(([cellId, currentContentId]) => {
                  newContents[cellId] = currentContentId === contentId ? null : currentContentId;
              });
              return { cellContents: newContents };
          });
      },
      
      // setGridCols artık sadece generateLayout'u çağırıyor
      setGridCols: (cols) => {
        get().generateLayout(cols);
      },
            
      // Yeni layout ve boş içerik oluştur
      generateLayout: (cols) => {
           const config = gridLayoutConfig[cols] || { cells: 1, rows: 1 }; // Varsayılan 1x1
           const newLayout = createDefaultLayout(config.cells, cols, config.rows);
           const newContents: CellContents = {};
           const currentContents = get().cellContents; // Mevcut içeriği al
           newLayout.forEach(item => {
               // Eski ID'lerden eşleşen varsa içeriği koru
               newContents[item.i] = currentContents[item.i] || null; 
           });
           set({ 
               gridCols: cols, 
               layout: newLayout, 
               cellContents: newContents, 
               activeGridItemId: null 
            });
      },

      // Chat görünürlüğünü ayarla
      setChatVisibility: (isVisible) => set({ isChatVisible: isVisible }),

      // Yeni fonksiyon: Hücreyi layout ve içerik listesinden kaldır
      removeCell: (cellId) => {
          set((state) => {
              // Layout'tan kaldır
              const newLayout = state.layout.filter(item => item.i !== cellId);
              // İçerik listesinden kaldır
              const newContents = { ...state.cellContents };
              delete newContents[cellId];
              
              return {
                  layout: newLayout,
                  cellContents: newContents,
                  // Aktif hücre kaldırıldıysa, aktifliği sıfırla
                  activeGridItemId: state.activeGridItemId === cellId ? null : state.activeGridItemId,
              };
          });
      },

      // Yeni fonksiyon: Boş hücre ekle
      addEmptyCell: () => {
        set((state) => {
            const { gridCols, layout } = state;
            const config = gridLayoutConfig[gridCols];
            if (!config || layout.length >= config.cells) {
                console.warn("Cannot add more cells. Maximum reached for this layout.");
                return state; // Maksimum hücre sayısına ulaşıldıysa veya config yoksa işlem yapma
            }

            // Yeni hücre ID'sini bul
            let nextIdIndex = 0;
            const existingIds = layout.map(item => parseInt(item.i.split('-')[1])).filter(Number.isFinite);
            if (existingIds.length > 0) {
                nextIdIndex = Math.max(...existingIds) + 1;
            }
            const newCellId = `cell-${nextIdIndex}`;

            // Yeni hücrenin pozisyonunu bul
            const cols = gridCols;
            const itemW = Math.round(cols / Math.ceil(config.cells / config.rows)); 
            const itemH = 1;
            // Basit yaklaşım: Mevcut layout'un son item'ının altına ekle
            let newX = 0;
            let newY = 0;
            if (layout.length > 0) {
                 // Çok basit: son elemanın x'ine genişliği ekle, eğer satırı aşıyorsa yeni satıra geç
                const lastItem = layout[layout.length - 1];
                newX = (lastItem.x + lastItem.w) % cols;
                newY = lastItem.y + (newX === 0 ? lastItem.h : 0); // Yeni satıra geçildiyse y'yi artır
            }
            // TODO: Daha gelişmiş boş yer bulma mantığı eklenebilir.

            const newLayoutItem: Layout = {
                i: newCellId,
                x: newX,
                y: newY,
                w: itemW,
                h: itemH,
                isResizable: true,
                isDraggable: true,
            };

            return {
                layout: [...state.layout, newLayoutItem],
                cellContents: { ...state.cellContents, [newCellId]: null },
            };
        });
      },

      // Yeni fonksiyon: Mevcut layout'u varsayılana sıfırla
      resetCurrentLayout: () => {
          set((state) => {
              const { gridCols } = state;
              const config = gridLayoutConfig[gridCols];
              if (!config) {
                  console.warn("Cannot reset layout: config not found for cols:", gridCols);
                  return state; // Config yoksa işlem yapma
              }
              // Mevcut gridCols'a göre varsayılan layout'u oluştur
              const defaultLayout = createDefaultLayout(config.cells, gridCols, config.rows);
              console.log("Resetting layout to default for cols:", gridCols);
              // Sadece layout'u güncelle, cellContents aynı kalsın
              return {
                  layout: defaultLayout,
                  activeGridItemId: null, // Aktif hücreyi sıfırla
              };
          });
      },
    }),
    {
      name: 'youtube-grid-layout-storage-v2',
      storage: createJSONStorage(() => localStorage),
      // isChatVisible persist edilmeyecek
      partialize: (state) => ({ 
          gridCols: state.gridCols, 
          cellContents: state.cellContents,
          layout: state.layout // Layout'u da persist etmeliyiz artık
        }),
      // onRehydrateStorage: (state) => {
      //   console.log("hydration finished");
      //   // İsteğe bağlı: Hidrasyon sonrası ek işlemler
      //   if (state) {
      //     // Hidrasyon sonrası layout'u gridCols'a göre yeniden oluştur
      //     state.generateLayout(state.gridCols);
      //   }
      // },
    }
  )
);

export default useGridStore; 