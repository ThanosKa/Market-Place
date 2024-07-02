import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuthToken } from "../services/authStorage";
import { RootStackParamList } from "../interfaces/auth/navigation";

type AuthLoadingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "AuthLoading">;
};

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  navigation,
}) => {
  useEffect(() => {
    const checkToken = async () => {
      const token = await getAuthToken();
      if (token) {
        // TODO: Implement token validation logic here
        navigation.replace("Main");
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
