import { HttpEndpoint } from '@interchainjs/types';
import { Chain, AssetList } from '@chain-registry/v2-types'
import { BaseWallet } from './wallets/base-wallet';
import { WCWallet } from './wc-wallet';
import { ChainName, DeviceType, DownloadInfo, EndpointOptions, OS, SignerOptions, WalletManagerState, WalletState } from './types'
import { ChainNameNotExist, createObservable, getValidRpcEndpoint, getWalletNameFromLocalStorage, NoValidRpcEndpointFound, removeWalletNameFromLocalStorage, setWalletNameToLocalStorage, WalletNotExist } from './utils'
import { AminoGeneralOfflineSigner, DirectGeneralOfflineSigner, ICosmosGeneralOfflineSigner } from '@interchainjs/cosmos/types/wallet';
import { SignerOptions as InterchainSignerOptions } from '@interchainjs/cosmos/types/signing-client';
import { SigningClient } from '@interchainjs/cosmos/signing-client'
import Bowser from 'bowser';

export class WalletManager {
  chains: Chain[] = []
  assetLists: AssetList[] = []
  wallets: BaseWallet[] = []
  currentWalletName: string | undefined
  signerOptions: SignerOptions | undefined
  endpointOptions: EndpointOptions | undefined
  rpcEndpoint: Record<string, string | HttpEndpoint> = {}
  restEndpoint: Record<string, string | HttpEndpoint> = {}
  state: WalletManagerState = WalletManagerState.Initializing

  constructor(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,

    onUpdate?: () => void
  ) {
    this.chains = chain
    this.assetLists = assetLists
    this.wallets = wallets.map(wallet => createObservable(wallet, onUpdate))
    this.signerOptions = signerOptions
    this.endpointOptions = endpointOptions

    return createObservable(this, onUpdate)
  }

  async init() {
    this.state = WalletManagerState.Initializing

    await Promise.all(this.wallets.map(async (wallet) => {
      wallet.setChainMap(this.chains)
      wallet.setAssetLists(this.assetLists)
      return wallet.init()
    }))

    const loggedWallet = getWalletNameFromLocalStorage()
    if (loggedWallet) {
      await this.connect(loggedWallet)
    }

    this.state = WalletManagerState.Initialized
  }

  static async create(
    chain: Chain[],
    assetLists: AssetList[],
    wallets: BaseWallet[],
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,
    onUpdate?: () => void
  ) {
    const wm = new WalletManager(chain, assetLists, wallets, signerOptions, endpointOptions, onUpdate)
    await wm.init()
    return wm
  }

  async connect(walletName: string) {

    const wallet = this.wallets.find(wallet => wallet.info.name === walletName)

    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    this.currentWalletName = walletName
    wallet.errorMessage = ''
    wallet.walletState = WalletState.Connecting

    try {

      await wallet.connect(this.chains.map(chain => chain.chainId))

      wallet.walletState = WalletState.Connected

      setWalletNameToLocalStorage(walletName)

    } catch (error: any) {
      wallet.walletState = WalletState.Rejected
      wallet.errorMessage = error.message
      throw error
    }
  }

  async disconnect(walletName: string) {
    const wallet = this.wallets.find(wallet => wallet.info.name === walletName)

    if (wallet instanceof WCWallet) {
      await wallet.disconnect()
    } else {
      await wallet.disconnect(this.chains.map(chain => chain.chainId))
    }
    wallet.walletState = WalletState.Disconnected

    removeWalletNameFromLocalStorage()
  }

  getCurrentWallet() {
    return this.wallets.find(wallet => wallet.info.name === this.currentWalletName)
  }

  addChain(chain: Chain) {
    this.chains.push(chain)
  }

  getChainLogoUrl(chainName: ChainName) {
    const assetList = this.assetLists.find(assetList => assetList.chainName === chainName)
    return assetList?.assets?.[0].logoURIs?.png || assetList?.assets?.[0].logoURIs?.svg || undefined
  }

  getWalletByName(walletName: string): BaseWallet {
    return this.wallets.find(wallet => wallet.info.name === walletName)
  }

  getChainByName(chainName: string): Chain {
    const chain = this.chains.find(chain => chain.chainName === chainName)
    return chain
  }

