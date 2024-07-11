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

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NavigationContainer ref={navigationRef}>
            <AppNavigator />
          </NavigationContainer>
          <Toast config={toastConfig} />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
