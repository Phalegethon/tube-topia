'use client';

import React from 'react';
import styled from 'styled-components';
import { FaCog } from 'react-icons/fa';
// import SearchInput from './SearchInput'; // Bu bileşen ayrı bir dosyada mı? Eğer yoksa, input'u buraya taşı.
import useUIStore from '@/store/uiStore';
// Kaldırılan importlar: GridSizeSelector, IconButton, VolumeControl, useGridStore, usePlaybackStore

const HeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.small} ${theme.spacing.medium}`};
  background-color: ${({ theme }) => theme.colors.background ?? '#1f2937'}; 
  border-bottom: 1px solid ${({ theme }) => theme.colors.border ?? '#374151'}; 
  color: ${({ theme }) => theme.colors.text ?? '#e5e7eb'}; 
`;

const LogoAndSearch = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1; /* Arama çubuğunun genişlemesi için */
  margin-right: ${({ theme }) => theme.spacing.medium};
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary ?? '#4F46E5'};
  margin-right: ${({ theme }) => theme.spacing.large};
  cursor: default;
`;

// Basit Arama Inputu (Eğer SearchInput bileşeni yoksa)
const SimpleSearchInput = styled.input`
    padding: 8px 12px;
    border: 1px solid #4B5563;
    border-radius: 4px;
    background-color: #374151;
    color: #F3F4F6;
    font-size: 0.9rem;
    outline: none;
    flex-grow: 1;
    max-width: 400px; /* İsteğe bağlı: Maksimum genişlik */

    &:focus {
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
    }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

// IconButton'ı burada tanımlayalım (Eğer ayrı dosya yoksa)
const HeaderIconButton = styled.button`
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 1.2rem; /* Boyutu biraz ayarladım */
  cursor: pointer;
  padding: 8px; /* Tıklama alanını genişlet */
  line-height: 1;
  border-radius: 4px;
  transition: color 0.2s ease, background-color 0.2s ease;
  
  &:hover {
      color: #FFF;
      background-color: rgba(255, 255, 255, 0.1);
  }
`;


const Header: React.FC = () => {
  const { openSettingsModal } = useUIStore();
  
  // TODO: Arama fonksiyonelliğini buraya ekle veya SearchInput bileşenini kullan
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("Search term:", e.target.value);
  };

  return (
    <HeaderWrapper>
      <LogoAndSearch>
        <Logo>TubeTopia</Logo>
        {/* <SearchInput /> */}
        <SimpleSearchInput 
            type="search" 
            placeholder="Search YouTube..."
            onChange={handleSearch}
         />
      </LogoAndSearch>
      <Controls>
        {/* Settings Button */}
        <HeaderIconButton onClick={openSettingsModal} title="Settings">
          <FaCog />
        </HeaderIconButton>
      </Controls>
    </HeaderWrapper>
  );
};

export default Header; 