import React, { useState } from "react";
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
import { Activity } from "../../interfaces/user";
import { colors } from "../../colors/colors";
import { BASE_URL } from "../../services/axiosConfig";
import { getActivityMessage } from "./helper";
import { getTranslatableTimeString } from "./activityUtils";
import { useTranslation } from "react-i18next";
import UndefProfPicture from "../../components/UndefProfPicture/UndefProfPicture";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import ReviewModal from "./ReviewModal";

interface ActivityItemProps {
  item: Activity;
  onDelete: (id: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item, onDelete }) => {
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

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

  const renderProfilePicture = () => {
    if (item.sender.profilePicture) {
      return (
        <Image
          source={{ uri: `${item.sender.profilePicture}` }}
          style={styles.profileImage}
        />
      );
    } else {
      return (
        <View style={styles.profileImage}>
          <UndefProfPicture size={50} iconSize={25} />
        </View>
      );
    }
  };

  const handleActivityPress = () => {
    console.log("Activity type:", item.type);

    if (item.type === "review_prompt") {
      if (item.reviewDone) {
        Toast.show({
          type: "info",
          text1: t("review-done"),
          text2: t("you-have-already-reviewed-this-product"),
          position: "bottom",
          visibilityTime: 3000,
          bottomOffset: 110,
        });
      } else {
        setReviewModalVisible(true);
      }
    } else if (item.type === "review") {
      navigation.navigate("Profile", {});
    } else if (item.type === "product_like" && !item.product) {
      Toast.show({
        type: "info",
        text1: t("could-not-find-product"),
        text2: t("product-deleted"),
        position: "bottom",
        visibilityTime: 3000,
        bottomOffset: 110,
      });
    } else if (item.type === "profile_like") {
      navigation.navigate("Profile", {});
    } else if (
      (item.type === "product_like" || item.type === "product_purchased") &&
      item.product
    ) {
      if (item.product._id) {
        navigation.navigate("Product", { productId: item.product._id });
      }
    }
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity onPress={handleActivityPress}>
        <View
          style={[styles.activityItem, !item.read && styles.unreadActivityItem]}
        >
          {!item.read && <View style={styles.unseenDot} />}
          {renderProfilePicture()}
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
          {(item.type === "product_like" ||
            item.type === "review_prompt" ||
            item.type === "product_purchased" ||
            item.type === "review") &&
            item.product && (
              <Image
                source={{ uri: `${item.product.images[0]}` }}
                style={styles.productImage}
              />
            )}
        </View>
      </TouchableOpacity>
      <ReviewModal
        isVisible={isReviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        productId={item.product?._id}
        productName={item.product?.title}
        productImage={item.product?.images[0]}
        revieweeId={item.sender._id} // Add this line to pass the seller's ID
      />
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
  },
});

export default ActivityItem;
