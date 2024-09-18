import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainStackParamList } from "../interfaces/auth/navigation";
import MainTabs from "./MainTabs";
import LikesPage from "../pages/LikePage/likePage";
import EditProfileScreen from "../pages/EditProfileScreen/editProfile";
import ChangeEmailScreen from "../pages/EditProfileScreen/ChangeEmail/changeEmail";
import { Text, TouchableOpacity } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { colors } from "../colors/colors";
import ChangePasswordScreen from "../pages/EditProfileScreen/ChangePassword/changePassword";
import UserProfileScreen from "../pages/UserProfile/userProfile";
import { UnseenActivitiesProvider } from "../components/UnseenActivities/UnseenActivities";
import { useTranslation } from "react-i18next";
import SellScreen from "../pages/sell/SellScreen";
import MessageScreen from "../pages/MessagesScreen/MessagesScreen";
import ChatScreen from "../pages/ChatScreen/chatScreen";
import ProductScreen from "../pages/ProductScreen/productScreen";
import PurchasesScreen from "../pages/PurchasesScreen/purchases";
import SalesScreen from "../pages/SalesScreen/sales";
const MainStack = createStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  const { t } = useTranslation();

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
        <MainStack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: t("messages"),
            headerTitleAlign: "left",
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
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: colors.primary,
          })}
        />
        <MainStack.Screen
          name="Messages"
          component={MessageScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: t("messages"),
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
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: colors.primary,
          })}
        />
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
        <MainStack.Screen
          name="Product"
          component={ProductScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: t("product"),
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
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: colors.primary,
          })}
        />
        <MainStack.Screen
          name="Purchases"
          component={PurchasesScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: t("purchases"),
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
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: colors.primary,
          })}
        />
        <MainStack.Screen
          name="Sales"
          component={SalesScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: t("sales"),
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
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: colors.primary,
          })}
        />
      </MainStack.Navigator>
    </UnseenActivitiesProvider>
  );
};

export default MainNavigator;