  getRpcEndpoint = async (wallet: BaseWallet, chainName: string) => {
    const cacheKey = `${chainName}`
    const cachedRpcEndpoint = this.rpcEndpoint[cacheKey]
    if (cachedRpcEndpoint) {
      return cachedRpcEndpoint
    }

    const chain = this.getChainByName(chainName)

    const providerRpcEndpoints = this.endpointOptions?.endpoints?.[chain.chainName]?.rpc || []
    // const walletRpcEndpoints = wallet?.info?.endpoints?.[chain.chainName]?.rpc || []
    const chainRpcEndpoints = chain.apis.rpc.map(url => url.address)


    if (providerRpcEndpoints?.[0]) {
      this.rpcEndpoint[cacheKey] = providerRpcEndpoints[0]
      return this.rpcEndpoint[cacheKey]
    }

    const validRpcEndpoint = await getValidRpcEndpoint([...providerRpcEndpoints, ...chainRpcEndpoints])

    if (validRpcEndpoint === '') {
      throw new NoValidRpcEndpointFound()
    }

    this.rpcEndpoint[cacheKey] = validRpcEndpoint
    return validRpcEndpoint
  }

  initRpcEndpoint = async () => {
    const promises = []
    for (const chain of this.chains) {
      promises.push(this.getRpcEndpoint(null, chain.chainName))
    }
    await Promise.all(promises)
  }

  getPreferSignType(chainName: string) {
    return this.signerOptions?.preferredSignType?.(chainName) || 'amino'
  }

  getSignerOptions(chainName: string): InterchainSignerOptions {
    return this.signerOptions?.signing?.(chainName) || {}
  }

  getOfflineSigner(wallet: BaseWallet, chainName: string): ICosmosGeneralOfflineSigner {
    const chain = this.getChainByName(chainName)
    const signType = this.getPreferSignType(chainName)
    // if (signType === 'direct') {
    //   const direct = wallet.getOfflineSignerDirect(chain.chainId)
    //   return new DirectGeneralOfflineSigner(direct)
    // } else {
    //   const amino = wallet.getOfflineSignerAmino(chain.chainId)
    //   return new AminoGeneralOfflineSigner(amino)
    // }
    return {} as unknown as ICosmosGeneralOfflineSigner
  }

  async getAccount(walletName: string, chainName: ChainName) {

    const chain = this.chains.find(c => c.chainName === chainName)
    const wallet = this.wallets.find(w => w.info.name === walletName)

    if (!chain) {
      throw new ChainNameNotExist(chainName)
    }

    if (!wallet) {
      throw new WalletNotExist(walletName)
    }

    return wallet.getAccount(chain.chainId)
  }

  async getInterchainSignerOptions(walletName: string, chainName: string) {
    const wallet = this.getWalletByName(walletName)
    const chain = this.getChainByName(chainName)
    const rpcEndpoint = await this.getRpcEndpoint(wallet, chainName)
    const offlineSigner = this.getOfflineSigner(wallet, chainName)
    const signerOptions = this.getSignerOptions(chainName)
    const options: InterchainSignerOptions = {
      prefix: chain.bech32Prefix,
      broadcast: {
        checkTx: true,
        deliverTx: false,
      },
      ...signerOptions,
    }
    return {
      rpcEndpoint,
      offlineSigner,
      options
    }
  }

  isWalletConnected = (walletName: string) => {
    return this.getWalletByName(walletName)?.walletState === WalletState.Connected
  }

  async getSigningClient(walletName: string, chainName: ChainName): Promise<SigningClient> {
    if (!this.isWalletConnected(walletName)) return null
    const { rpcEndpoint, offlineSigner, options } = await this.getInterchainSignerOptions(walletName, chainName)
    return SigningClient.connectWithSigner(rpcEndpoint, offlineSigner, options)
  }

  getEnv() {
    const parser = Bowser.getParser(window.navigator.userAgent)
    const env = {
      browser: parser.getBrowserName(true),
      device: (parser.getPlatform().type || 'desktop') as DeviceType,
      os: parser.getOSName(true) as OS,
    }
    return env
  }

  getDownloadLink(walletName: string) {
    const env = this.getEnv()
    const wallet = this.getWalletByName(walletName)
    return wallet.info.downloads.find((d: DownloadInfo) => {
      if (d.device === 'desktop') {
        return d.browser === env.browser
      } else if (d.device === 'mobile') {
        return d.os === env.os
      } else {
        return null
      }
    })
  }

}