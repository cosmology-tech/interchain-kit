import { AssetList, Chain } from "@chain-registry/v2-types"
import { useWalletManager } from "./useWalletManager"
import { useAccount } from "./useAccount"
import { BaseWallet } from "@interchain-kit/core"
import { UseChainReturnType } from "../types/chain"
import { useInterchainClient } from "./useInterchainClient"
import { useCurrentWallet } from "./useCurrentWallet"
import { Ref, watch, ref, computed } from 'vue'

export const useChainWallet = (chainName: Ref<string>, walletName: Ref<string>): UseChainReturnType => {
	const logoUrl = ref('')
	const walletManager = useWalletManager()
	const currentWallet = useCurrentWallet()
	const chainToShow = ref()
	const assetList = ref()
	const account = useAccount(chainName, walletName)
	const interchainClient = useInterchainClient(chainName, walletName)

	const _setValues = () => {
		chainToShow.value = walletManager.chains.find((c: Chain) => c.chainName === chainName.value);
		assetList.value = walletManager.assetLists.find((a: AssetList) => a.chainName === chainName.value)
	}

	watch(assetList, () => {
		logoUrl.value = walletManager.getChainLogoUrl(assetList.value)
	})
	_setValues()
	logoUrl.value = walletManager.getChainLogoUrl(assetList.value)

	return {
		logoUrl,
		chain: chainToShow,
		assetList,
		address: computed(() => account.value?.address),
		wallet: currentWallet,
		...interchainClient,
	}
}