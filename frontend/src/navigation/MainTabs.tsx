import React, { useEffect, useRef } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { RootState } from "../redux/redux";
import { colors } from "../colors/colors";
import HomeScreen from "../pages/home/home";
import SearchScreen from "../pages/search/search";
import SellScreen, { SellScreenRef } from "../pages/sell/sell";
import ActivityScreen from "../pages/activity/activity";
import ProfileScreen from "../pages/profile/profile";
import {
  HomeIcon,
  SearchIcon,
  SellIcon,
  ActivityIcon,
  ProfileIcon,
} from "./TabBarIcons";
import TabBarButton from "./TabBarButton";
import { MainStackParamList } from "../interfaces/auth/navigation";
import { useIsFocused } from "@react-navigation/native";

const Tab = createBottomTabNavigator<MainStackParamList>();

type TabScreenConfig = {
  name: keyof MainStackParamList;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
};

const tabScreens: TabScreenConfig[] = [
  { name: "Home", component: HomeScreen, icon: HomeIcon },
  { name: "Search", component: SearchScreen, icon: SearchIcon },
  { name: "Sell", component: SellScreen, icon: SellIcon },
  { name: "Activity", component: ActivityScreen, icon: ActivityIcon },
  { name: "Profile", component: ProfileScreen, icon: ProfileIcon },
];

const SellScreenWrapper = () => {
  const sellScreenRef = useRef<SellScreenRef>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused && sellScreenRef.current) {
      sellScreenRef.current.resetState();
    }
  }, [isFocused]);

  return <SellScreen ref={sellScreenRef} />;
};

const MainTabs: React.FC = () => {
  const queryClient = useQueryClient();
  const unseenActivitiesCount = useSelector(
    (state: RootState) => state.user.unseenActivitiesCount
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const IconComponent = tabScreens.find(
            (screen) => screen.name === route.name
          )?.icon;
          return IconComponent ? (
            <IconComponent
              focused={focused}
              color={color}
              size={size}
              unseenCount={unseenActivitiesCount}
            />
          ) : null;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        gestureEnabled: false,
        swipeEnabled: false,
        // Hide header and tab bar for Sell screen
        headerShown: route.name !== "Sell",
        tabBarStyle: route.name === "Sell" ? { display: "none" } : undefined,
      })}
    >
      {tabScreens.map(({ name, component }) => (
        <Tab.Screen
          key={name}
          name={name}
          component={name === "Sell" ? SellScreenWrapper : component}
          options={({ navigation }) => ({
            tabBarButton: (props) => (
              <TabBarButton
                props={props}
                navigation={navigation}
                routeName={name}
              />
            ),
          })}
          listeners={{
            tabPress: () => {
              if (name === "Activity" && unseenActivitiesCount > 0) {
                queryClient.invalidateQueries("activities");
              }
            },
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default MainTabs;
