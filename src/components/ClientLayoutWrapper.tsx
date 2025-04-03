'use client';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from '@/styles/GlobalStyles';
import theme from '@/styles/theme';

// Bu bileşen ThemeProvider ve GlobalStyles'ı sarmalar
// ve client component olarak işaretlenir.
export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
} 