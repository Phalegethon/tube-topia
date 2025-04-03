'use client';

import React from 'react';
import styled from 'styled-components';
import ChannelList from './ChannelList';
import ChannelForm from './ChannelForm';
import useUIStore from '@/store/uiStore'; // Yeni store'u import et

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

  &:last-child {
    padding-top: ${({ theme }) => theme.spacing.small}; // Hafif üst boşluk
    padding-bottom: 0;
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
    </SidebarWrapper>
  );
};

export default Sidebar; 