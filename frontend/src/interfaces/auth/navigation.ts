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
  // Chat: { chatId: string };
  Chat: { chatId?: string; userId?: string };
  Product: {
    productId: string;
  };
  Messages: undefined;
  Likes: undefined;
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

  Profile: {
    refreshProfile?: number;
    // activeTab?: "profile" | "listings" | "reviews";
  };
  UserProfile: {
    userId: string;
    firstName?: string;
    lastName?: string;
    isLiked?: boolean;
  };

  EditProfile: undefined;
  ChangeEmailScreen: undefined;
  ChangePasswordScreen: undefined;
  SellProduct: undefined;
  Purchases: undefined;
  Sales: undefined;
};
