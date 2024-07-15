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
  Home: { searchQuery?: string };
  Search: undefined;
  Sell: undefined;
  Activity: undefined;
  Profile: { refreshProfile?: number };
  UserProfile: { userId: string };
  Chat: { userId: string };
  Likes: undefined;
  Messages: undefined;
  EditProfile: undefined;
  ChangeEmailScreen: undefined;
  ChangePasswordScreen: undefined;
};
