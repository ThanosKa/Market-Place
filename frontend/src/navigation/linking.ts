import * as Linking from 'expo-linking';
import { AuthStackParamList, RootStackParamList, MainStackParamList } from '../interfaces/auth/navigation';
import { LinkingOptions } from '@react-navigation/native';

type CombinedParamList = RootStackParamList & AuthStackParamList & MainStackParamList;

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<CombinedParamList> = {
  prefixes: [prefix],
  config: {
    screens: {
      AuthLoading: 'loading',
      Auth: 'auth',
      Main: {
        path: 'main',
        screens: {
          MainTabs: 'tabs',
          Chat: 'chat/:chatId?',
          Product: 'product/:productId',
          Messages: 'messages',
          Likes: 'likes',
          Home: 'home',
          Search: 'search',
          Sell: 'sell',
          Activity: 'activity',
          Profile: 'profile',
          UserProfile: 'user/:userId',
          EditProfile: 'edit-profile',
          ChangeEmailScreen: 'change-email',
          ChangePasswordScreen: 'change-password',
          SellProduct: 'sell-product',
          Purchases: 'purchases',
          Sales: 'sales',
        },
      },
    },
  },
};
