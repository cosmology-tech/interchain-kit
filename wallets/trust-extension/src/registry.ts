import { Wallet } from "@interchain-kit/core";
import { ICON } from "./constant";

export const trustExtensionInfo: Wallet = {
  windowKey: 'trustWallet.cosmos',
  ethereumKey: 'trustWallet',
  name: 'trust-extension',
  prettyName: 'Trust',
  logo: ICON,
  mode: 'extension',
  keystoreChange: 'trust_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link:
        'https://chrome.google.com/webstore/detail/trust-wallet/aiifbnbfobpmeekipheeijimdpnlpgpp',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link:
        'https://addons.mozilla.org/en-US/firefox/addon/terra-trust-wallet/',
    },
    {
      device: 'desktop',
      browser: 'edge',
      link:
        'https://microsoftedge.microsoft.com/addons/detail/trust-wallet/ajkhoeiiokighlmdnlakpjfoobnjinie',
    },
  ],
};
