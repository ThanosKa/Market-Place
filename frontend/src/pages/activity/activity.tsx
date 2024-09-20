import React, { useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../colors/colors";
import {
  RouteProp,
  useNavigation,
  useScrollToTop,
} from "@react-navigation/native";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { useActivityManagement } from "./useActivityManagement";
import ActivityItem from "./ActivityItem";
import { getSections, groupActivities } from "./helper";
import FlexibleSkeleton from "../../components/Skeleton/FlexibleSkeleton";

type ActivityScreenRouteProp = RouteProp<MainStackParamList, "Activity">;

interface ActivityScreenProps {
  route: ActivityScreenRouteProp;
}

const ActivityScreen: React.FC<ActivityScreenProps> = ({
  route: propRoute,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const {
    localActivities,
    isLoading,
    error,
    refetch,
    markAllAsRead,
    handleDeleteItem,
  } = useActivityManagement();

  const [refreshing, setRefreshing] = React.useState(false);
  const flatListRef = useRef(null);
  useScrollToTop(flatListRef);

  useEffect(() => {
    const markAllReadOnBlur = navigation.addListener("blur", markAllAsRead);
    return () => markAllReadOnBlur();
  }, [navigation, markAllAsRead]);

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
        ref={flatListRef}
        data={getSections(groupedActivities)}
        renderItem={({ item }) => (
          <>
            {item.data.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{item.title}</Text>
                </View>
                {isLoading ? (
                  <FlexibleSkeleton
                    type="search"
                    itemCount={10}
                    hasProfileImage={true}
                    profileImagePosition="left"
                    contentLines={1}
                  />
                ) : (
                  item.data.map((activity) => (
                    <ActivityItem
                      key={activity._id}
                      item={activity}
                      onDelete={handleDeleteItem}
                    />
                  ))
                )}
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
    backgroundColor: colors.background,
    padding: 6,
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
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.secondary,
  },
});

export default ActivityScreen;
