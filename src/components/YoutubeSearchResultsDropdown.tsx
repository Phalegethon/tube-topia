'use client';

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import useSearchStore from '@/store/searchStore';
import useChannelStore, { ChannelType } from '@/store/channelStore';
import { FaSpinner, FaExclamationTriangle, FaSave, FaPlay, FaExternalLinkAlt } from 'react-icons/fa';

const DropdownWrapper = styled.div`
  position: absolute;
  top: calc(100% + 12px); // Position below the input container
  left: 0;
  width: 100%; 
  background-color: #282828; // Restore background
  border: 1px solid #4B5563; // Restore border
  border-top: none; // No top border as it connects visually
  border-radius: 0 0 8px 8px; // Round bottom corners
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); // Restore shadow
  z-index: 1003; // Ensure it's above backdrop and input container wrapper
  
  max-height: 350px; 
  overflow-y: auto;
  padding: 4px 0; 

  /* Scrollbar stilleri */
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: #282828; } // Restore background
  &::-webkit-scrollbar-thumb { background-color: #555; border-radius: 0 0 8px 8px; }
`;

const LoadingSpinner = styled.div`
  padding: 15px; // Padding azaltıldı
  /* ... rest ... */
`;
const ErrorMessage = styled.div`
  padding: 15px; // Padding azaltıldı
  /* ... rest ... */
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 12px; // Padding azaltıldı
  cursor: default; 
  gap: 8px; // Boşluk azaltıldı

  &:hover {
    background-color: #373737;
  }
`;

const Thumbnail = styled.img` 
    width: 50px; // Boyut küçültüldü
    height: 28px;
    /* ... rest ... */
`;

const Title = styled.span`
  font-size: 0.8rem; // Font küçültüldü
  color: #E5E7EB;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-grow: 1; // Butonları sağa it
`;

const ActionButton = styled.button`
    padding: 3px 6px; // Padding azaltıldı
    font-size: 0.7rem; // Font küçültüldü
    gap: 3px;
    background: none;
    border: 1px solid #555;
    color: #ccc;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: background-color 0.2s, border-color 0.2s, color 0.2s;
    min-width: 60px; // Butonların minimum genişliği
    justify-content: center;

    &:hover {
        background-color: #444;
        border-color: #777;
        color: #fff;
    }

    &.save:hover {
        background-color: #3b82f6; // Mavi hover
        border-color: #3b82f6;
    }
    &.watch:hover {
         background-color: #10b981; // Yeşil hover
         border-color: #10b981;
    }
    &.open-youtube:hover {
         background-color: #c4302b; // YouTube kırmızısı hover
         border-color: #c4302b;
    }
`;

interface YoutubeSearchResultsDropdownProps {
    inputRef: React.RefObject<HTMLInputElement | null>;
    onClose: () => void;
}

const YoutubeSearchResultsDropdown: React.FC<YoutubeSearchResultsDropdownProps> = ({ inputRef, onClose }) => {
  const {
    results,
    isLoading,
    error,
    currentSearchTerm,
    assignResultToGrid,
    clearResults,
  } = useSearchStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, inputRef]);

  // Kaydetme fonksiyonu (kanalı ekler)
  const handleSave = async (item: any) => {
     const { addChannel } = useChannelStore.getState();
     let channelType: ChannelType | null = null;
     let url = '';
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
           break;
     }
     if(channelType) {
         const success = await addChannel({ url, name: item.title, type: channelType });
         if(success) alert(`${item.title} saved!`);
     }
  }

  // İzleme fonksiyonu (doğrudan grid'e atar)
  const handleWatch = (item: any) => {
      assignResultToGrid(item);
      onClose(); // İzle'ye basınca dropdown kapansın
  }

  // Arama yapılmamışsa gösterme
  if (!currentSearchTerm && results.length === 0 && !isLoading && !error) {
      return null;
  }

  return (
    <DropdownWrapper ref={dropdownRef}>
      {isLoading && <LoadingSpinner><FaSpinner /></LoadingSpinner>}
      {error && (
          <ErrorMessage>
            <FaExclamationTriangle size="1.5em" />
            <span>Error: {error}</span>
          </ErrorMessage>
      )}
      {!isLoading && !error && results.length === 0 && currentSearchTerm && (
          <ErrorMessage style={{ color: '#888', padding: '15px' }}>
                No results found for "{currentSearchTerm}"
            </ErrorMessage>
      )}
      {!isLoading && !error && results.length > 0 && (
        results.map((item) => (
          <ResultItem key={item.id}>
            <Thumbnail src={item.thumbnail} alt={item.title} />
            <Title>{item.title}</Title>
            {item.kind === 'youtube#channel' ? (
              <ActionButton 
                className="open-youtube" 
                onClick={() => window.open(`https://www.youtube.com/channel/${item.id}`, '_blank')}
                title="Open channel on YouTube"
              >
                <FaExternalLinkAlt /> YouTube'da Aç
              </ActionButton>
            ) : (
              <>
                <ActionButton className="save" onClick={() => handleSave(item)} title="Save to Channel List">
                    <FaSave /> Save
                </ActionButton>
                <ActionButton className="watch" onClick={() => handleWatch(item)} title="Watch in selected grid cell">
                    <FaPlay /> Watch
                </ActionButton>
              </>
            )}
          </ResultItem>
        ))
      )}
    </DropdownWrapper>
  );
};

export default YoutubeSearchResultsDropdown; 