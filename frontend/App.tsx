import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "./src/utils/i18n";
import ErrorBoundary from "./src/utils/ErrorBoundary";
import AppNavigator from "./src/navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { toastConfig } from "./src/utils/toastConfig"; // Import the custom toast configuration
import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AppNavigator />
          <Toast config={toastConfig} />
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
