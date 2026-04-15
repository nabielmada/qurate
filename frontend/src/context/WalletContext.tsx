"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';

export const DUMMY_ADDRESS = "0xGUEST";

export type CurrencyCode = 'IDR' | 'USD' | 'MYR' | 'SGD' | 'EUR';

interface WalletContextType {
  address: string | undefined;
  isGuest: boolean;
  setGuestMode: () => void;
  isConnected: boolean;
  logout: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();
  
  // Default to USD for global appeal
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  // Persistence
  useEffect(() => {
    // 1. Load Currency
    const savedCurrency = localStorage.getItem('qurate_currency') as CurrencyCode;
    if (savedCurrency) setCurrencyState(savedCurrency);

    // 2. Load Guest Mode
    const savedGuest = localStorage.getItem('qurate_is_guest');
    if (savedGuest === 'true') setIsGuest(true);
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('qurate_currency', c);
  };

  const setGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('qurate_is_guest', 'true');
    router.push('/user'); 
  };

  const logout = () => {
    setIsGuest(false);
    localStorage.removeItem('qurate_is_guest');
    disconnect();
    router.push('/');
  };

  // If user connects wallet, turn off guest mode
  useEffect(() => {
    if (isConnected) {
      setIsGuest(false);
    }
  }, [isConnected]);

  const activeAddress = isGuest ? DUMMY_ADDRESS : (wagmiAddress || undefined);

  return (
    <WalletContext.Provider value={{ 
      address: activeAddress, 
      isGuest, 
      setGuestMode,
      isConnected: isConnected && !isGuest,
      logout,
      currency,
      setCurrency
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
