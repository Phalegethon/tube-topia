'use client';

import React from 'react';
import styled from 'styled-components';
import ChannelList from './ChannelList';
import ChannelForm from './ChannelForm';
import useUIStore from '@/store/uiStore'; // Yeni store'u import et
import { FaLinkedin } from 'react-icons/fa'; // LinkedIn ikonu eklendi

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
  padding: ${({ theme }) => theme.spacing.medium}; // Padding biraz artırıldı

  &:not(:last-of-type) { // Sadece son olmayan section için geçerli
    padding-bottom: ${({ theme }) => theme.spacing.small}; // Alt boşluk azaltıldı
  }
  
  // Buradaki flex-grow kaldırıldı, Footer'a taşındı
  &:last-of-type {
    flex-grow: 1;
    overflow-y: auto;
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
  }

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.medium}; // Boşluk artırıldı
    padding-bottom: ${({ theme }) => theme.spacing.small}; // Boşluk ayarlandı
    border-bottom: 1px solid #4B5563; // Daha belirgin sınır çizgisi
    font-size: 0.75rem; // Font boyutu küçültüldü
    font-weight: 700; // Daha kalın
    color: #9CA3AF; // Açık gri başlık rengi
    text-transform: uppercase;
    letter-spacing: 0.8px; // Harf aralığı artırıldı
  }
`;

// Footer için yeni styled component
const FooterSection = styled.div`
    margin-top: auto; // Üstteki elemanları iterek en alta yerleşir
    padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
    border-top: 1px solid #374151; // Üst sınır çizgisi
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0; // Küçülmesini engelle
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

const Sidebar = () => {
  const { isChannelListVisible } = useUIStore(); // State'i al

  return (
    <SidebarWrapper $isVisible={isChannelListVisible}> { /* State'i prop olarak geçir */ }
      <Section>
        <h3>Add Channel</h3>
        <ChannelForm />
      </Section>
      <Section>
        <h3>Saved Channels</h3>
        <ChannelList />
      </Section>
      {/* Footer eklendi */}
      <FooterSection>
          <LinkedInLink href="https://www.linkedin.com/in/sgsuerdem/" target="_blank" rel="noopener noreferrer" title="LinkedIn Profili">
              <FaLinkedin />
          </LinkedInLink>
          <CopyrightText>S. Gürkan Süerdem</CopyrightText>
          <CopyrightText>2025<sup>©</sup></CopyrightText>
      </FooterSection>
    </SidebarWrapper>
  );
};

export default Sidebar; 