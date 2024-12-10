import { BaseWallet, CosmosWallet, EthereumWallet, MultiChainWallet } from "@interchain-kit/core";
import { keplrExtensionInfo } from "./registry";
import { Chain } from "@chain-registry/v2-types";


export * from './registry'

const NetworkWalletMap = new Map<Chain['chainType'], BaseWallet>()

NetworkWalletMap.set('cosmos', new CosmosWallet(keplrExtensionInfo))
NetworkWalletMap.set('eip155', new EthereumWallet(keplrExtensionInfo))

const keplrWallet = new MultiChainWallet(keplrExtensionInfo, NetworkWalletMap);

export { keplrWallet }