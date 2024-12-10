import { CosmosWallet, EthereumWallet, MultiChainWallet } from '@interchain-kit/core';
import { trustExtensionInfo } from "./registry";


export * from './registry'

const NetworkWallet = new Map()

NetworkWallet.set('cosmos', new CosmosWallet(trustExtensionInfo))
NetworkWallet.set('eip155', new EthereumWallet(trustExtensionInfo))

const trustExtension = new MultiChainWallet(trustExtensionInfo, NetworkWallet);

export { trustExtension }