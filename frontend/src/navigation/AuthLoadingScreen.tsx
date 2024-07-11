import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuthToken, removeAuthToken } from "../services/authStorage";
import { RootStackParamList } from "../interfaces/auth/navigation";

type AuthLoadingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "AuthLoading">;
};

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
          await removeAuthToken();
          navigation.replace("Auth");
        }
      } else {
        navigation.replace("Auth");
      }
    };

    checkToken();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default AuthLoadingScreen;
