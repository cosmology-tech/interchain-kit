import { StdSignDoc } from '@interchainjs/types';
import { AminoSignResponse, DirectSignResponse, OfflineSigner, StdSignature } from "@interchainjs/cosmos/types/wallet";
import { BaseWallet } from "./base-wallet";
import { DirectSignDoc, SignOptions, SignType, WalletAccount } from '../types';
import { BroadcastMode } from '@interchainjs/cosmos/types';
import { getClientFromExtension } from '../utils';
import { chainRegistryChainToKeplr } from '@chain-registry/v2-keplr';

export class CosmosWallet extends BaseWallet {

  errorMessage: string = ''

  async init(): Promise<void> {
    try {
      this.client = await getClientFromExtension(this.info.windowKey)
    } catch (error) {
      this.errorMessage = (error as any).message
      throw error
    }
  }
  async connect(chainId: string | string[]): Promise<void> {
    const chainIds = Array.isArray(chainId) ? chainId : [chainId]
    await Promise.all(chainIds.map(async (chainId) => {
      try {
        await this.client.enable(chainId)
      } catch (error) {
        if ((error as any).message === `There is no chain info for ${chainId}`) {
          await this.addSuggestChain(chainId)
        }
        throw error
      }
    }))
  }
  async disconnect(chainId: string | string[]): Promise<void> {
    await this.client.disable(chainId)
  }
  async getAccount(chainId: string): Promise<WalletAccount> {
    const key = await this.client.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo,
      pubkey: key.pubKey,
      isNanoLedger: key.isNanoLedger,
    };
  }
  getOfflineSigner(chainId: string, preferredSignType?: SignType): OfflineSigner {
    if (preferredSignType === 'amino') {
      return this.client.getOfflineSignerOnlyAmino(chainId);
    } else {
      return this.client.getOfflineSigner(chainId);
    }
  }
  async signAmino(chainId: string, signer: string, signDoc: StdSignDoc, signOptions?: SignOptions): Promise<AminoSignResponse> {
    throw new Error('Method not implemented.');
  }
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> {
    throw new Error('Method not implemented.');
  }
  verifyArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async signDirect(chainId: string, signer: string, signDoc: DirectSignDoc, signOptions?: SignOptions): Promise<DirectSignResponse> {
    throw new Error('Method not implemented.');
  }
  async sendTx(chainId: string, tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    throw new Error('Method not implemented.');
  }
  async addSuggestChain(chainId: string): Promise<void> {
    const chain = this.chainMap.get(chainId)
    const chainInfo = chainRegistryChainToKeplr(chain, this.assetLists)
    return this.client.experimentalSuggestChain(chainInfo);
  }
}