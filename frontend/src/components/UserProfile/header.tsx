// components/Header.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import { colors } from "../../colors/colors";

type Props = {
  onBackPress?: () => void;
  onSharePress?: () => void;
  onLikePress?: () => void;
};

const Header: React.FC<Props> = ({
  onBackPress,
  onSharePress,
  onLikePress,
}) => (
  <View style={styles.header}>
    {onBackPress && (
      <TouchableOpacity onPress={onBackPress}>
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </TouchableOpacity>
    )}
    <View style={styles.headerIcons}>
      {onSharePress && (
        <TouchableOpacity onPress={onSharePress} style={styles.iconButton}>
          <Feather name="share" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
      {onLikePress && (
        <TouchableOpacity onPress={onLikePress} style={styles.iconButton}>
          <AntDesign name="hearto" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 35,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 16,
  },
});

export default Header;
