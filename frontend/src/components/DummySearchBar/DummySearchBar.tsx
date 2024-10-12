import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { colors } from "../../colors/colors";
import { RootState } from "../../redux/redux";

interface DummySearchBarProps {
  placeholder: string;
}

const DummySearchBar: React.FC<DummySearchBarProps> = ({ placeholder }) => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  const { t } = useTranslation();
  const unreadChatsCount = useSelector(
    (state: RootState) => state.user.unreadChatsCount
  );

  const handleHeartPress = () => {
    navigation.navigate("Likes");
  };

  const handleChatPress = () => {
    navigation.navigate("Messages");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() =>
          navigation.navigate("Search", { refreshSearch: Date.now() })
        }
      >
        <Ionicons
          name="search"
          size={24}
          color={colors.primary}
          style={styles.searchIcon}
        />
        <Text style={styles.placeholder}>{placeholder}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleHeartPress} style={styles.iconButton}>
        <Ionicons name="heart-outline" size={26} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleChatPress} style={styles.iconButton}>
        <Ionicons name="chatbubble-outline" size={26} color={colors.primary} />
        {unreadChatsCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadChatsCount}</Text>
          </View>
        )}
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
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -3,
    backgroundColor: "red",
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default DummySearchBar;
