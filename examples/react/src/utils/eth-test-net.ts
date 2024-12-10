
import { AssetList, Chain } from "@chain-registry/v2-types";
import ethereumChain from '@chain-registry/v2/mainnet/ethereum/chain'

type EthereumChainConfig = {
  chainId: string; // Chain ID in hexadecimal format
  chainName: string; // Human-readable name of the chain
  rpcUrls: string[]; // Array of RPC URLs for the chain
  nativeCurrency: {
    name: string; // Name of the native currency (e.g., "Goerli ETH")
    symbol: string; // Symbol of the native currency (e.g., "ETH")
    decimals: number; // Number of decimals for the native currency
  };
  blockExplorerUrls?: string[]; // Optional array of block explorer URLs
};

export const createChainFromEthereumChainInfo = (etherChainInfo: EthereumChainConfig): Chain => {
  const newChain = {
    ...ethereumChain,
    chainId: etherChainInfo.chainId,
    chainName: etherChainInfo.chainName,
    apis: {
      rpc: etherChainInfo.rpcUrls.map((address) => ({ address })),
    },
  }
  return newChain
}

export const createAssetListFromEthereumChainInfo = (etherChainInfo: EthereumChainConfig): AssetList => {
  return {
    $schema: '../../assetlist.schema.json',
    chainName: etherChainInfo.chainName,
    assets: [
      {
        description: 'Ethereum is a decentralized blockchain platform for running smart contracts and dApps, with Ether (ETH) as its native cryptocurrency, enabling a versatile ecosystem beyond just digital currency.',
        extendedDescription: 'Ethereum, symbolized as ETH, is a groundbreaking cryptocurrency and blockchain platform introduced in 2015 by a team led by Vitalik Buterin. Unlike Bitcoin, which primarily serves as a digital currency, Ethereum is designed to be a decentralized platform for running smart contracts and decentralized applications (dApps). These smart contracts are self-executing contracts with the terms directly written into code, enabling trustless and automated transactions without intermediaries. Ethereum\'s blockchain can host a wide variety of applications, from financial services to gaming, making it a versatile and powerful tool in the world of blockchain technology.\n\nOne of the most notable features of Ethereum is its native cryptocurrency, Ether (ETH), which is used to pay for transaction fees and computational services on the network. Ethereum has also been the backbone for the explosive growth of decentralized finance (DeFi), which seeks to recreate traditional financial systems with blockchain-based alternatives. Additionally, Ethereum is undergoing a significant upgrade known as Ethereum 2.0, which aims to improve scalability, security, and energy efficiency through a shift from proof-of-work (PoW) to proof-of-stake (PoS) consensus mechanisms. This transition is expected to enhance the network\'s performance and reduce its environmental impact, further solidifying Ethereum\'s position as a leading platform in the blockchain ecosystem.',
        denomUnits: [
          {
            denom: 'wei',
            exponent: 0
          },
          {
            denom: 'gwei',
            exponent: 9
          },
          {
            denom: 'eth',
            exponent: etherChainInfo.nativeCurrency.decimals,
            aliases: ['ether']
          }
        ],
        typeAsset: 'evm-base',
        base: 'wei',
        name: etherChainInfo.chainName,
        display: 'eth',
        symbol: etherChainInfo.nativeCurrency.symbol,
        logoURIs: {
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png',
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg'
        },
        coingeckoId: 'ethereum',
        images: [{
          png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png',
          svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg',
          theme: {
            primaryColorHex: '#303030'
          }
        }]
      }
    ]
  }
}

