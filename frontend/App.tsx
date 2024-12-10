import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import "./src/utils/i18n";
import ErrorBoundary from "./src/utils/ErrorBoundary";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/utils/toastConfig";
import { QueryClient, QueryClientProvider } from "react-query";
import { navigationRef } from "./src/navigation/navigationRef";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./src/redux/redux";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();
WebBrowser.maybeCompleteAuthSession();


const tokenCache = {
  getToken: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  saveToken: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
};

const App = () => {
  const clerkPubKey = "pk_test_Z2VudGxlLXJlaW5kZWVyLTQ3LmNsZXJrLmFjY291bnRzLmRldiQ"; // Replace with your actual key

  if (!clerkPubKey) {
    throw new Error("Missing Clerk Publishable Key");
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      tokenCache={tokenCache}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <SafeAreaProvider>
                <NavigationContainer ref={navigationRef}>
                  <ActionSheetProvider>
                    <AppNavigator />
                  </ActionSheetProvider>
                </NavigationContainer>
                <Toast config={toastConfig} />
              </SafeAreaProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </PersistGate>
      </Provider>
    </ClerkProvider>
  );
};

export default App;
