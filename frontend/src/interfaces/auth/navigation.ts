export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Auth: { screen?: keyof AuthStackParamList } | undefined;
  AuthLoading: undefined;
  Main: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Home: {
    searchQuery?: string;
    refreshHome?: number;
  };
  Search: {
    refreshSearch?: number;
  };
  Sell: undefined;
  Activity: { refreshActivity?: number; unseenCount?: number };

  Profile: { refreshProfile?: number };
  UserProfile: {
    userId: string;
    firstName?: string;
    lastName?: string;
    isLiked?: boolean;
  };
  Chat: { userId: string };
  Likes: undefined;
  Messages: undefined;
  EditProfile: undefined;
  ChangeEmailScreen: undefined;
  ChangePasswordScreen: undefined;
  SellProduct: undefined;
};
