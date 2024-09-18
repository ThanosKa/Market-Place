import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { RootState } from "../redux/redux";
import { colors } from "../colors/colors";
import HomeScreen from "../pages/home/home";
import SearchScreen from "../pages/search/search";
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
import { useNavigation } from "@react-navigation/native";
import SellProductScreen from "../pages/sell/TabSellScreen";
import { StackNavigationProp } from "@react-navigation/stack";
import { UnseenActivitiesProvider } from "../components/UnseenActivities/UnseenActivities";

const Tab = createBottomTabNavigator<MainStackParamList>();

type TabScreenConfig = {
  name: keyof MainStackParamList;
  component: React.ComponentType<any>;
  icon: React.ComponentType<any>;
};

const tabScreens: TabScreenConfig[] = [
  { name: "Home", component: HomeScreen, icon: HomeIcon },
  { name: "Search", component: SearchScreen, icon: SearchIcon },
  { name: "Sell", component: SellProductScreen, icon: SellIcon },
  { name: "Activity", component: ActivityScreen, icon: ActivityIcon },
  { name: "Profile", component: ProfileScreen, icon: ProfileIcon },
];

const MainTabs: React.FC = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const unseenActivitiesCount = useSelector(
    (state: RootState) => state.user.unseenActivitiesCount
  );

  return (
    <UnseenActivitiesProvider>
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
          headerShown: true,
        })}
      >
        {tabScreens.map(({ name, component }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
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
              tabPress: (e) => {
                if (name === "Sell") {
                  e.preventDefault();
                  navigation.navigate("SellProduct");
                } else if (name === "Activity" && unseenActivitiesCount > 0) {
                  queryClient.invalidateQueries("activities");
                }
              },
            }}
          />
        ))}
      </Tab.Navigator>
    </UnseenActivitiesProvider>
  );
};

export default MainTabs;
