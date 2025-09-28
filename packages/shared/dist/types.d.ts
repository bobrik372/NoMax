export type UserPublic = {
    username: string;
    displayName: string;
    nickname: string;
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
    createdAt: string;
    deliveredAt?: string;
    readAt?: string;
};
export type AuthTokens = {
    accessToken: string;
};
export type Settings = {
    theme: "light" | "dark";
    fontScale: number;
    language: "ru" | "en";
};
