// ActivityScreen.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Swipeable } from "react-native-gesture-handler";
import { colors } from "../../colors/colors";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "react-query";
import { formatDistanceToNow } from "date-fns";
import { getLoggedUser } from "../../services/user";
import { Activity, User } from "../../interfaces/user";
import { BASE_URL } from "../../services/axiosConfig";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { groupActivities, getActivityMessage, getSections } from "./helper";

type ActivityScreenRouteProp = RouteProp<MainStackParamList, "Activity">;

const ActivityScreen: React.FC = () => {
  const route = useRoute<ActivityScreenRouteProp>();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<any, Error>(
    "loggedUser",
    getLoggedUser
  );

  const user: User | undefined = data?.data.user;
  const activities: Activity[] = user?.activities?.items || [];
  const groupedActivities = groupActivities(activities);

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const deleteItem = (id: string) => {
      // TODO: Implement delete functionality with API
      console.log("Delete item", id);
    };

    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(item._id)}
      >
        <Ionicons name="trash-outline" size={24} color={colors.white} />
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <View style={styles.activityItem}>
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
          {!item.read && <View style={styles.unseenDot} />}
        </View>
      </Swipeable>
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    if (route.params?.refreshActivity) {
      onRefresh();
    }
  }, [route.params?.refreshActivity, onRefresh]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.notificationTitle}>{t("Notifications")}</Text>
      <FlatList
        data={getSections(groupedActivities)}
        renderItem={({ item }) => (
          <>
            {item.data.length > 0 && (
              <>
                {renderSectionHeader(item.title)}
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
    // backgroundColor: colors.lightGray,
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
    // backgroundColor: colors.white,
    borderBottomColor: colors.secondary,
    borderBottomWidth: 0.5,
    borderRadius: 12,
    marginBottom: 12,
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
  deleteButton: {
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "100%",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  unseenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 8,
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
});

export default ActivityScreen;
