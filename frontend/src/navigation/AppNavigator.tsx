import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/home/home";
import SearchScreen from "../screens/search/search";
import SellScreen from "../screens/sell/sell";
import ActivityScreen from "../screens/activity/activity";
import ProfileScreen from "../screens/profile/profile";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{ headerTitle: "Home" }}
    />
    {/* Add other screens for the Home stack if needed */}
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{ tabBarLabel: "Home" }}
        />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Sell" component={SellScreen} />
        <Tab.Screen name="Activity" component={ActivityScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
