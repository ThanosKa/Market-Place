import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Swipeable } from "react-native-gesture-handler";
import { colors } from "../../colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Activity, User } from "../../interfaces/user";
import { BASE_URL } from "../../services/axiosConfig";
import {
  useNavigation,
  RouteProp,
  NavigationProp,
  useIsFocused,
  useFocusEffect,
} from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { groupActivities, getActivityMessage, getSections } from "./helper";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { useDispatch } from "react-redux";
import {
  deleteActivity,
  getActivities,
  GetActivitiesResponse,
  markAllActivitiesAsRead,
} from "../../services/activity";
import { setUnseenActivitiesCount } from "../../redux/useSlice";
import { useQuery } from "react-query";

type ActivityScreenRouteProp = RouteProp<MainStackParamList, "Activity">;
type ActivityScreenNavigationProp = NavigationProp<
  MainStackParamList,
  "Activity"
>;

interface ActivityScreenProps {
  route: ActivityScreenRouteProp;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({
  route: propRoute,
}) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [localActivities, setLocalActivities] = useState<Activity[]>([]);
  const dispatch = useDispatch();
  const navigation = useNavigation<ActivityScreenNavigationProp>();
  const isFocused = useIsFocused();
  // const { data, isLoading, error, refetch } = useLoggedUser();
  const { data, isLoading, error, refetch } = useQuery<
    GetActivitiesResponse,
    Error
  >("activities", getActivities, {
    onSuccess: (data) => {
      dispatch(setUnseenActivitiesCount(data?.data.unseenCount));
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  useFocusEffect(
    React.useCallback(() => {
      refetch();
      return () => {
        // Optional cleanup
      };
    }, [refetch])
  );
  useEffect(() => {
    refetch();
  }, []);
  useEffect(() => {
    if (data?.data.activities.items) {
      setLocalActivities(data?.data.activities.items);
    }
  }, [data?.data]);

  const updateUnseenCount = useCallback(
    (count: number) => {
      dispatch(setUnseenActivitiesCount(count));
      navigation.setParams({ unseenCount: count });
    },
    [dispatch, navigation]
  );

  useEffect(() => {
    if (isFocused) {
      updateUnseenCount(0);
    }
  }, [isFocused, updateUnseenCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllActivitiesAsRead();
      setLocalActivities((prev) => prev.map((a) => ({ ...a, read: true })));
      updateUnseenCount(0);
    } catch (error) {
      console.error("Error marking all activities as read:", error);
    }
  }, [updateUnseenCount]);

  useEffect(() => {
    const markAllReadOnBlur = navigation.addListener("blur", markAllAsRead);
    return () => markAllReadOnBlur();
  }, [navigation, markAllAsRead]);

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteActivity(id);
      setLocalActivities((prev) => prev.filter((a) => a._id !== id));
      const unseenCount = localActivities.filter(
        (a) => !a.read && a._id !== id
      ).length;
      updateUnseenCount(unseenCount);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
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
            onPress={() => handleDeleteItem(item._id)}
          >
            <Ionicons name="trash-outline" size={24} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>
      );
    };

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
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    if (propRoute.params?.refreshActivity) {
      onRefresh();
    }
  }, [propRoute.params?.refreshActivity, onRefresh]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t("Error loading activities")}</Text>
      </View>
    );
  }

  const groupedActivities = groupActivities(localActivities);

  return (
    <View style={styles.container}>
      <Text style={styles.notificationTitle}>{t("Notifications")}</Text>
      <FlatList
        data={getSections(groupedActivities)}
        renderItem={({ item }) => (
          <>
            {item.data.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{item.title}</Text>
                </View>
                {item.data.map((activity) => (
                  <React.Fragment key={activity._id}>
                    {renderActivityItem({ item: activity })}
                  </React.Fragment>
                ))}
              </>
            )}
          </>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t("No activities yet")}</Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 6,
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  sectionHeader: {
    padding: 8,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    // borderRadius: 12,
    // marginBottom: 12,
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
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.secondary,
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
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});

export default ActivityScreen;
