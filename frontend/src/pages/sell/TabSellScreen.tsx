import React from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";

const SellProductScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  React.useEffect(() => {
    navigation.navigate("SellProduct");
  }, [navigation]);

  return null;
};

export default SellProductScreen;
