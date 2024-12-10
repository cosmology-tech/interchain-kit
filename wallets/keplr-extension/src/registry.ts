
import { Wallet } from '@interchain-kit/core';
import { ICON } from './constant';

export const keplrExtensionInfo: Wallet = {
  windowKey: 'keplr',
  ethereumKey: 'keplr.ethereum',
  name: 'keplr-extension',
  prettyName: 'Keplr',
  mode: 'extension',
  logo: ICON,
  keystoreChange: 'keplr_keystorechange',
  downloads: [
    {
      device: 'desktop',
      browser: 'chrome',
      link: 'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en',
    },
    {
      device: 'desktop',
      browser: 'firefox',
      link: 'https://addons.mozilla.org/en-US/firefox/addon/keplr/',
    },
    {
      link: 'https://www.keplr.app/download',
    },
  ],
};
