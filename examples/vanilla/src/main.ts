
import { assetLists, chains } from '@chain-registry/v2';
import { BaseWallet, MobileWallet, WalletManager } from '@interchain-kit/core';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { KeplrWallet } from '@interchain-kit/keplr-extension/extension';
import { KeplrMobile, keplrMobile } from '@interchain-kit/keplr-mobile';
import QRCode from 'qrcode';


const chainNames = ['juno', 'cosmoshub', 'stargaze']

const chainsToUse = chains.filter(c => chainNames.includes(c.chainName))
const assetListsToUse = assetLists.filter(a => chainNames.includes(a.chainName))
type WalletTypes = KeplrMobile | KeplrWallet
const walletsToUse: WalletTypes[] = [keplrMobile, keplrWallet]



const wm = new WalletManager(chainsToUse, assetListsToUse, walletsToUse)


const startExtension = async () => {

    await wm.init()

    await wm.connect('keplr-extension')

    const wallet = wm.currentWallet as KeplrWallet

    console.log(await wallet?.getAccounts(['juno', 'cosmoshub', 'stargaze']))

}





const startMobile = async () => {

    await wm.init()

    wm.connect('keplr-mobile')



    const onGenerateParingUri = (uri: string) => {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            QRCode.toCanvas(canvas, uri, function (error: any) {
                if (error) console.error(error)
                console.log('success!');
            });
        }
    }

    const onApprove = async () => {

        const app = document.getElementById('app')

        if (app) {
            app.innerHTML = `connected`
        }

        const wallet = wm.currentWallet as MobileWallet

        console.log(await wallet.getAccounts())


    }

    await wm.connect('keplr-mobile', onApprove, onGenerateParingUri)

    const uri = await (wm as unknown as MobileWallet).pairingUri

    console.log(uri)


    // wm.enableChains(['juno', 'cosmoshub', 'stargaze'])


}

// startExtension()
startMobile()