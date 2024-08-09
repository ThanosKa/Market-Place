import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

interface IconProps {
  focused: boolean;
  color: string;
  size: number;
}

interface ActivityIconProps extends IconProps {
  unseenCount: number;
}

export const HomeIcon: React.FC<IconProps> = ({ focused, color, size }) => (
  <Ionicons
    name={focused ? "home-sharp" : "home-outline"}
    size={size}
    color={color}
  />
);

export const SearchIcon: React.FC<IconProps> = ({ focused, color, size }) => (
  <Ionicons
    name={focused ? "search-sharp" : "search-outline"}
    size={size}
    color={color}
  />
);

export const SellIcon: React.FC<IconProps> = ({ focused, color, size }) => (
  <FontAwesome
    name={focused ? "plus-square" : "plus-square-o"}
    size={size}
    color={color}
  />
);

export const ActivityIcon: React.FC<ActivityIconProps> = ({
  focused,
  color,
  size,
  unseenCount,
}) => (
  <View>
    <Ionicons
      name={focused ? "notifications-sharp" : "notifications-outline"}
      size={size}
      color={color}
    />
    {unseenCount > 0 && !focused && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{unseenCount}</Text>
      </View>
    )}
  </View>
);

export const ProfileIcon: React.FC<IconProps> = ({ focused, color, size }) => (
  <FontAwesome name={focused ? "user" : "user-o"} size={size} color={color} />
);

const styles = StyleSheet.create({
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
