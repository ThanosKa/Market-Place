export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

export interface ChatMessage {
  _id: string;
  content: string;
  images: string[];
  timestamp: Date;
  seen: boolean;
  isOwnMessage: boolean;
  sender: User | null;
}

export interface Chat {
  _id: string;
  otherParticipant: User;
  lastMessage: {
    content: string;
    sender: string;
    timestamp: Date;
    seen: boolean;
    isOwnMessage: boolean;
  };
  unreadCount: number;
}

export interface ChatDetails {
  _id: string;
  otherParticipant: User;
  messages: ChatMessage[];
}
