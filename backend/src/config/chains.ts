export interface ChainConfig {
  network: string;
  coingeckoId: string;
  nativeSymbol: string;
  enabled: boolean; // false = skip live RPC, use static fallback instead
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  Ethereum: {
    network: 'eth-mainnet',
    coingeckoId: 'ethereum',
    nativeSymbol: 'ETH',
    enabled: false, // ETH_MAINNET not enabled on this Alchemy key
  },
  Polygon: {
    network: 'polygon-mainnet',
    coingeckoId: 'matic-network',
    nativeSymbol: 'POL',
    enabled: true,
  },
  Base: {
    network: 'base-mainnet',
    coingeckoId: 'ethereum',
    nativeSymbol: 'ETH',
    enabled: true,
  },
  'Base Sepolia': {
    network: 'base-sepolia',
    coingeckoId: 'ethereum',
    nativeSymbol: 'ETH',
    enabled: true,
  },
  Arbitrum: {
    network: 'arb-mainnet',
    coingeckoId: 'ethereum',
    nativeSymbol: 'ETH',
    enabled: false, // ARB_MAINNET not enabled on this Alchemy key
  },
};
