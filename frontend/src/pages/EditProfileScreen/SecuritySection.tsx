import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";

type SecuritySectionNavigationProp = StackNavigationProp<
  MainStackParamList,
  "EditProfile"
>;

type Props = {
  navigation: SecuritySectionNavigationProp;
};

const SecuritySection: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{t("account-privacy")}</Text>
      <TouchableOpacity
        style={styles.securityButton}
        onPress={() => navigation.navigate("ChangeEmailScreen")}
      >
        <Text style={styles.securityButtonText}>{t("change-email")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.securityButton}
        onPress={() => navigation.navigate("ChangePasswordScreen")}
      >
        <Text style={styles.securityButtonText}>{t("change-password")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingTop: 20,
    borderTopWidth: 10,
    borderTopColor: colors.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 10,
    height: 40,
    padding: 8,
  },
  securityButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  securityButtonText: {
    color: colors.customBlue,
    fontSize: 16,
  },
});

export default SecuritySection;
