'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import ChannelList from './ChannelList';
import ChannelForm from './ChannelForm';
import useUIStore from '@/store/uiStore';
import { FaLinkedin, FaTimes } from 'react-icons/fa';

const SidebarWrapper = styled.aside<{ $isVisible: boolean }>`
  width: 250px;
  height: calc(100vh - 60px); // Header yüksekliğini çıkar
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); // Hafif gölge eklendi
  display: flex;
  flex-direction: column;
  background-color: #111827; // Çok koyu mavi/gri arka plan
  transition: margin-left 0.3s ease-in-out;
  margin-left: ${({ $isVisible }) => ($isVisible ? '0' : '-251px')}; // Görünürlüğe göre margin ayarla
  flex-shrink: 0; // Boyutunun küçülmesini engelle
  z-index: 10; // Diğer içeriklerin üzerinde kalması için
  border-right: 1px solid #374151; // Header ile aynı sınır çizgisi
`;

const Section = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  padding-bottom: ${({ theme }) => theme.spacing.small}; // Alt boşluk azaltıldı
  
  /* Kanal listesi bölümü için özel stiller */
  &.channel-list-section {
    display: flex; // İçeriği dikey yönetmek için
    flex-direction: column;
    flex-grow: 1; // Kalan alanı doldur
    overflow: hidden; // İç scroll için önemli
    padding-top: ${({ theme }) => theme.spacing.small}; // Üst boşluk ayarı
  }

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.medium}; 
    padding-bottom: ${({ theme }) => theme.spacing.small};
    border-bottom: 1px solid #4B5563; 
    font-size: 0.75rem; 
    font-weight: 700;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    flex-shrink: 0; // Başlık küçülmesin
  }
`;

// Footer için yeni styled component
const FooterSection = styled.div`
    margin-top: auto; // Üstteki elemanları iterek en alta yerleşir
    padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
    border-top: 1px solid #374151; // Üst sınır çizgisi
    flex-shrink: 0; // Footer'ın küçülmesini engelle
`;

// Reset butonu için container
const ResetContainer = styled.div`
    padding-bottom: ${({ theme }) => theme.spacing.small};
    margin-bottom: ${({ theme }) => theme.spacing.small};
    border-bottom: 1px dashed #4B5563; // Ayırıcı çizgi
    display: flex;
    justify-content: center;
`;

const ResetButton = styled.button`
    background-color: #4B5563; // Koyu gri buton
    color: #D1D5DB;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.small};
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
        background-color: #6B7280;
        color: #F3F4F6;
    }

    &:active {
        background-color: #4B5563;
    }
`;

const CopyrightContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CopyrightText = styled.p`
    font-size: 0.7rem;
    color: #6B7280; // Daha soluk bir renk
    margin: 0;
`;

const LinkedInLink = styled.a`
    color: #9CA3AF; // İkon rengi
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        color: #E5E7EB; // Hover rengi
    }
`;

// Arama alanı için stiller
const SearchContainer = styled.div`
    position: relative;
    margin-bottom: ${({ theme }) => theme.spacing.small};
    flex-shrink: 0; // Arama alanı küçülmesin
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 6px 28px 6px 10px; // Sağda temizleme butonu için boşluk
    border: 1px solid #4B5563;
    border-radius: 4px;
    background-color: #374151;
    color: #F3F4F6;
    font-size: 0.8rem;
    outline: none;
    box-sizing: border-box;

    &:focus {
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
    }
`;

const ClearSearchButton = styled.button`
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    
    &:hover {
        color: #F3F4F6;
    }
`;

// Kanal listesinin kendisi için scrollable container
const ChannelListWrapper = styled.div`
    flex-grow: 1; // Kalan alanı doldur
    overflow-y: auto; // Dikey scroll
    margin-right: -${({ theme }) => theme.spacing.medium}; // Sağdaki padding'i dengele (scrollbar için)
    padding-right: ${({ theme }) => theme.spacing.medium}; // Scrollbar boşluğu
    /* Scrollbar stilleri (opsiyonel) */
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #4B5563; // Scrollbar rengi
        border-radius: 3px;
    }
`;

const Sidebar = () => {
  const { isChannelListVisible } = useUIStore();
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearchTerm(e.target.value);
  }

  return (
    <SidebarWrapper $isVisible={isChannelListVisible}>
      <Section>
        <h3>Add Channel</h3>
        <ChannelForm />
      </Section>
      <Section className="channel-list-section">
        <h3>Saved Channels</h3>
        <SearchContainer>
          <SearchInput 
            type="text" 
            placeholder="Search saved channels..."
            value={localSearchTerm}
            onChange={handleLocalSearchChange}
          />
          {localSearchTerm && (
            <ClearSearchButton onClick={() => setLocalSearchTerm('')} title="Clear search">
              <FaTimes />
            </ClearSearchButton>
          )}
        </SearchContainer>
        
        <ChannelListWrapper>
          <ChannelList searchTerm={localSearchTerm} />
        </ChannelListWrapper>
      </Section>
      <FooterSection>
          <CopyrightContainer>
              <CopyrightText>© S. Gürkan Süerdem 2025</CopyrightText>
              <LinkedInLink href="https://www.linkedin.com/in/sgsuerdem/" target="_blank" rel="noopener noreferrer" title="LinkedIn Profili">
                  <FaLinkedin />
              </LinkedInLink>
          </CopyrightContainer>
      </FooterSection>
    </SidebarWrapper>
  );
};

export default Sidebar; 