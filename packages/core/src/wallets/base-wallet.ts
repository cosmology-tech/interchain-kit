import { AssetList, Chain } from "@chain-registry/v2-types";
import { OfflineSigner } from "@interchainjs/cosmos/types/wallet"
import { Wallet, WalletAccount, WalletEvents, WalletState } from "../types";
import EventEmitter from "events";


export abstract class BaseWallet {
  info: Wallet
  errorMessage: string
  walletState: WalletState
  events: EventEmitter<WalletEvents> = new EventEmitter()
  chainMap: Map<Chain['chainId'], Chain>
  assetLists: AssetList[] = []
  client: any
  constructor(info: Wallet) {
    this.info = info
  }
  setChainMap(chains: Chain[]) {
    this.chainMap = new Map(chains.map(chain => [chain.chainId, chain]))
  }
  setAssetLists(assetLists: AssetList[]) {
    this.assetLists = assetLists
  }
  getChainById(chainId: Chain['chainId']): Chain {
    return this.chainMap.get(chainId);
  }
  abstract init(): Promise<void>
  abstract connect(chainId: Chain['chainId'] | Chain['chainId'][]): Promise<void>
  abstract disconnect(chainId: Chain['chainId'] | Chain['chainId'][]): Promise<void>
  abstract getAccount(chainId: Chain['chainId']): Promise<WalletAccount>
  abstract getOfflineSigner(chainId: Chain['chainId']): OfflineSigner
  abstract addSuggestChain(chainId: string): Promise<void>
}