import { useState, useCallback, useEffect } from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import {
  useNavigation,
  useIsFocused,
  NavigationProp,
} from "@react-navigation/native";
import { Activity } from "../../interfaces/user";
import { MainStackParamList } from "../../interfaces/auth/navigation"; // Adjust this import path as needed
import {
  getActivities,
  GetActivitiesResponse,
  deleteActivity,
  markAllActivitiesAsRead,
} from "../../services/activity";
import { setUnseenActivitiesCount } from "../../redux/useSlice";
import {
  updateLocalActivities,
  removeActivityFromLocal,
  getUnseenCount,
} from "./activityUtils";

type ActivityScreenNavigationProp = NavigationProp<
  MainStackParamList,
  "Activity"
>;

export const useActivityManagement = () => {
  const [localActivities, setLocalActivities] = useState<Activity[]>([]);
  const dispatch = useDispatch();
  const navigation = useNavigation<ActivityScreenNavigationProp>();
  const isFocused = useIsFocused();

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

  useEffect(() => {
    if (data?.data.activities.items) {
      setLocalActivities(data.data.activities.items);
    }
  }, [data?.data]);

  const updateUnseenCount = useCallback(
    (count: number) => {
      dispatch(setUnseenActivitiesCount(count));
      navigation.setParams({ unseenCount: count } as any);
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

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteActivity(id);
      setLocalActivities((prev) => removeActivityFromLocal(prev, id));
      const unseenCount = getUnseenCount(localActivities);
      updateUnseenCount(unseenCount);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  return {
    localActivities,
    isLoading,
    error,
    refetch,
    markAllAsRead,
    handleDeleteItem,
  };
};
