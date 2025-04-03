'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import styled from 'styled-components';
import useGridStore from '@/store/gridStore';
import useChannelStore, { Channel } from '@/store/channelStore';
import GridItem from './GridItem';
import { FaTimes, FaCommentAlt } from 'react-icons/fa';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Bileşenin kabul edeceği props arayüzünü tanımla
interface GridContainerProps {
  isFullscreenActive: boolean;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const GridContainerWrapper = styled.div`
  flex-grow: 1;
  height: 100%;
  overflow: hidden; /* İçerik taşmasını engelle */
  position: relative;
  background-color: #000; // Grid arka planı
`;

const GridItemWrapper = styled.div`
  background-color: #111;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden; /* Önemli: İçeriğin taşmasını engeller */
  position: relative; /* Butonları konumlandırmak için */
  border: 1px solid #333; // Hücre kenarlığı
`;

const EmptyCellPlaceholder = styled.div`
    color: #888;
    font-size: 0.9rem;
    text-align: center;
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
    setCellContent,
    cellContents,
    clearCellContent,
    setActiveGridItemId,
    setChatVisibility
  } = useGridStore();
  const { channels } = useChannelStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

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

  const rowsCount = layout.length > 0 ? Math.max(...layout.map(l => l.y + l.h)) : 1;
  const gridMargin: [number, number] = isFullscreenActive ? [2, 2] : [10, 10];
  const rowHeight = containerHeight > 0 && rowsCount > 0 ? Math.max(1, Math.floor((containerHeight - (rowsCount + 1) * gridMargin[1]) / rowsCount)) : 100; // Sıfıra bölme hatasını engelle

  return (
    <GridContainerWrapper ref={containerRef}>
      {containerHeight > 0 && (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: gridCols, md: gridCols, sm: gridCols, xs: gridCols, xxs: gridCols }}
          rowHeight={rowHeight}
          isBounded={true}
          margin={gridMargin}
          onLayoutChange={handleLayoutChange}
          draggableCancel=".grid-item-remove-button, .grid-item-chat-button"
        >
          {layout.map((item) => {
            const contentId = cellContents[item.i] || null; // null olabileceğinden emin ol
            // getChannelById kaldırıldı
            // const channel = getChannelById(contentId);
            // Kanal bilgisini butonlar için alalım
            const channelForButtons = contentId ? channels.find(c => c.id === contentId) : null;

            return (
              <GridItemWrapper key={item.i}>
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