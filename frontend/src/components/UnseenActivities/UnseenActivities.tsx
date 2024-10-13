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
      if (
        data &&
        data.data &&
        data.data.activities &&
        data.data.activities.unseenCount !== undefined
      ) {
        dispatch(setUnseenActivitiesCount(data.data.activities.unseenCount));
      } else {
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
