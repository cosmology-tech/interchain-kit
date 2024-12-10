import { assetLists, chains } from "@chain-registry/v2";
import {
  BaseWallet,
  EthereumWallet,
  isInstanceOf,
  MultiChainWallet,
  WCWallet,
} from "@interchain-kit/core";
import { useChainWallet, useWalletManager } from "@interchain-kit/react";
import { useRef, useState } from "react";
import { makeKeplrChainInfo } from "../utils";
import { Chain, Asset } from "@chain-registry/v2-types";
import { coins } from "@cosmjs/amino";
import { ChainInfo } from "@keplr-wallet/types";
import { createGetBalance } from "interchainjs/cosmos/bank/v1beta1/query.rpc.func";
import QRCode from "react-qr-code";
import { createSend } from "interchainjs/cosmos/bank/v1beta1/tx.rpc.func";

type BalanceProps = {
  address: string;
  wallet: BaseWallet;
  chainName: string;
  chainId: string;
  chain: Chain;
};

const BalanceTd = ({ address, wallet, chain }: BalanceProps) => {
  const { rpcEndpoint, isLoading: isChainWalletLoading } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );

  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<any>();

  const handleBalanceQuery = async () => {
    let balance;

    setIsLoading(true);

    if (isInstanceOf(wallet, EthereumWallet)) {
      const result = await wallet.getBalance(chain.chainId as string);
      const balanceInWei = parseInt(result, 16);
      balance = { balance: { amount: balanceInWei.toString() } };
    }

    if (isInstanceOf(wallet, MultiChainWallet)) {
      if (chain.chainType === "eip155") {
        const ethWallet = wallet.getWalletByChainType("eip155");
        if (isInstanceOf(ethWallet, EthereumWallet)) {
          const result = await ethWallet.getBalance(chain.chainId as string);
          const balanceInWei = parseInt(result, 16);
          balance = { balance: { amount: balanceInWei.toString() } };
        }
      }

      if (chain.chainType === "cosmos") {
        const balanceQuery = createGetBalance(rpcEndpoint as string);
        balance = await balanceQuery({
          address,
          denom: chain.staking?.stakingTokens[0].denom as string,
        });
      }
    }

    setBalance(balance);
    setIsLoading(false);
  };

  if (isLoading || isChainWalletLoading) {
    return <td>loading...</td>;
  }

  return (
    <td>
      <div>
        <button className="bg-blue-100 p-1 m-1" onClick={handleBalanceQuery}>
          refresh balance
        </button>
      </div>
      <div>
        <span>balance: </span>
        <span>{balance?.balance?.amount}</span>
      </div>
    </td>
  );
};

