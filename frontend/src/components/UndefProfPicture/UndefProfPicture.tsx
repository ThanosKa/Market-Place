// components/UndefProfPicture.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../colors/colors";

interface UndefProfPictureProps {
  size?: number;
  iconSize?: number;
  backgroundColor?: string;
  iconColor?: string;
}

const UndefProfPicture: React.FC<UndefProfPictureProps> = ({
  size = 100,
  iconSize = 50,
  backgroundColor = colors.lightGray,
  iconColor = colors.secondary,
}) => {
  return (
    <View
      style={[
        styles.defaultProfileImage,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Feather name="user" size={iconSize} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  defaultProfileImage: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UndefProfPicture;
