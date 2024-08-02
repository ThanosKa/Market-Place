// chatUtils.ts

import { InfiniteData, QueryClient } from "react-query";
import { ChatMessage, PaginatedChatDetails, User } from "../../interfaces/chat";

export const updateQueryDataWithNewMessage = (
  queryClient: QueryClient,
  chatId: string,
  newMessage: ChatMessage
) => {
  queryClient.setQueryData<InfiniteData<PaginatedChatDetails>>(
    ["chatMessages", chatId],
    (oldData): InfiniteData<PaginatedChatDetails> => {
      if (!oldData) {
        return {
          pages: [
            {
              _id: chatId,
              otherParticipant: {} as User,
              messages: [newMessage],
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          ],
          pageParams: [undefined],
        };
      }

      const newPages = [...oldData.pages];
      newPages[0] = {
        ...newPages[0],
        messages: [newMessage, ...newPages[0].messages],
      };
      return { ...oldData, pages: newPages };
    }
  );
};

export const updateQueryDataWithServerResponse = (
  queryClient: QueryClient,
  chatId: string,
  data: ChatMessage,
  tempId: string,
  imageUris: string[]
) => {
  queryClient.setQueryData<InfiniteData<PaginatedChatDetails>>(
    ["chatMessages", chatId],
    (oldData): InfiniteData<PaginatedChatDetails> => {
      if (!oldData) {
        return {
          pages: [
            {
              _id: chatId,
              otherParticipant: {} as User,
              messages: [{ ...data, isOwnMessage: true, images: imageUris }],
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          ],
          pageParams: [undefined],
        };
      }

      const newPages = [...oldData.pages];
      newPages[0] = {
        ...newPages[0],
        messages: newPages[0].messages.map((msg) =>
          msg._id === tempId
            ? { ...data, isOwnMessage: true, images: imageUris }
            : msg
        ),
      };
      return { ...oldData, pages: newPages };
    }
  );
};
