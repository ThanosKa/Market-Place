import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { User } from "../../interfaces/user";
import { format, isValid } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { colors } from "../../colors/colors";

interface AboutTabProps {
  user: User;
}

const AboutTab: React.FC<AboutTabProps> = ({ user }) => {
  const { t, i18n } = useTranslation();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return t("unknown-date");

    const date = new Date(dateString);
    if (!isValid(date)) return t("unknown-date");

    const locale = i18n.language.startsWith("es") ? es : enUS;
    return format(date, "d MMMM yyyy", { locale });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t("member-since")}</Text>
      <Text style={styles.dateText}>{formatDate(user.createdAt)}</Text>

      {user.bio && user.bio.trim() !== "" && (
        <>
          <Text style={styles.sectionTitle}>{t("bio")}</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AboutTab;
