"use client";

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from '@/config/wagmi';
import { WalletProvider } from '@/context/WalletContext';
import { ThemeProvider, useTheme } from 'next-themes';

import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function RainbowThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <RainbowKitProvider 
      theme={isDark ? darkTheme({ accentColor: '#3b82f6', borderRadius: 'large'}) : lightTheme({ accentColor: '#2563eb', borderRadius: 'large' })}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowThemeWrapper>
            <WalletProvider>
              {children}
            </WalletProvider>
          </RainbowThemeWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
