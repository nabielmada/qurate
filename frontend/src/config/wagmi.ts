import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Qurate',
  projectId: '08ef4dc84dc4cd2c5a8c729e592ae83a', // Replace with a real ID from cloud.walletconnect.com for production
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: true,
});
