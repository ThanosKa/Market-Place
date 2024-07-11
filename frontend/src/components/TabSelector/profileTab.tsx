import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";
import { User } from "../../interfaces/user";
import { removeAuthToken } from "../../services/authStorage";
import { useQueryClient } from "react-query";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  MainStackParamList,
  RootStackParamList,
} from "../../interfaces/auth/navigation";

type CombinedParamList = RootStackParamList & MainStackParamList;

type Props = {
  user: User;
  navigation: StackNavigationProp<CombinedParamList>;
};

const ProfileTab: React.FC<Props> = ({ user, navigation }) => {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get("window").width;
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    Alert.alert(t("logout"), t("logout-confirmation"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("yes"),
        onPress: async () => {
          try {
            await removeAuthToken();
            queryClient.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: "AuthLoading" }],
            });
          } catch (error) {
            console.error("Error logging out:", error);
            Alert.alert(t("error"), t("logout-error"));
          }
        },
      },
    ]);
  };

  const renderSection = (
    title: string,
    items: { label: string; onPress: () => void }[],
    isDanger: boolean = false
  ) => (
    <View style={styles.section}>
      <View
        style={[
          styles.sectionTitleContainer,
          {
            width: screenWidth,
            backgroundColor: colors.lightGray,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
          {title}
        </Text>
      </View>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.item, index === items.length - 1 && styles.lastItem]}
          onPress={item.onPress}
        >
          <Text style={[styles.itemText, isDanger && styles.dangerText]}>
            {item.label}
          </Text>
          <Ionicons
            name={isDanger ? "trash-outline" : "chevron-forward"}
            size={20}
            color={isDanger ? colors.danger : colors.primary}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderSection(t("transactions"), [
        {
          label: t("purchases"),
          onPress: () => console.log("Navigate to Purchases"),
        },
        { label: t("sales"), onPress: () => console.log("Navigate to Sales") },
        {
          label: t("balance"),
          onPress: () => console.log("Navigate to Balance"),
        },
      ])}
      {renderSection(t("account"), [
        {
          label: t("language"),
          onPress: () => console.log("Open Language settings"),
        },
        {
          label: t("edit-profile"),
          onPress: () => console.log("Open Edit Profile"),
        },
        {
          label: t("shipping-address"),
          onPress: () => console.log("Open Shipping Address settings"),
        },
        { label: t("logout"), onPress: handleLogout },
      ])}
      {renderSection(
        t("danger-zone"),
        [
          {
            label: t("delete-account"),
            onPress: () => console.log("Open Delete Account confirmation"),
          },
        ],
        true
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitleContainer: {
    height: 60,
    justifyContent: "center",
    marginBottom: 12,
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemText: {
    fontSize: 16,
    color: colors.primary,
  },
  dangerText: {
    color: colors.danger,
  },
});

export default ProfileTab;
