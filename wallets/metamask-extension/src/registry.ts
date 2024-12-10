
import { Wallet } from '@interchain-kit/core';
import { ICON } from './constant';

export const MetaMaskExtensionInfo: Wallet = {
  windowKey: '',
  ethereumKey: 'ethereum',
  name: 'metamask-extension',
  prettyName: 'MetaMask',
  mode: 'extension',
  logo: ICON,
  keystoreChange: 'keplr_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/'
    },
    {
      link: 'https://metamask.io/download/',
    },
  ],
};
