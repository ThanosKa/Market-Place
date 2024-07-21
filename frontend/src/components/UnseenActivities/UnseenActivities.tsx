// src/components/UnseenActivitiesProvider.tsx
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLoggedUser } from "../../hooks/useLoggedUser";
import { setUnseenActivitiesCount } from "../../redux/useSlice";

interface UnseenActivitiesProviderProps {
  children: React.ReactNode;
}

export const UnseenActivitiesProvider: React.FC<
  UnseenActivitiesProviderProps
> = ({ children }) => {
  const dispatch = useDispatch();
  const { data: userData, isLoading } = useLoggedUser();
  useEffect(() => {
    if (userData?.data.user.activities.unseenCount !== undefined) {
      dispatch(
        setUnseenActivitiesCount(userData.data.user.activities.unseenCount)
      );
    }
  }, [userData, dispatch]);

  if (isLoading) {
    return null; // Or a loading indicator if you prefer
  }

  return <>{children}</>;
};
