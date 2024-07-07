// src/auth/types.ts
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// src/main/types.ts
export type MainStackParamList = {
  TabNavigator: undefined;
  // Add other main screens here if needed
};

// src/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
