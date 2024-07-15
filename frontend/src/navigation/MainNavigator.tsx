import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainStackParamList } from "../interfaces/auth/navigation";
import MainTabs from "./MainTabs";
import UserProfile from "../components/UserProfile/index";
import ChatScreen from "../components/Chat/chat";
import LikesPage from "../components/LikePage/likePage";
import MessageScreen from "../components/Messages/messageScreen";
import EditProfileScreen from "../pages/EditProfileScreen/editProfile";
import ChangeEmailScreen from "../pages/EditProfileScreen/ChangeEmail/changeEmail";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../colors/colors";
import ChangePasswordScreen from "../pages/EditProfileScreen/ChangePassword/changePassword";

const MainStack = createStackNavigator<MainStackParamList>();

const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="MainTabs" component={MainTabs} />
    <MainStack.Screen name="UserProfile" component={UserProfile} />
    <MainStack.Screen name="Chat" component={ChatScreen} />
    <MainStack.Screen name="Likes" component={LikesPage} />
    <MainStack.Screen name="Messages" component={MessageScreen} />

    <MainStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={({ navigation }) => ({
        headerShown: true,
        headerTitle: "Edit Profile",
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons
              name="chevron-back-sharp"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        ),
        headerBackTitle: " ",
        headerStyle: {
          backgroundColor: "white",
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    />
    <MainStack.Screen
      name="ChangePasswordScreen"
      component={ChangePasswordScreen}
      options={({ navigation }) => ({
        headerShown: true,
        headerTitle: "Change password",
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons
              name="chevron-back-sharp"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        ),
        headerBackTitle: " ",
        headerStyle: {
          backgroundColor: "white",
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    />
    <MainStack.Screen
      name="ChangeEmailScreen"
      component={ChangeEmailScreen}
      options={({ navigation }) => ({
        headerShown: true,
        headerTitle: "Change email",
        headerTitleAlign: "center",
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons
              name="chevron-back-sharp"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        ),
        headerBackTitle: " ",
        headerStyle: {
          backgroundColor: "white",
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    />
  </MainStack.Navigator>
);

export default MainNavigator;
