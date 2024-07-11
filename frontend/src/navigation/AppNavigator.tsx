import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "../interfaces/auth/navigation";
import AuthLoadingScreen from "./AuthLoadingScreen";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";

const RootStack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="Main" component={MainNavigator} />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
