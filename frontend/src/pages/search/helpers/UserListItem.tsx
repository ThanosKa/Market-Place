// helpers/UserListItem.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../../colors/colors";

interface UserListItemProps {
  user: {
    profilePicture: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  onPress: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: user.profilePicture }}
        style={styles.profilePicture}
      />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  name: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
});

export default UserListItem;
