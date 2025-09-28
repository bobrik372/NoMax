import { z } from "zod";

export const Username = z
  .string()
  .regex(/^[a-z0-9_]{3,10}$/);

export const Nickname = z
  .string()
  .regex(/^![a-z0-9_]{3,32}$/);

export const DisplayName = z
  .string()
  .min(1)
  .max(35);

export const SettingsSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  fontScale: z.number().min(0.8).max(1.4).default(1),
  language: z.enum(["ru", "en"]).default("ru"),
});

export const RegisterResponse = z.object({
  passphrase: z.string(),
});

export const LoginRequest = z.object({
  passphrase: z.string(),
});

export const LoginResponse = z.object({
  accessToken: z.string(),
  user: z.object({
    username: Username,
    displayName: DisplayName,
    nickname: Nickname,
    avatarUrl: z.string().nullable(),
  }),
});

export const ChangePasswordRequest = z.object({
  currentPassphrase: z.string(),
  newPassphrase: z.string(),
});

export const SendMessageRequest = z.object({
  to: Username,
  type: z.enum(["text", "image", "video", "audio"]),
  text: z.string().optional(),
  mediaId: z.string().optional(),
});

export const SearchRequest = z.object({
  q: z.string(),
});

export const BlockRequest = z.object({
  username: Username,
});