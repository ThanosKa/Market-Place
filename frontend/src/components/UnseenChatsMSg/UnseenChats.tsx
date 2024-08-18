import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQuery } from "react-query";
import { setUnreadChatsCount } from "../../redux/useSlice";
import { getUnreadChatsCount } from "../../services/chat";

interface UnreadChatsProviderProps {
  children: React.ReactNode;
}

export const UnreadChatsProvider: React.FC<UnreadChatsProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch();

  const { refetch } = useQuery("unreadChatsCount", getUnreadChatsCount, {
    onSuccess: (data) => {
      if (data && data.data && data.data.unreadChatsCount !== undefined) {
        dispatch(setUnreadChatsCount(data.data.unreadChatsCount));
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    // Refetch unread chats count when the component mounts
    refetch();
  }, [refetch]);

  return <>{children}</>;
};
