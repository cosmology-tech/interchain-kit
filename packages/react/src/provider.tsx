import React, { useEffect, useMemo, useState } from "react";
import { createContext, useContext } from "react";
import {
  BaseWallet,
  SignerOptions,
  WalletManager,
  EndpointOptions,
  WalletManagerState,
} from "@interchain-kit/core";
import { AssetList, Chain } from "@chain-registry/v2-types";
import { WalletModalProvider } from "./modal";

type InterchainWalletContextType = {
  walletManager: WalletManager;
};

type InterchainWalletProviderProps = {
  chains: Chain[];
  assetLists: AssetList[];
  wallets: BaseWallet[];
  signerOptions?: SignerOptions;
  endpointOptions?: EndpointOptions;
  children: React.ReactNode;
};

const InterchainWalletContext =
  createContext<InterchainWalletContextType | null>(null);

export const ChainProvider = ({
  chains,
  assetLists,
  wallets,
  signerOptions,
  endpointOptions,
  children,
}: InterchainWalletProviderProps) => {
  const [_, forceRender] = useState({});

  const walletManager = useMemo(() => {
    const wm = new WalletManager(
      chains,
      assetLists,
      wallets,
      signerOptions,
      endpointOptions
    );
    const observable = wm.getObservableObj();

    observable.subscribe(() => forceRender({}));

    return observable;
  }, []);

  useEffect(() => {
    walletManager.init();
  }, []);

  if (walletManager.state === WalletManagerState.Initializing) {
    return <div>Interchain Kit Initializing...</div>;
  }

  return (
    <InterchainWalletContext.Provider value={{ walletManager }}>
      <WalletModalProvider>{children}</WalletModalProvider>
    </InterchainWalletContext.Provider>
  );
};

export const useInterchainWalletContext = () => {
  const context = useContext(InterchainWalletContext);
  if (!context) {
    throw new Error(
      "useInterChainWalletContext must be used within a InterChainProvider"
    );
  }
  return context;
};
