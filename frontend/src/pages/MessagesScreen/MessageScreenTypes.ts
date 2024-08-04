import { Animated } from "react-native";
import { Chat } from "../../interfaces/chat";
import { User } from "../../interfaces/user";
import { TFunction } from "i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../../interfaces/auth/navigation";
import { UseMutationResult } from "react-query";
import { Swipeable } from "react-native-gesture-handler";

export type MessageScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  "Messages"
>;

export interface PaginatedUsersResponse {
  success: number;
  message: string;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface RenderChatItemProps {
  item: Chat;
  navigation: MessageScreenNavigationProp;
  t: TFunction;
  renderRightActions: (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => React.ReactNode;
  closeRow: () => void;
  rowRefs: React.MutableRefObject<{ [key: string]: Swipeable | null }>;
}

export interface RenderUserItemProps {
  item: User;
  chats: Chat[] | undefined;
  createChatMutation: UseMutationResult<Chat, unknown, string, unknown>;
  navigation: MessageScreenNavigationProp;
}

export interface RenderRightActionsProps {
  progress: Animated.AnimatedInterpolation<number>;
  dragX: Animated.AnimatedInterpolation<number>;
  chatId: string;
  handleDeleteChat: (chatId: string) => void;
}
