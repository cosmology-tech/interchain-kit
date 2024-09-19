import { ConnectModalHead, ConnectModalQRCode } from "@interchain-ui/react"
import { useActiveWallet, useWalletManager, useWalletModal } from "@interchain-kit/react"
import { WCWallet } from "@interChain-kit/core"

export const QRCodeHeader = () => {
  const activeWallet = useActiveWallet()
  const { close } = useWalletModal()
  return (
    <ConnectModalHead
      title={activeWallet?.option?.prettyName || ''}
      hasBackButton={true}
      onClose={() => void 0}
      onBack={() => void 0}
      closeButtonProps={{ onClick: close }}
    />
  )
}
export const QRCodeContent = () => {
  const activeWallet = useActiveWallet() as WCWallet
  const walletManager = useWalletManager()
  const data = activeWallet.pairingUri

  return (
    <ConnectModalQRCode
      status={data ? "Done" : 'Pending'}
      link={data}
      description={'Open App to connect'}
      errorTitle={'errorTitle'}
      errorDesc={'errorDesc'}
      onRefresh={() => walletManager.connect(activeWallet?.option?.name || '')}
    />
  )
}