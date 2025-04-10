'use client';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from '@/styles/GlobalStyles';
import theme from '@/styles/theme';
import useUIStore from '@/store/uiStore';
import SettingsModal from './SettingsModal';

// Bu bileşen ThemeProvider ve GlobalStyles'ı sarmalar
// ve client component olarak işaretlenir.
export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isSettingsModalOpen, closeSettingsModal } = useUIStore();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={closeSettingsModal} 
      />
    </ThemeProvider>
  );
} 