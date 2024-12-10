import { EthereumWallet } from "@interchain-kit/core";
import { MetaMaskExtensionInfo } from "./registry";

export * from './constant'
export * from './registry'

const metaMaskExtension = new EthereumWallet(MetaMaskExtensionInfo)

export { metaMaskExtension }