import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQuery } from "react-query";
import { setUnseenActivitiesCount } from "../../redux/useSlice";
import { getActivities } from "../../services/activity";

interface UnseenActivitiesProviderProps {
  children: React.ReactNode;
}

export const UnseenActivitiesProvider: React.FC<
  UnseenActivitiesProviderProps
> = ({ children }) => {
  const dispatch = useDispatch();

  const { isLoading, refetch } = useQuery("activities", getActivities, {
    onSuccess: (data) => {
      // console.log("Received data:", data);
      if (
        data &&
        data.data &&
        data.data.activities &&
        data.data.activities.unseenCount !== undefined
      ) {
        // console.log("Unseen count:", data.data.activities.unseenCount);
        dispatch(setUnseenActivitiesCount(data.data.activities.unseenCount));
      } else {
        // console.log("Unseen count not found in the expected structure:", data);
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return null; // Or a loading indicator
  }

  return <>{children}</>;
};
