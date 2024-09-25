import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
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

  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
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
  );

  const SectionItem: React.FC<{
    label: string;
    onPress: () => void;
    isDanger?: boolean;
    isLast?: boolean;
    balance?: number;
  }> = ({ label, onPress, isDanger = false, isLast = false, balance }) => (
    <TouchableOpacity
      style={[styles.item, isLast && styles.lastItem]}
      onPress={onPress}
    >
      <View style={styles.labelContainer}>
        <Text style={[styles.itemText, isDanger && styles.dangerText]}>
          {label}
        </Text>
        {balance !== undefined && (
          <Text style={styles.balanceText}>{` ${balance.toFixed(2)} $`}</Text>
        )}
      </View>
      <Ionicons
        name={isDanger ? "trash-outline" : "chevron-forward"}
        size={20}
        color={isDanger ? colors.danger : colors.primary}
      />
    </TouchableOpacity>
  );

  const TransactionsSection = () => (
    <View style={styles.section}>
      <SectionTitle title={t("transactions")} />
      <SectionItem
        label={t("purchases")}
        onPress={() => navigation.navigate("Purchases")}
      />
      <SectionItem
        label={t("sales")}
        onPress={() => navigation.navigate("Sales")}
      />
      <SectionItem
        label={t("balance")}
        onPress={() => console.log("Balance")}
        balance={user.balance}
        isLast
      />
    </View>
  );

  const handleLanguagePress = () => {
    Alert.alert(t("change-language-title"), t("change-language-message"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("continue"),
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]);
  };
  const AccountSection = () => (
    <View style={styles.section}>
      <SectionTitle title={t("account")} />
      <SectionItem label={t("language")} onPress={handleLanguagePress} />
      <SectionItem
        label={t("edit-profile")}
        onPress={() => navigation.navigate("EditProfile")}
      />
      <SectionItem
        label={t("shipping-address")}
        onPress={() => console.log("shipping addres")}
      />
      <SectionItem label={t("logout")} onPress={handleLogout} isLast />
    </View>
  );

  const DangerZoneSection = () => (
    <View style={styles.section}>
      <SectionTitle title={t("danger-zone")} />
      <SectionItem
        label={t("delete-account")}
        onPress={() => console.log("delete-account")}
        isDanger
        isLast
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TransactionsSection />
      <AccountSection />
      <DangerZoneSection />
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
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 14,
    fontWeight: "bold",
  },
});

export default ProfileTab;
