// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../auth/types/types";
import MainStack from "./MainStack";
import AuthStack from "./AuthStack";

const RootStack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  // You can add authentication logic here to determine which stack to show
  const isAuthenticated = false; // Replace with actual auth check

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainStack} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
