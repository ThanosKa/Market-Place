import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainStackParamList } from "../interfaces/auth/navigation";
import MainTabs from "./MainTabs";
import ChatScreen from "../components/Chat/chat";
import LikesPage from "../pages/LikePage/likePage";
import MessageScreen from "../components/Messages/messageScreen";
import EditProfileScreen from "../pages/EditProfileScreen/editProfile";
import ChangeEmailScreen from "../pages/EditProfileScreen/ChangeEmail/changeEmail";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { colors } from "../colors/colors";
import ChangePasswordScreen from "../pages/EditProfileScreen/ChangePassword/changePassword";
import UserProfileScreen from "../pages/UserProfile/userProfile";
import { UnseenActivitiesProvider } from "../components/UnseenActivities/UnseenActivities";
import { useLoggedUser } from "../hooks/useLoggedUser";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import SellScreen from "../pages/sell/SellScreen";
const MainStack = createStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  const { refetch } = useLoggedUser();
  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );
  return (
    <UnseenActivitiesProvider>
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <MainStack.Screen
          name="MainTabs"
          options={{
            gestureEnabled: false,
          }}
          component={MainTabs}
        />
        <MainStack.Screen
          name="UserProfile"
          component={UserProfileScreen}
          options={({ route, navigation }) => ({
            headerShown: true,
            headerTitle: () => (
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                {route.params.firstName || ""} {route.params.lastName || ""}
              </Text>
            ),
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
            headerStyle: {
              backgroundColor: "white",
            },
            headerTintColor: colors.primary,
          })}
        />
        <MainStack.Screen name="Chat" component={ChatScreen} />
        {/* <MainStack.Screen name="Likes" component={LikesPage} /> */}
        <MainStack.Screen name="Messages" component={MessageScreen} />
        <MainStack.Screen
          name="Likes"
          component={LikesPage}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: t("favorites"),
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
            headerStyle: {
              backgroundColor: "white",
              elevation: 0, // for Android
              shadowOpacity: 0, // for iOS
              borderBottomWidth: 0, // for iOS
            },
            headerTintColor: colors.primary,
          })}
        />
        <MainStack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: t("edit-profile"),

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
            headerTitle: t("change-password"),

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
            headerTitle: t("change-email"),

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
          name="SellProduct"
          component={SellScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: t("sell-product"),

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
    </UnseenActivitiesProvider>
  );
};

export default MainNavigator;
