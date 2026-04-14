"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';

export const DUMMY_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // Vitalik

interface WalletContextType {
  address: string | undefined;
  isGuest: boolean;
  setGuestMode: () => void;
  isConnected: boolean;
  logout: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  const setGuestMode = () => {
    setIsGuest(true);
    router.push('/user'); // Auto redirect to dashboard as per user request
  };

  const logout = () => {
    setIsGuest(false);
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
      logout
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
