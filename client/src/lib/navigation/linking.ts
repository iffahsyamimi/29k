import {LinkingOptions} from '@react-navigation/native';
import {DEEP_LINK_SCHEMA, DEEP_LINK_PREFIX} from 'config';

import * as dynamicLinks from './linkHandlers/dynamicLinks';
import * as notifications from './linkHandlers/notifications';
import * as nativeLinks from './linkHandlers/nativeLinks';

import {ModalStackProps} from './constants/routes';

// Deep link configuration
const config: LinkingOptions<ModalStackProps>['config'] = {
  initialRouteName: 'OverlayStack',
  screens: {
    AddSessionByInviteModal: 'joinSessionInvite/:inviteCode',
    UpgradeAccountModal: 'verifyPublicHostCode/:code',
  },
};

const linking: LinkingOptions<ModalStackProps> = {
  config,

  prefixes: [DEEP_LINK_SCHEMA, DEEP_LINK_PREFIX],

  async getInitialURL() {
    const dynamicLinkURL = await dynamicLinks.getInitialURL();
    if (dynamicLinkURL) {
      return dynamicLinkURL;
    }

    const notificationURL = await notifications.getInitialURL();
    if (notificationURL) {
      return notificationURL;
    }

    const nativeLinkURL = await nativeLinks.getInitialURL();
    if (nativeLinkURL) {
      return nativeLinkURL;
    }
  },

  subscribe(listener) {
    const unsubscribeDynamicLinks = dynamicLinks.addEventListener(listener);

    const unsubscribeNotifications = notifications.addEventListener(listener);

    const unsubscribeNativeLinks = nativeLinks.addEventListener(listener);

    return () => {
      unsubscribeDynamicLinks();
      unsubscribeNotifications();
      unsubscribeNativeLinks();
    };
  },
};

export default linking;
