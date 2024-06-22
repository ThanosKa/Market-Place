// components/CategoryIcon.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../colors/colors";

type CategoryIconProps = {
  label: string;
  iconName: string;
  isSelected: boolean;
  onPress: () => void;
};

const CategoryIcon: React.FC<CategoryIconProps> = ({
  label,
  iconName,
  isSelected,
  onPress,
}) => {
  const words = label.split(" ");
  const firstLine = words.slice(0, 2).join(" ");
  const secondLine = words.slice(2).join(" ");

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={iconName as any}
          size={28}
          color={isSelected ? colors.primary : colors.secondary}
        />
      </View>
      <View style={styles.labelContainer}>
        <Text
          style={[
            styles.label,
            { color: isSelected ? colors.primary : colors.secondary },
          ]}
        >
          {firstLine}
        </Text>
        {secondLine && (
          <Text
            style={[
              styles.label,
              { color: isSelected ? colors.primary : colors.secondary },
            ]}
          >
            {secondLine}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    margin: 5,
    width: 80,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    textAlign: "center",
  },
});

export default CategoryIcon;
