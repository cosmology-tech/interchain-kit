
import { AssetList, Chain } from '@chain-registry/v2-types';
import { OfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { Wallet, WalletAccount } from '../types';
import { BaseWallet } from './base-wallet';

export class MultiChainWallet extends BaseWallet {

  networkWalletMap: Map<Chain['chainType'], BaseWallet> = new Map()
  chainMap: Map<Chain['chainId'], Chain> = new Map()

  constructor(info?: Wallet, networkWalletMap?: Map<Chain['chainType'], BaseWallet>) {
    super(info);
    this.networkWalletMap = networkWalletMap;
  }

  setChainMap(chains: Chain[]): void {
    this.chainMap = new Map(chains.map(chain => [chain.chainId, chain]))
    this.networkWalletMap.forEach(wallet => {
      wallet.setChainMap(chains)
    })
  }

  setAssetLists(assetLists: AssetList[]): void {
    this.networkWalletMap.forEach(wallet => {
      wallet.setAssetLists(assetLists)
    })
  }

  async init(): Promise<void> {
    const wallets = Array.from(this.networkWalletMap.values());
    await Promise.all(wallets.map(async wallet => {
      try {
        await wallet.init()
      } catch (error) {
        this.errorMessage = (error as any).message
      }
    }));

    window.addEventListener(this.info.keystoreChange, (event) => {
      this.events.emit('accountChanged', event)
    })
  }
  getWalletByChainType(chainType: Chain['chainType']): BaseWallet {
    return this.networkWalletMap.get(chainType);
  }
  async connect(chainId: Chain['chainId'] | Chain['chainId'][]): Promise<void> {
    const chainIds = Array.isArray(chainId) ? chainId : [chainId];
    await Promise.all(chainIds.map(async chainId => {
      try {
        const chain = this.getChainById(chainId);
        const networkWallet = this.getWalletByChainType(chain.chainType);
        await networkWallet.connect(chainId);
      } catch (error) {
        this.errorMessage = (error as any).message
        await this.addSuggestChain(chainId as string)
      }
    }))
  }
  async disconnect(chainId: Chain['chainId'] | Chain['chainId'][]): Promise<void> {
    const chainIds = Array.isArray(chainId) ? chainId : [chainId];
    await Promise.all(chainIds.map(async chainId => {
      try {
        const chain = this.getChainById(chainId);
        const networkWallet = this.getWalletByChainType(chain.chainType);
        await networkWallet.disconnect(chainId);
      } catch (error) {
        this.errorMessage = (error as any).message
      }
    }))
  }
  getAccount(chainId: Chain['chainId']): Promise<WalletAccount> {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    return networkWallet.getAccount(chainId);
  }
  getOfflineSigner(chainId: Chain['chainId']): OfflineSigner {
    const chain = this.getChainById(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    return networkWallet.getOfflineSigner(chainId);
  }
  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.chainMap.get(chainId);
    const networkWallet = this.getWalletByChainType(chain.chainType);
    return networkWallet.addSuggestChain(chainId);
  }
}