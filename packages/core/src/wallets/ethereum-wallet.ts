import { Chain } from "@chain-registry/v2-types";
import { OfflineSigner } from "@interchainjs/cosmos/types/wallet";
import { WalletAccount } from "../types";
import { BaseWallet } from "./base-wallet";
import { delay, getClientFromExtension } from "../utils";
import { EthereumNetwork } from "../types/ethereum";

export class EthereumWallet extends BaseWallet {

  ethereum: any

  isSwitchingNetwork: boolean = false

  async init(): Promise<void> {
    try {
      this.ethereum = await getClientFromExtension(this.info.ethereumKey)
    } catch (error) {
      this.errorMessage = (error as any).message
      throw error
    }
  }
  async connect(chainId: Chain["chainId"] | Chain["chainId"][]): Promise<void> {
    const chainIds = Array.isArray(chainId) ? chainId : [chainId]
    await Promise.all(chainIds.map(async (chainId) => {
      try {
        await this.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        })
      } catch (error) {
        if ((error as any).message.includes("Unrecognized chain ID")) {
          await this.addSuggestChain(chainId as string)
        }
      }
    }))
  }
  async disconnect(chainId: Chain["chainId"] | Chain["chainId"][]): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async switchChain(chainId: string): Promise<void> {
    if (this.isSwitchingNetwork) {
      while (true) {
        await delay(10)
        if (!this.isSwitchingNetwork) {
          break
        }
      }
    } else {
      try {
        this.isSwitchingNetwork = true
        await this.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        })
      } catch (error) {

      } finally {
        this.isSwitchingNetwork = false
      }
    }
  }
  async getAccount(chainId: Chain["chainId"]): Promise<WalletAccount> {
    await this.switchChain(chainId)
    const accounts = await this.ethereum.request({ method: 'eth_requestAccounts', params: [{ chainId }] })
    console.log({ chainId, accounts })
    return {
      address: accounts[0],
      pubkey: new Uint8Array(),
      algo: 'eth_secp256k1',
      isNanoLedger: false,
      isSmartContract: false,
      username: 'ethereum'
    }
  }
  getOfflineSigner(chainId: Chain["chainId"]): OfflineSigner {
    throw new Error("Method not implemented.");
  }
  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.chainMap.get(chainId)
    const assetList = this.assetLists.find(assetList => assetList.chainName === chain.chainName)
    const network: EthereumNetwork = {
      chainId: chain.chainId,
      chainName: chain.chainName,
      rpcUrls: chain.apis.rpc.map(api => api.address),
      nativeCurrency: {
        name: chain.chainName,
        symbol: assetList.assets[0].symbol,
        decimals: assetList.assets[0].denomUnits.find(unit => unit.denom === 'eth').exponent
      },
      blockExplorerUrls: chain.explorers.map(explorer => explorer.url)
    }
    try {
      await this.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [network],
      });
      console.log(`Network ${network.chainName} added successfully.`);
    } catch (error) {
      console.error(`Failed to add network: ${(error as any).message}`);
      throw error;
    }
  }
  async getBalance(chainId: string) {
    try {
      await this.switchChain(chainId)
      const account = await this.getAccount(chainId)
      const result = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [account.address, 'latest']
      })
      return result
    } catch (error) {
      console.log(error)
      throw error
    }

  }
  async sendTransaction(transaction: any) {
    try {
      const result = await this.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: '',
          from: '',
          value: '',
          data: ''
        }]
      })

      return result
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  async add10() {
    return 10
  }
}