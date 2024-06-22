import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/home/home";
import SearchScreen from "../screens/search/search";
import SellScreen from "../screens/sell/sell";
import ActivityScreen from "../screens/activity/activity";
import ProfileScreen from "../screens/profile/profile";
import {
  AuthStackParamList,
  MainStackParamList,
  RootStackParamList,
} from "../interfaces/auth/navigation";
import LoginScreen from "../screens/auth/login/login";
import RegisterScreen from "../screens/auth/register/register";
import ForgotPasswordScreen from "../screens/auth/forgotPass/forgotPass";

const Tab = createBottomTabNavigator<MainStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Sell" component={SellScreen} />
    <Tab.Screen name="Activity" component={ActivityScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
