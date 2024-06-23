import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

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
import { colors } from "../colors/colors";
import UserProfile from "../components/UserProfile/index";
import ChatScreen from "../components/Chat/chat";

const AuthStack = createStackNavigator<AuthStackParamList>();
const RootStack = createStackNavigator<RootStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainStackParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        if (route.name === "Home") {
          return (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              size={size}
              color={color}
            />
          );
        } else if (route.name === "Search") {
          return (
            <Ionicons
              name={focused ? "search-sharp" : "search-outline"}
              size={size}
              color={color}
            />
          );
        } else if (route.name === "Sell") {
          return (
            <FontAwesome
              name={focused ? "plus-square" : "plus-square-o"}
              size={size}
              color={color}
            />
          );
        } else if (route.name === "Activity") {
          return (
            <Ionicons
              name={focused ? "notifications-sharp" : "notifications-outline"}
              size={size}
              color={color}
            />
          );
        } else if (route.name === "Profile") {
          return (
            <FontAwesome
              name={focused ? "user" : "user-o"}
              size={size}
              color={color}
            />
          );
        }
        // Default icon if none of the conditions are met
        return null;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.secondary,
      tabBarStyle: {
        // You can add more styles for the tab bar here
      },
      tabBarLabelStyle: {
        // You can add styles for the tab labels here
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Sell" component={SellScreen} />
    <Tab.Screen name="Activity" component={ActivityScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="MainTabs" component={MainTabs} />
    <MainStack.Screen name="UserProfile" component={UserProfile} />
    <MainStack.Screen name="Chat" component={ChatScreen} />
  </MainStack.Navigator>
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
        <RootStack.Screen name="Main" component={MainNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
