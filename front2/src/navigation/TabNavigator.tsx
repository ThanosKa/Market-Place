// src/navigation/TabNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import HomeScreen from "../main/screens/HomeScreen";
import SearchScreen from "../main/screens/SearchScreen";
import SellScreen from "../main/screens/SellScreen";
import ActivityScreen from "../main/screens/ActivityScreen";
import ProfileScreen from "../main/screens/ProfileScreen";

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Sell: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: RouteProp<TabParamList, keyof TabParamList>;
      }) => ({
        tabBarIcon: ({
          focused,
          color,
          size,
        }: {
          focused: boolean;
          color: string;
          size: number;
        }) => {
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
          return null;
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
};

export default TabNavigator;
