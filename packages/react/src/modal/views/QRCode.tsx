import { ConnectModalHead, ConnectModalQRCode } from "@interchain-ui/react";
import { WCWallet } from "@interchain-kit/core";
import { useCurrentWallet, useWalletManager } from "../../hooks";
import { useWalletModal } from "../provider";

export const QRCodeHeader = ({ onBack }: { onBack: () => void }) => {
  const currentWallet = useCurrentWallet();
  const walletManager = useWalletManager();
  const { close } = useWalletModal();
  return (
    <ConnectModalHead
      title={currentWallet?.info?.prettyName || ""}
      hasBackButton={true}
      onClose={() => void 0}
      onBack={async () => {
        await walletManager.disconnect(currentWallet?.info?.name || "");
        onBack();
      }}
      closeButtonProps={{ onClick: close }}
    />
  );
};
export const QRCodeContent = () => {
  const currentWalletRepository = useCurrentWallet();
  const currentWallet = currentWalletRepository.wallet as WCWallet;
  const walletManager = useWalletManager();
  const data = currentWallet.pairingUri;

  return (
    <ConnectModalQRCode
      status={data ? "Done" : "Pending"}
      link={data}
      description={"Open App to connect"}
      errorTitle={"errorTitle"}
      errorDesc={currentWallet.errorMessage || ""}
      onRefresh={() => walletManager.connect(currentWallet?.info?.name || "")}
    />
  );
};
