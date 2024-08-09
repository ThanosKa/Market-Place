import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "../../interfaces/user";
import { colors } from "../../colors/colors";
import { BASE_URL } from "../../services/axiosConfig";
import { getActivityMessage } from "./helper";
import { getTranslatableTimeString } from "./activityUtils";
import { useTranslation } from "react-i18next";

interface ActivityItemProps {
  item: Activity;
  onDelete: (id: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item, onDelete }) => {
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.deleteButtonContainer,
          { transform: [{ translateX: trans }] },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item._id)}
        >
          <Ionicons name="trash-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  const { t } = useTranslation();

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View
        style={[styles.activityItem, !item.read && styles.unreadActivityItem]}
      >
        {!item.read && <View style={styles.unseenDot} />}
        <Image
          source={{ uri: `${BASE_URL}/${item.sender.profilePicture}` }}
          style={styles.profileImage}
        />
        <View style={styles.activityContent}>
          <Text style={styles.userName}>
            {item.sender.firstName} {item.sender.lastName}
          </Text>
          <Text style={styles.activityMessage}>
            {getActivityMessage(item.type)}
          </Text>
          <Text style={styles.timestamp}>
            {getTranslatableTimeString(new Date(item.createdAt), t)}
          </Text>
        </View>
        {item.type === "product_like" && item.product && (
          <Image
            source={{ uri: `${BASE_URL}${item.product.images[0]}` }}
            style={styles.productImage}
          />
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  unreadActivityItem: {
    backgroundColor: colors.lighterBlue,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  activityMessage: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 4,
  },
  unseenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.customBlue,
    marginRight: 8,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 12,
  },
  deleteButtonContainer: {
    width: 80,
    height: "100%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    // borderRadius: 30,
  },
});

export default ActivityItem;
