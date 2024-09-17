import { useState, useCallback, useEffect } from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Activity } from "../../interfaces/user";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import {
  getActivities,
  GetActivitiesResponse,
  deleteActivity,
  markAllActivitiesAsRead,
} from "../../services/activity";
import { setUnseenActivitiesCount } from "../../redux/useSlice";

export const useActivityManagement = () => {
  const [localActivities, setLocalActivities] = useState<Activity[]>([]);
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
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
      setLocalActivities((prev) =>
        prev.filter((activity) => activity._id !== id)
      );
      const unseenCount = localActivities.filter((a) => !a.read).length - 1;
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
    navigation,
  };
};
