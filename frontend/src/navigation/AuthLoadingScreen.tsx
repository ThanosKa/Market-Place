import React, { useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuthToken, logout } from "../services/authStorage";
import { RootStackParamList } from "../interfaces/auth/navigation";
import { QueryClient } from "react-query";
import i18n from "../utils/i18n";
import { colors } from "../colors/colors";
import { refreshAuthToken } from "../services/auth";

type AuthLoadingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "AuthLoading">;
};

const queryClient = new QueryClient();

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  navigation,
}) => {
  useEffect(() => {
    const checkToken = async () => {
      try {
        const { token, expirationTime } = await getAuthToken();

        if (token && expirationTime) {
          if (Date.now() < expirationTime) {
            navigation.replace("Main");
          } else {
            // Token is expired, attempt to refresh
            const newToken = await refreshAuthToken();
            if (newToken) {
              navigation.replace("Main");
            } else {
              await handleLogout();
            }
          }
        } else {
          navigation.replace("Auth");
        }
      } catch (error) {
        console.error("Error checking token:", error);
        await handleLogout();
      }
    };

    checkToken();
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await logout();
      queryClient.clear();
      Alert.alert(
        i18n.t("sessionTimeoutTitle"),
        i18n.t("sessionTimeoutMessage"),
        [
          {
            text: i18n.t("ok"),
            onPress: () => {
              navigation.replace("Auth");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error during logout:", error);
      navigation.replace("Auth");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="small" color={colors.secondary} />
    </View>
  );
};

export default AuthLoadingScreen;
