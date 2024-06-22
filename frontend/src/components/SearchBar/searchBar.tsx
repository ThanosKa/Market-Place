import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";

type SearchBarProps = {
  onHeartPress: () => void;
  onChatPress: () => void;
};

const DummySearchBar: React.FC<SearchBarProps> = ({
  onHeartPress,
  onChatPress,
}) => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate("Search")}
      >
        <Ionicons
          name="search"
          size={24}
          color={colors.primary}
          style={styles.searchIcon}
        />
        <Text style={styles.placeholder}>{t("search-products")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onHeartPress} style={styles.iconButton}>
        <Ionicons name="heart-outline" size={26} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onChatPress} style={styles.iconButton}>
        <Ionicons name="chatbubble-outline" size={26} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  placeholder: {
    flex: 1,
    color: "#888",
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default DummySearchBar;
