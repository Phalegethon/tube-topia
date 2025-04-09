'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import styled, { css } from 'styled-components';
import useGridStore from '@/store/gridStore';
import useChannelStore from '@/store/channelStore';
import GridItem from './GridItem';
import { FaTimes, FaCommentAlt } from 'react-icons/fa';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Bileşenin kabul edeceği props arayüzünü tanımla
interface GridContainerProps {
  isFullscreenActive: boolean;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const GridContainerWrapper = styled.div<{ 
    $isDraggingActive?: boolean;
    $gridCols?: number;
    $rowHeight?: number;
    $margin?: [number, number];
}>`
  flex-grow: 1;
  height: 100%;
  overflow: hidden; /* İçerik taşmasını engelle */
  position: relative;
  background-color: #000; // Grid arka planı
  transition: background-color 0.3s ease; // Geçiş eklendi

  /* react-grid-layout için global stil ayarlamaları */
  .react-grid-layout {
    position: relative;
    transition: height 200ms ease;
  }
  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top;
    box-sizing: border-box;
  }
  .react-grid-item.cssTransforms {
    transition-property: transform;
  }
  .react-grid-item.resizing {
    z-index: 10; // Yeniden boyutlandırma sırasında üstte kalsın
    will-change: width, height;
  }
  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 1001; // Sürüklenirken en üstte (Overlay'den de üstte)
    will-change: transform;
  }
  .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: none; // Varsayılan görseli kaldır
    padding: 0;
    cursor: nwse-resize;
    z-index: 6; // DragOverlay'in (z-index: 5) üzerinde olmalı
    /* Görsel iyileştirme: Köşeye küçük bir üçgen veya ikon eklenebilir */
    &::after {
        content: '';
        position: absolute;
        right: 3px;
        bottom: 3px;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 0 8px 8px;
        border-color: transparent transparent rgba(255, 255, 255, 0.3) transparent;
        transition: border-color 0.2s ease;
    }
    &:hover::after {
         border-color: transparent transparent rgba(255, 255, 255, 0.7) transparent;
    }
  }

  /* Sürükleme aktifken grid yapısını göster */
  ${({ $isDraggingActive, $gridCols = 12, $rowHeight = 100, $margin = [10, 10] }) => 
      $isDraggingActive && $gridCols && $rowHeight && css`
        background-color: #111; // Biraz daha açık bir arka plan
        background-image: 
          repeating-linear-gradient(
            to right,
            transparent,
            transparent calc((100% - ${($gridCols + 1) * $margin[0]}px) / ${$gridCols}), 
            #444 calc((100% - ${($gridCols + 1) * $margin[0]}px) / ${$gridCols}), 
            #444 calc((100% - ${($gridCols + 1) * $margin[0]}px) / ${$gridCols} + 1px)
          ),
          repeating-linear-gradient(
            to bottom,
            transparent,
            transparent ${$rowHeight}px, 
            #444 ${$rowHeight}px, 
            #444 ${$rowHeight + 1}px
          );
         background-position: ${$margin[0]}px ${$margin[1]}px; // Margin kadar offset
         /* background-size hesaplaması kaldırıldı, repeating-linear-gradient ile yapılıyor */
      `
  }
`;

const GridItemWrapper = styled.div<{ $isDragging?: boolean }>`
  background-color: #111;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Önemli: İçeriğin taşmasını engeller */
  position: relative; /* Butonları konumlandırmak için */
  border: 1px solid #333; // Hücre kenarlığı
  transition: opacity 0.2s ease-in-out; // Opaklık geçişi
  ${({ $isDragging }) => 
      $isDragging && 
      css`
        // dragging class'ı artık GridContainerWrapper içinde tanımlandı
      `
  }
  /* Normal cursor */
  &:not(:has(*[draggable="true"][aria-grabbed="true"])) { // React-grid-layout tarafından eklenen attribute
      cursor: grab;
  }
`;

// Genel buton stili
const baseButtonStyle = `
  position: absolute;
  top: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease-in-out, background-color 0.2s ease;
  z-index: 10;
  font-size: 12px;

  ${GridItemWrapper}:hover & {
    opacity: 1;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const GridItemRemoveButton = styled.button`
  ${baseButtonStyle}
  right: 5px;
  &:hover {
     background-color: rgba(220, 53, 69, 0.8); // Kırmızı hover
  }
`;

const GridItemChatButton = styled.button`
  ${baseButtonStyle}
  right: 35px; // Solunda boşluk bırak
   &:hover {
     background-color: rgba(99, 102, 241, 0.8); // Mavi hover (primary renk)
  }
`;

// GridContainer componentini props alacak şekilde güncelle
const GridContainer: React.FC<GridContainerProps> = ({ isFullscreenActive }) => {
  const {
    layout,
    setLayout,
    gridCols,
    cellContents,
    clearCellContent,
    setActiveGridItemId,
    setChatVisibility
  } = useGridStore();
  const { channels } = useChannelStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  // Sürüklenen öğenin ID'sini tutmak için state
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const handleLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout);
  };

  // Sürükleme başladığında
  const onDragStart = (layout: Layout[], oldItem: Layout, newItem: Layout) => {
    setDraggingItemId(newItem.i);
  };

  // Sürükleme bittiğinde
  const onDragStop = () => {
    setDraggingItemId(null);
    // Layout değişikliğini handleLayoutChange zaten yapıyor.
  };

  const rowsCount = layout.length > 0 ? Math.max(...layout.map(l => l.y + l.h)) : 1;
  const gridMargin: [number, number] = isFullscreenActive ? [2, 2] : [10, 10];
  const rowHeight = containerHeight > 0 && rowsCount > 0 ? Math.max(1, Math.floor((containerHeight - (rowsCount + 1) * gridMargin[1]) / rowsCount)) : 100; // Sıfıra bölme hatasını engelle

  return (
    <GridContainerWrapper 
        ref={containerRef} 
        $isDraggingActive={draggingItemId !== null}
        $gridCols={gridCols}
        $rowHeight={rowHeight}
        $margin={gridMargin}
    >
      {containerHeight > 0 && (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: gridCols, md: gridCols, sm: gridCols, xs: gridCols, xxs: gridCols }}
          rowHeight={rowHeight}
          isBounded={false}
          margin={gridMargin}
          onLayoutChange={handleLayoutChange}
          draggableCancel=".grid-item-remove-button, .grid-item-chat-button"
          // Sürükleme olaylarını ekle
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          compactType={null}
          preventCollision={true}
        >
          {layout.map((item) => {
            const contentId = cellContents[item.i] || null; // null olabileceğinden emin ol
            // getChannelById kaldırıldı
            // const channel = getChannelById(contentId);
            // Kanal bilgisini butonlar için alalım
            const channelForButtons = contentId ? channels.find(c => c.id === contentId) : null;
            const isDragging = item.i === draggingItemId;

            return (
              <GridItemWrapper key={item.i} $isDragging={isDragging}>
                {/* GridItem'a cellId ve contentId prop'larını geçir */}
                <GridItem cellId={item.i} contentId={contentId} />
                {/* Butonlar için channelForButtons kullan */}
                 {channelForButtons && (
                  <>
                    <GridItemRemoveButton
                      className="grid-item-remove-button"
                      title={`Remove ${channelForButtons.name || channelForButtons.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        clearCellContent(item.i);
                      }}
                    >
                      <FaTimes />
                    </GridItemRemoveButton>
                    <GridItemChatButton
                       className="grid-item-chat-button"
                       title={`Open chat for ${channelForButtons.name || channelForButtons.id}`}
                       onClick={(e) => {
                          e.stopPropagation();
                          setActiveGridItemId(item.i);
                          setChatVisibility(true);
                       }}
                    >
                        <FaCommentAlt />
                    </GridItemChatButton>
                  </>
                )}
              </GridItemWrapper>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </GridContainerWrapper>
  );
};

export default GridContainer; 