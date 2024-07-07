// src/navigation/MainStack.tsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import { MainStackParamList } from "../auth/types/types";

const Stack = createStackNavigator<MainStackParamList>();

const MainStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      {/* Add other main screens here if needed */}
    </Stack.Navigator>
  );
};

export default MainStack;
