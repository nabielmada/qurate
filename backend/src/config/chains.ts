export interface ChainConfig {
  network: string;
  coingeckoId: string;
  nativeSymbol: string;
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  Ethereum: {
    network: 'eth-mainnet',
    coingeckoId: 'ethereum',
    nativeSymbol: 'ETH',
  },
  Polygon: {
    network: 'polygon-mainnet',
    coingeckoId: 'matic-network',
    nativeSymbol: 'POL',
  },
  Base: {
    network: 'base-mainnet',
    coingeckoId: 'ethereum',
    nativeSymbol: 'ETH',
  },
  'Base Sepolia': {
    network: 'base-sepolia',
    coingeckoId: 'ethereum',
    nativeSymbol: 'ETH',
  },
  Arbitrum: {
    network: 'arb-mainnet',
    coingeckoId: 'ethereum',
    nativeSymbol: 'ETH',
  },
};
