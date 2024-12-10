export interface EthereumNetwork {
  chainId: string; // Chain ID (e.g., "0x5" for Goerli)
  chainName: string; // Network name
  rpcUrls: string[]; // RPC URLs for the network
  nativeCurrency: {
    name: string; // Native token name (e.g., "Ethereum")
    symbol: string; // Symbol (e.g., "ETH")
    decimals: number; // Decimals (e.g., 18)
  };
  blockExplorerUrls?: string[]; // Block explorer URLs
}