type SendTokenProps = {
  wallet: BaseWallet;
  address: string;
  chain: Chain;
};
const SendTokenTd = ({ wallet, address, chain }: SendTokenProps) => {
  const toAddressRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const { signingClient } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );

  const handleSendToken = async () => {
    if (!toAddressRef.current || !amountRef.current) {
      return;
    }

    const transaction = {
      from: address,
      to: toAddressRef.current.value,
      value: `0x${parseInt(amountRef.current.value).toString(16)}`,
    };

    if (isInstanceOf(wallet, EthereumWallet)) {
      try {
        console.log(transaction);
        await wallet.switchChain(chain.chainId as string);
        const tx = await wallet.sendTransaction(transaction);
        console.log(tx);
      } catch (error) {
        console.log(error);
      }
    }

    if (isInstanceOf(wallet, MultiChainWallet)) {
      if (chain.chainType === "eip155") {
        const ethWallet = wallet.getWalletByChainType("eip155");
        if (isInstanceOf(ethWallet, EthereumWallet)) {
          try {
            console.log(transaction);
            await ethWallet.switchChain(chain.chainId as string);
            const tx = await ethWallet.sendTransaction(transaction);
            console.log(tx);
          } catch (error) {
            console.log(error);
          }
        }
      }

      if (chain.chainType === "cosmos") {
        const txSend = createSend(signingClient);
        const recipientAddress = toAddressRef.current.value;
        const denom = chain.staking?.stakingTokens[0].denom as string;

        const fee = {
          amount: coins(25000, denom),
          gas: "1000000",
        };

        try {
          const tx = await txSend(
            address,
            {
              fromAddress: address,
              toAddress: recipientAddress,
              amount: [
                { denom: denom, amount: amountRef.current?.value as string },
              ],
            },
            fee,
            "test"
          );
          console.log(tx);
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  return (
    <td>
      <div>
        <button className="bg-blue-100 p-1 m-1" onClick={handleSendToken}>
          Send Token to:
        </button>
        <input
          className="border-red-300 border-2 rounded-sm"
          ref={toAddressRef}
        />
      </div>
      <div>
        amount:{" "}
        <input className="border-red-300 border-2 rounded-sm" ref={amountRef} />
      </div>
    </td>
  );
};

const ChainRow = ({ chain, wallet }: { chain: Chain; wallet: BaseWallet }) => {
  const { address } = useChainWallet(
    chain.chainName,
    wallet.info?.name as string
  );
  return (
    <tr>
      <td>{chain.chainName}</td>
      <td>{chain.chainId}</td>
      <td>{address}</td>
      <BalanceTd
        address={address}
        chainId={chain.chainId}
        chainName={chain.chainName}
        wallet={wallet}
        chain={chain}
      />
      <SendTokenTd address={address} wallet={wallet} chain={chain} />
    </tr>
  );
};

const WalletConnectTd = ({ wallet }: { wallet: BaseWallet }) => {
  const walletManager = useWalletManager();

  const chainIds = walletManager.chains.map((c) => c.chainId);

  const currentWallet = walletManager.wallets.find(
    (w: BaseWallet) => w.info?.name === wallet.info?.name
  );

  const connect = () => {
    walletManager.connect(wallet.info?.name as string);
  };

  const disconnect = () => {
    walletManager.disconnect(wallet.info?.name as string);
  };

  const uri = (currentWallet as WCWallet).pairingUri || "";

  return (
    <td>
      <button className="bg-blue-100 p-1 m-1" onClick={connect}>
        connect
      </button>
      <button className="bg-blue-100 p-1 m-1" onClick={disconnect}>
        disconnect
      </button>
      {currentWallet instanceof WCWallet && uri && <QRCode value={uri} />}
      {wallet.errorMessage}
    </td>
  );
};

const E2ETest = () => {
  const walletManager = useWalletManager();

  const addChain = async () => {
    const keplrExtension = walletManager.wallets.find(
      (w) => w.info?.name === "keplr-extension"
    );

    const chain = chains.find((c) => c.chainName === "cosmoshub");
    const assetList = assetLists.find((a) => a.chainName === "cosmoshub");

    const chainInfo: ChainInfo = makeKeplrChainInfo(
      chain as Chain,
      assetList?.assets[0] as Asset,
      "http://localhost:26653",
      "http://localhost:1313",
      "test-cosmoshub-4",
      "cosmoshub"
    );

    keplrExtension?.addSuggestChain(chainInfo);
  };

  return (
    <div>
      <table style={{ width: "1000px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Pretty Name</th>
            <th>Connect</th>
            <th>State</th>
            <th>Chain</th>
          </tr>
        </thead>
        <tbody>
          {walletManager.wallets.map((wallet) => {
            return (
              <tr key={wallet.info?.name}>
                <td>{wallet.info?.name}</td>
                <td>{wallet.info?.prettyName}</td>
                <WalletConnectTd wallet={wallet} />
                <td>{wallet.walletState}</td>
                <td>
                  <table>
                    <thead>
                      <tr>
                        <th>name</th>
                        <th>chainId</th>
                        <th>address</th>
                        <th>faucet</th>
                        <th>send token</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletManager.chains.map((chain) => {
                        return (
                          <ChainRow
                            chain={chain}
                            wallet={wallet}
                            key={chain.chainId}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button className="bg-blue-100 p-1 m-1" onClick={addChain}>
        add suggest chain
      </button>
    </div>
  );
};

export default E2ETest;
