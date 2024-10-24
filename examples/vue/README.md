<p align="center">
  <img src="https://user-images.githubusercontent.com/545047/188804067-28e67e5e-0214-4449-ab04-2e0c564a6885.svg" width="80"><br />
    @interchain-kit/react
</p>

## Install
Using npm:
```sh
npm install @interchain-kit/vue
```
Using yarn:
```sh
yarn add @interchain-kit/vue
```

## Usage
### Setup
#### import chain registry info that you need
```js
<script setup lang="ts">
import { ChainProvider } from '@interchain-kit/vue'
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import { RouterView } from 'vue-router';
import { chain as junoChain, assetList as junoAssetList } from "@chain-registry/v2/mainnet/juno";
import { chain as osmosisChain,assetList as osmosisAssetList } from "@chain-registry/v2/mainnet/osmosis";
import { chain as cosmoshubChain, assetList as cosmoshubAssetList } from "@chain-registry/v2/mainnet/cosmoshub";
import { chain as osmosisTestChain, assetList as osmosisTestAssetList } from "@chain-registry/v2/testnet/osmosistestnet"
</script>

<template>
  <ChainProvider
    :wallets="[keplrWallet, leapWallet]"
    :chains="[osmosisChain, junoChain, cosmoshubChain, osmosisTestChain]"
    :asset-lists="[osmosisAssetList, junoAssetList, cosmoshubAssetList, osmosisTestAssetList]"
    :signer-options="{}"
    :endpoint-options="{}"
  >
    <router-view />
  </ChainProvider>
</template>

<style scoped>
</style>
```

#### or import all chain registry
`App.ts`
```js
<script setup lang="ts">
import { ChainProvider } from '@interchain-kit/vue';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { chains, assetLists } from '@chain-registry/v2/mainnet';
import Show from './views/show.vue';
</script>

<template>
  <ChainProvider
    :wallets="[keplrWallet]"
    :chains="[chains]"
    :asset-lists="[assetLists]"
    :signer-options="{}"
    :endpoint-options="{}"
  >
    <show />
  </ChainProvider>
</template>

<style scoped>
</style>
```
`show.vue`
```js
<script setup lang="ts">
import { ref } from 'vue'
import { useChain } from '@interchain-kit/vue';

const chainName = ref('osmosistestnet')
const { address } = useChain(chainName);
</script>

<template>
  <div>
    <div>address: {{ address }}</div>
  </div>
</template>

<style scoped>
</style>
```

### useChain
```js
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useChain } from '@interchain-kit/vue';

const chainName = ref('osmosistestnet')
const { chain, assetList, address, wallet, queryClient, signingClient } = useChain(chainName)
const balance = ref('0')

watch(queryClient, async(client) => {
  if (client) {
    const {balance: bc} =  await queryClient.value.balance({
      address: address.value,
      denom: 'uosmo',
    })
		balance.value = bc?.amount || '0'
  }
})
</script>

<template>
  <div>
    <div>chain: {{ chain.prettyName }}</div>
    <div>assetList: {{ assetList?.assets?.length }}</div>
    <div>address: {{ address }}</div>
    <div>wallet: {{ wallet?.option?.prettyName }}</div>
    <div>balance: {{ balance }}</div>
  </div>
</template>

<style scoped>
</style>


```

### useChainWallet
`App.ts`
```js
<script setup lang="ts">
import { ChainProvider } from '@interchain-kit/vue'
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import Show from './views/show.vue';
import { chains, assetLists } from '@chain-registry/v2/mainnet';

const chainNames = ['juno', 'stargaze']
</script>

<template>
  <ChainProvider
    :wallets="[keplrWallet, leapWallet]"
    :chains="chains.filter(c => chainNames.includes(c.chainName))"
    :asset-lists="assetLists.filter(c => chainNames.includes(c.chainName))"
    :signer-options="{}"
    :endpoint-options="{}"
  >
    <show />
  </ChainProvider>
</template>

<style scoped>
</style>

```
`show.vue`
```js
<script setup lang="ts">
import { ref } from 'vue'
import { useChainWallet, useWalletManager } from '@interchain-kit/vue';

const junoChainName = ref('juno')
const keplrWalletName = ref('keplr-extension')
const juno = useChainWallet(junoChainName, keplrWalletName);

const stargazeChainName = ref('stargaze')
const leapWalletName = ref('leap-extension')
const stargaze = useChainWallet(stargazeChainName, leapWalletName);

const walletManager = useWalletManager()
	
const connectKeplr = async() => {
    await walletManager.connect('keplr-extension')
}
const connectLeap = async() => {
    await walletManager.connect('leap-extension')
}
</script>

<template>
  <div>
    <button @click="connectKeplr">connect keplr</button>
    <button @click="connectLeap">connect leap</button>
    <div>juno address: {{ juno.address }}</div>
    <div>stargaze address: {{ stargaze.address }}</div>
  </div>
</template>

<style scoped>
</style>

```

### useCurrentWallet
```js
const wallet = useCurrentWallet()

console.log(wallet) // current connected wallet

```

### useAccount
```js
const account = useAccount('cosmoshub', 'keplr-extension')

console.log(account.address) // cosmoshub address in keplr-extension wallet

```

### useOfflineSigner
```js
const offlineSigner = useOfflineSigner('cosmoshub', 'keplr-extension')

console.log(offlineSigner) // cosmoshub offlineSigner in keplr-extension wallet 
```

### useChains

```js
WIP
```


## Developing

When first cloning the repo:

```sh
yarn
# build the prod packages. When devs would like to navigate to the source code, this will only navigate from references to their definitions (.d.ts files) between packages.
yarn build
```

Or if you want to make your dev process smoother, you can run:

```sh
yarn
# build the dev packages with .map files, this enables navigation from references to their source code between packages.
yarn build:dev
```

## Related

Checkout these related projects:

* [@cosmology/telescope](https://github.com/cosmology-tech/telescope) Your Frontend Companion for Building with TypeScript with Cosmos SDK Modules.
* [@cosmwasm/ts-codegen](https://github.com/CosmWasm/ts-codegen) Convert your CosmWasm smart contracts into dev-friendly TypeScript classes.
* [chain-registry](https://github.com/cosmology-tech/chain-registry) Everything from token symbols, logos, and IBC denominations for all assets you want to support in your application.
* [cosmos-kit](https://github.com/cosmology-tech/cosmos-kit) Experience the convenience of connecting with a variety of web3 wallets through a single, streamlined interface.
* [create-cosmos-app](https://github.com/cosmology-tech/create-cosmos-app) Set up a modern Cosmos app by running one command.
* [interchain-ui](https://github.com/cosmology-tech/interchain-ui) The Interchain Design System, empowering developers with a flexible, easy-to-use UI kit.
* [starship](https://github.com/cosmology-tech/starship) Unified Testing and Development for the Interchain.

## Credits

🛠 Built by Cosmology — if you like our tools, please consider delegating to [our validator ⚛️](https://cosmology.zone/validator)


## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.