import React, { useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuthToken, removeAuthToken } from "../services/authStorage";
import { RootStackParamList } from "../interfaces/auth/navigation";
import { QueryClient } from "react-query";
import i18n from "../utils/i18n";

type AuthLoadingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "AuthLoading">;
};

const queryClient = new QueryClient();

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  navigation,
}) => {
  useEffect(() => {
    const checkToken = async () => {
      const { token, expirationTime } = await getAuthToken();
      console.log("token: ", token);
      console.log("expirationTime: ", expirationTime);

      if (token && expirationTime) {
        if (Date.now() < expirationTime) {
          navigation.replace("Main");
        } else {
          // Token is expired
          await handleExpiredToken();
        }
      } else {
        navigation.replace("Auth");
      }
    };

    checkToken();
  }, [navigation]);

  const handleExpiredToken = async () => {
    await removeAuthToken();
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
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthLoadingScreen;
