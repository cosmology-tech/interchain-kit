import { useEffect, useMemo, useState } from "react"
import { WalletAccount, WalletManager, WalletManagerState, WalletState } from "@interchain-kit/core"
import { useWalletManager } from './useWalletManager';

export const useAccount = (chainName: string, walletName: string): WalletAccount | null => {
  const walletManager = useWalletManager()

  const wallet = useMemo(() => {
    return walletManager.wallets.find(w => w.info.name === walletName)
  }, [walletManager, walletName]);

  const [account, setAccount] = useState<WalletAccount | null>(null)

  const chain = useMemo(() => {
    return walletManager.chains.find(c => c.chainName === chainName);
  }, [walletManager, chainName]);

  const getAccount = async () => {
    if (wallet && chain) {
      if (wallet.walletState === WalletState.Connected) {
        const account = await wallet.getAccount(chain.chainId)
        setAccount(account)
      }
      if (wallet.walletState === WalletState.Disconnected) {
        setAccount(null)
      }
    }
    if (!wallet) {
      setAccount(null)
    }
  }

  useEffect(() => {
    if (wallet && walletManager.state === WalletManagerState.Initialized) {
      wallet.events.on('keystoreChange', getAccount)
    }
  }, [wallet, walletManager.state])

  useEffect(() => {
    getAccount()
  }, [wallet, chainName, wallet?.walletState])

  return account
}