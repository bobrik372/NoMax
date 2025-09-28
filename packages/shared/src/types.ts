export type UserPublic = {
  username: string; // unique, editable
  displayName: string; // ≤ 35
  nickname: string; // starts with !, editable
  avatarUrl: string | null;
};

export type MessageType = "text" | "image" | "video" | "audio";

export type Message = {
  id: string;
  chatId: string;
  senderUsername: string;
  recipientUsername: string;
  type: MessageType;
  contentText?: string;
  mediaUrl?: string;
  createdAt: string; // ISO
  deliveredAt?: string;
  readAt?: string;
};

export type AuthTokens = {
  accessToken: string;
};

export type Settings = {
  theme: "light" | "dark";
  fontScale: number; // 0.8..1.4
  language: "ru" | "en";
};