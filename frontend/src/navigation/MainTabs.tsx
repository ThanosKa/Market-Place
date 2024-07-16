import React, { useCallback, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationProp } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { GestureResponderEvent, TouchableOpacity } from "react-native";
import { MainStackParamList } from "../interfaces/auth/navigation";
import { colors } from "../colors/colors";
import HomeScreen from "../pages/home/home";
import SearchScreen from "../pages/search/search";
import SellScreen from "../pages/sell/sell";
import ActivityScreen from "../pages/activity/activity";
import ProfileScreen from "../pages/profile/profile";

const Tab = createBottomTabNavigator<MainStackParamList>();

const MainTabs = () => {
  const lastTapTimeRef = useRef<{ [key: string]: number }>({});

  const handleDoubleTap = useCallback(
    (navigation: NavigationProp<MainStackParamList>, routeName: string) => {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;
      if (now - (lastTapTimeRef.current[routeName] || 0) < DOUBLE_PRESS_DELAY) {
        navigation.setParams({ [`refresh${routeName}`]: Date.now() });
      }
      lastTapTimeRef.current[routeName] = now;
    },
    []
  );

  const renderTabBarButton = (
    props: any,
    navigation: NavigationProp<MainStackParamList>,
    routeName: string
  ) => (
    <TouchableOpacity
      {...props}
      onPress={(e: GestureResponderEvent) => {
        handleDoubleTap(navigation, routeName);
        if (props.onPress) {
          props.onPress(e);
        }
      }}
    />
  );

  return (
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
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          tabBarButton: (props) =>
            renderTabBarButton(props, navigation, "Home"),
        })}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={({ navigation }) => ({
          tabBarButton: (props) =>
            renderTabBarButton(props, navigation, "Search"),
        })}
      />
      <Tab.Screen name="Sell" component={SellScreen} />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={({ navigation }) => ({
          tabBarButton: (props) =>
            renderTabBarButton(props, navigation, "Activity"),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          tabBarButton: (props) =>
            renderTabBarButton(props, navigation, "Profile"),
        })}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
