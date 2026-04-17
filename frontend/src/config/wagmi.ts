import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { coinbaseWallet, metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

/** 
 * @dev Account Abstraction (ERC-4337) Integration
 * Setup: Coinbase Smart Wallet with 'smartWalletOnly' preference.
 * Enables Passkey/Biometric authentication for zero-friction Web3 onboarding.
 */
coinbaseWallet.preference = 'smartWalletOnly';

export const config = getDefaultConfig({
  appName: 'Qurate',
  projectId: '08ef4dc84dc4cd2c5a8c729e592ae83a', // A real ID from cloud.walletconnect.com for production
  wallets: [
    {
      groupName: 'Smart Wallets (Gasless/Passkeys)',
      wallets: [coinbaseWallet],
    },
    {
      groupName: 'Traditional Wallets',
      wallets: [metaMaskWallet, walletConnectWallet],
    },
  ],
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
