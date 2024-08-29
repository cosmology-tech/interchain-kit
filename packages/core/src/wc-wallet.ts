import { SimpleAccount, Wallet, WcEventTypes, WcProviderEventType } from './types/wallet';
import { BaseWallet } from "./base-wallet";
import { WalletAccount, SignOptions, DirectSignDoc, BroadcastMode } from "./types";
import { SignClient } from '@walletconnect/sign-client';
import { ISignClient, SessionTypes } from '@walletconnect/types';
import { Buffer } from 'buffer'
import { ChainInfo } from '@keplr-wallet/types'
import {
  OfflineAminoSigner,
  OfflineDirectSigner,
} from '@interchainjs/cosmos/types/wallet';
import { AminoSignResponse, StdSignature, DirectSignResponse } from '@interchainjs/cosmos/types/wallet';
import { StdSignDoc } from '@interchainjs/types'

export class WCWallet extends BaseWallet {

  pairingUri: string;

  session: SessionTypes.Struct;

  signClient: ISignClient

  constructor(option?: Wallet) {
    const defaultWalletConnectOption: Wallet = {
      name: 'WalletConnect',
      prettyName: 'Wallet Connect',
      mode: 'wallet-connect'
    }

    super({ ...defaultWalletConnectOption, ...option })
  }

  override async init(): Promise<void> {
    this.events.removeAllListeners()
    this.signClient = await SignClient.init({
      projectId: '15a12f05b38b78014b2bb06d77eecdc3',
      // optional parameters
      relayUrl: 'wss://relay.walletconnect.org',
      metadata: {
        name: 'Example Dapp',
        description: 'Example Dapp',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    })
  }

  async connect(chainIds: string | string[], onApprove?: () => void, onGenerateParingUri?: (uri: string) => void) {

    const chainIdsWithNS = Array.isArray(chainIds) ? chainIds.map((chainId) => `cosmos:${chainId}`) : [`cosmos:${chainIds}`]

    try {
      const { uri, approval } = await this.signClient.connect({
        requiredNamespaces: {
          cosmos: {
            methods: [
              'cosmos_getAccounts',
              'cosmos_signAmino',
              'cosmos_signDirect',
            ],
            chains: chainIdsWithNS,
            events: ['chainChanged', 'accountsChanged']
          },
        }

      })

      this.pairingUri = uri

      onGenerateParingUri(uri)

      const session = await approval()
      this.session = session

      onApprove()

    } catch (error) {
      throw error
    }
  }

  async disconnect(): Promise<void> {
    this.session = null
    this.pairingUri = null
  }

  getAccounts(): Promise<WalletAccount[]> {
    const accounts: WalletAccount[] = []

    const namespaces = this.session.namespaces

    Object.entries(namespaces).forEach(([namespace, session]: [string, SessionTypes.BaseNamespace]) => {
      session.accounts.forEach((account: string) => {
        const [namespace, chainId, address] = account.split(':')
        accounts.push({
          address: address,
          algo: 'secp256k1',
          pubkey: null,
          username: '',
          isNanoLedger: null,
          isSmartContract: null
        })
      })
    })

    return Promise.resolve(accounts)
  }

  override async getSimpleAccount(chainId: string): Promise<SimpleAccount> {
    const accounts: SimpleAccount[] = []

    const namespaces = this.session.namespaces

    Object.entries(namespaces).forEach(([namespace, session]: [string, SessionTypes.BaseNamespace]) => {
      session.accounts.forEach((account: string) => {
        const [namespace, chainId, address] = account.split(':')
        accounts.push({
          namespace,
          chainId,
          address,
        })
      })
    })

    return Promise.resolve(accounts.find((account) => account.chainId === chainId))
  }

  override async getAccount(chainId: string): Promise<WalletAccount> {
    if (!this.signClient) {
      return;
    }
    const accounts = await this.signClient.request({
      topic: this.session?.topic,
      request: {
        method: 'cosmos_getAccounts',
        params: {}
      },
      chainId: `cosmos:${chainId}`
    }) as any[]

    const { address, algo, pubkey } = accounts[0]

    return {
      address,
      algo: algo,
      pubkey: new Uint8Array(Buffer.from(pubkey, 'base64')),
    }
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signAmino: (signerAddress: string, signDoc: StdSignDoc) =>
        this.signAmino(chainId, signerAddress, signDoc),
    } as OfflineAminoSigner;
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return {
      getAccounts: async () => [await this.getAccount(chainId)],
      signDirect: (signerAddress: string, signDoc: DirectSignDoc) =>
        this.signDirect(chainId, signerAddress, signDoc),
    } as OfflineDirectSigner;
  }

  override async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    return this.signClient.request({
      topic: this.session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: 'cosmos_signAmino',
        params: {
          signerAddress: signer,
          signDoc,
        },
      },
    });
  }

  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error("Method not implemented.");
  }

  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    const signDocValue = {
      signerAddress: signer,
      signDoc: {
        chainId: signDoc.chainId,
        bodyBytes: Buffer.from(signDoc.bodyBytes).toString('base64'),
        authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString(
          'base64'
        ),
        accountNumber: signDoc.accountNumber.toString(),
      },
    };

    return this.signClient.request({
      topic: this.session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: 'cosmos_signDirect',
        params: signDocValue,
      },
    });
  }

  sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  }

  sign(chainId: string, message: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  addSuggestChain(chainInfo: ChainInfo): Promise<void> {
    throw new Error('Method not implemented.');
  }

  bindingEvent(): void {
    this.events.removeAllListeners()
    const events = [...Object.keys(WcEventTypes), ...Object.keys(WcProviderEventType)]
    for (const event of events) {
      this.client.on(event, (data: never) => {
        this.events.emit(event, data)

        if (event === 'accountsChanged') {
          this.events.emit('keystoreChange',)
        }

      })
    }
  }

  unbindingEvent(): void {
    this.events.removeAllListeners()
  }
}
